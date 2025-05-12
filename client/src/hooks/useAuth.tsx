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
    queryKey: ["/api/user"], 
    queryFn: async () => {
      try {
        // Direkt API rotasını kullanalım
        const res = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          credentials: "include"
        });
        
        if (res.status === 401) return null;
        
        // Yanıtı doğrudan JSON olarak alalım
        return await res.json();
      } catch (err) {
        console.error('Kullanıcı bilgisi alma hatası:', err);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login form values:", credentials);
      
      try {
        // Doğrudan API isteklerini yapalım - basitleştirilmiş yaklaşım
        const requestUrl = `/api/login`;
        console.log(`Şu URL'e istek gönderiliyor: ${requestUrl}`);
        
        // İsteği gönder
        const res = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(credentials),
          credentials: "include"
        });

        // İlk önce text olarak yanıtı alalım
        const text = await res.text();
        console.log("Login API raw response:", text);
        
        // Boş yanıt kontrolü
        if (!text || !text.trim()) {
          throw new Error("Sunucu boş yanıt döndürdü");
        }
        
        // HTML kontrolü
        if (text.includes("<!DOCTYPE html>")) {
          throw new Error("Sunucu HTML yanıtı döndürdü");
        }
        
        // JSON parse etmeyi dene
        try {
          const data = JSON.parse(text);
          console.log("Login API parsed response:", data);
          
          // Hata yanıtı kontrolü
          if (!res.ok) {
            throw new Error(data.message || "Giriş başarısız");
          }
          
          return data;
        } catch (e) {
          console.error("JSON parse error:", e);
          throw new Error("Sunucu geçersiz JSON yanıtı döndürdü");
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
      
      console.log("Login başarılı, user cache güncelleniyor:", user);
      queryClient.setQueryData(["/api/user"], user);
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
      queryClient.setQueryData(["/api/user"], null);
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