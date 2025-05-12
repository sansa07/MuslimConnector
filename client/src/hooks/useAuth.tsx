import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/___api/user"],
    queryFn: () => fetch("/___api/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    }).then(res => {
      if (res.status === 401) return null;
      return res.json();
    }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login form values:", credentials);
      
      try {
        // Direkt Express API rotasını çağır, Vite'ı atlatmak için özel rotayı kullan
        const requestUrl = `/api/login?nocache=${Date.now()}`;
        console.log(`Şu URL'e istek gönderiliyor: ${requestUrl}`);
        
        // Headers'ı detaylı ayarla
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("X-Requested-With", "XMLHttpRequest");
        
        const res = await fetch(requestUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(credentials),
          credentials: "include",
          // Vite'ın araya girmesini engellemek için
          cache: "no-store"
        });

        // Ham cevabı debug için konsola yazdıralım
        const text = await res.text();
        console.log("Login API raw response:", text);
        
        // Başlangıçta HTML içeriyor mu kontrol et
        if (text.includes("<!DOCTYPE html>")) {
          console.error("Vite müdahale ediyor, HTML döndürüyor");
          throw new Error("API HTML döndürüyor, JSON bekleniyordu");
        }
        
        // Eğer boş bir yanıt gelirse hata ver
        if (!text.trim()) {
          console.log("Empty response from login API");
          throw new Error("API boş yanıt döndürdü");
        }
        
        try {
          // JSON olarak işlemeyi dene
          const userData = JSON.parse(text);
          console.log("Login API parsed response:", userData);
          
          // İçerdiği bilgileri kontrol edelim
          if (!userData || !userData.id) {
            throw new Error("Geçersiz kullanıcı verisi alındı");
          }
          
          return userData;
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          throw new Error("API yanıtı geçersiz JSON formatında");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: User) => {
      if (!user || Object.keys(user).length === 0) {
        console.log("No valid user data received from login");
        toast({
          title: "Giriş işlemi başarısız",
          description: "Geçersiz yanıt alındı. Lütfen tekrar deneyin.",
          variant: "destructive"
        });
        return;
      }
      
      queryClient.setQueryData(["/___api/user"], user);
      toast({
        title: "Giriş başarılı",
        description: "Hoş geldiniz!",
      });
      
      // Ana sayfaya yönlendir
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Giriş başarısız",
        description: error.message || "Kullanıcı adı veya şifre hatalı",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        console.log("Starting register API request");
        // Özel ___api rotasını kullanıyoruz - Vite bunu yakalayamaz
        const res = await fetch("/___api/register/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        // Yanıtı text olarak alıp kontrol edelim
        const text = await res.text();
        console.log("Register API raw response:", text);
        
        // Eğer boş bir yanıt gelirse boş bir nesne döndür
        if (!text.trim()) {
          console.log("Empty response from register API");
          return {};
        }
        
        try {
          // JSON olarak işlemeyi dene
          const result = JSON.parse(text);
          console.log("Register API parsed response:", result);
          return result;
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          // JSON parse hatası olursa boş bir nesne döndür
          return {};
        }
      } catch (err) {
        console.error("Register API error:", err);
        throw err;
      }
    },
    onSuccess: (user: any) => {
      console.log("Register success, setting user:", user);
      // Eğer user undefined veya boş nesne ise işlemi durdur
      if (!user || Object.keys(user).length === 0) {
        console.log("No valid user data received from register");
        toast({
          title: "Kayıt işlemi tamamlandı",
          description: "Ancak oturum açılmadı. Lütfen giriş yapın.",
        });
        // Ana sayfaya yönlendir
        window.location.href = "/auth";
        return;
      }
      
      queryClient.setQueryData(["/___api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/___api/user"] });
      toast({
        title: "Kayıt başarılı",
        description: "Hesabınız oluşturuldu!",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      console.error("Register mutation error:", error);
      toast({
        title: "Kayıt başarısız",
        description: error.message || "Kayıt işlemi sırasında bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/___api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/___api/user"], null);
      toast({
        title: "Çıkış yapıldı",
        description: "Güvenli bir şekilde çıkış yaptınız",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Çıkış başarısız",
        description: error.message || "Çıkış yapılırken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}