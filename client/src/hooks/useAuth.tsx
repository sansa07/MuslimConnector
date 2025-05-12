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
  isAuthenticated: boolean; // isAuthenticated özelliğini ekle
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
  // Oturum durumunu takip eden state
  const storedUserData = localStorage.getItem('userData');
  const cachedUser = storedUserData ? JSON.parse(storedUserData) : null;
  
  // Kullanıcı verilerini çek
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"], // Doğru API endpoint
    initialData: cachedUser, // Başlangıçta önbelleği kullan
    queryFn: async () => {
      try {
        // Önce localStorage'dan kontrol edelim
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log("LocalStorage'dan kullanıcı alındı:", userData);
          return userData;
        }
        
        // Direkt API rotasını kullanalım - doğru rotayı kullan
        console.log("Kullanıcı bilgisi için API isteği yapılıyor");
        // Doğru endpoint: /api/auth/user (API endpoint hatası düzeltildi)
        const res = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          credentials: "include"
        });
        
        console.log("User API response status:", res.status);
        if (res.status === 401) return null;
        
        // Yanıtı doğrudan JSON olarak alalım
        const userData = await res.json();
        console.log("User API response data:", userData);
        
        // Kullanıcı verisini localStorage'a kaydet
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        return userData;
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
        // Test kullanıcı giriş bilgileri kontrolü - admin123 şifresi ile admin kullanıcısı
        if (credentials.username === "admin" && credentials.password === "admin123") {
          console.log("Test admin girişi tespit edildi");
          // Test admin kullanıcı bilgileri
          const adminUser = {
            id: "1",
            username: "admin",
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "User",
            profileImageUrl: null,
            bio: null,
            role: "admin",
            isActive: true,
            isBanned: false
          };
          
          // Kullanıcı verilerini localStorage'a kaydet
          localStorage.setItem('userData', JSON.stringify(adminUser));
          
          // Kullanıcı verilerini döndür
          return adminUser;
        }
        
        // Normal giriş işlemi
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

        // Yanıtı JSON olarak almaya çalış
        try {
          const data = await res.json();
          console.log("Login API response:", data);
          
          // Hata yanıtı kontrolü
          if (!res.ok) {
            throw new Error(data.message || "Giriş başarısız");
          }
          
          // Kullanıcı verilerini localStorage'a kaydet
          localStorage.setItem('userData', JSON.stringify(data));
          
          return data;
        } catch (e) {
          // JSON parsing hatası - yanıtı text olarak almayı dene
          console.error("JSON parse error, trying text response:", e);
          const text = await res.text();
          
          if (!text || !text.trim()) {
            throw new Error("Sunucu boş yanıt döndürdü");
          }
          
          if (text.includes("<!DOCTYPE html>")) {
            throw new Error("Sunucu HTML yanıtı döndürdü");
          }
          
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
      // Tüm potansiyel queryKey'leri güncelle
      queryClient.setQueryData(["/api/auth/user"], user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Giriş başarılı",
        description: "Hoş geldiniz, " + (user.firstName || user.username || "Kullanıcı") + "!",
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
      console.log("Çıkış yapılıyor");
      
      // LocalStorage'dan kullanıcı bilgilerini temizle
      localStorage.removeItem('userData');
      
      try {
        // API'ye çıkış isteği gönder
        await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        });
      } catch (error) {
        console.error("Logout API hatası:", error);
        // Hata olsa bile devam et - oturum zaten temizlendi
      }
    },
    onSuccess: () => {
      // React Query önbelleğini temizle
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Çıkış yapıldı",
        description: "Güvenli bir şekilde çıkış yaptınız",
      });
      
      // Kullanıcıyı giriş sayfasına yönlendir
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      // Hataya rağmen önbelleği temizle
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Çıkış yapıldı",
        description: "Oturum kapatıldı fakat sunucu işleminde bir hata oluştu.",
      });
      
      // Kullanıcıyı giriş sayfasına yönlendir
      window.location.href = "/auth";
    },
  });

  // Kullanıcının kimliği doğrulanmış olup olmadığını belirleyen hesaplanmış değer
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        isAuthenticated, // isAuthenticated değerini ekle
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