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
        // Vite'ın engellemediği özel bir path kullanarak kullanıcı bilgilerini al
        const res = await fetch("/__auth__/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          credentials: "include",
          cache: "no-store"
        });
        
        if (res.status === 401) return null;
        
        // Yanıtı text olarak al
        const text = await res.text();
        if (!text || !text.trim()) return null;
        
        // HTML mı diye kontrol et
        if (text.includes('<!DOCTYPE html>')) {
          console.log('HTML yanıtı alındı, doğrudan API isteği yapılıyor...');
          
          // Direkt API çağrısı yap
          const directRes = await fetch("/api/user", {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "include"
          });
          
          if (directRes.status === 401) return null;
          return await directRes.json();
        }
        
        // JSON olarak parse et
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('JSON parse hatası:', e);
          return null;
        }
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
        // Vite'ın asla yakalamayacağı, geçersiz bir URL formatı kullanıyoruz
        // __auth__ dizisi içeren pathler API tarafından algılanacak
        const requestUrl = `/__auth__/login?ts=${Date.now()}`;
        console.log(`Şu URL'e istek gönderiliyor: ${requestUrl}`);
        
        // Headers'ı detaylı ayarla
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        
        // Özel bir istekte bulun - post yöntemi yerine options kullanarak önce izin iste
        await fetch(requestUrl, {
          method: "OPTIONS",
          headers: {
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, Accept"
          }
        });
        
        // Şimdi gerçek isteği yap
        const res = await fetch(requestUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(credentials),
          credentials: "include",
          cache: "no-store",
          redirect: "manual" // Yönlendirmeleri kabul etme
        });

        // Ham cevabı debug için konsola yazdıralım
        let text;
        try {
          text = await res.text();
          console.log("Login API raw response:", text);
        } catch (err) {
          console.error("API yanıtı okunamadı:", err);
          throw new Error("API yanıtı okunamadı");
        }
        
        // Başlangıçta HTML içeriyor mu kontrol et
        if (text && text.includes("<!DOCTYPE html>")) {
          console.error("Vite müdahale ediyor, HTML döndürüyor");
          
          // HTML yanıttan oturum bilgisini parse etmeyi dene
          try {
            // Buraya geldiyse doğrudan API'ye ayrı bir istek atalım
            const directApiCall = await fetch("/api/user", {
              method: "GET",
              headers: {
                "Accept": "application/json"
              },
              credentials: "include"
            });
            
            const userData = await directApiCall.json();
            if (userData && userData.id) {
              console.log("Login sonrası kullanıcı verisi alındı:", userData);
              return userData;
            }
          } catch (err) {
            console.error("Direkt API isteği başarısız:", err);
          }
          
          throw new Error("API yanıtı okunamadı: HTML içeriği alındı");
        }
        
        // Eğer boş bir yanıt gelirse hata ver
        if (!text || !text.trim()) {
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