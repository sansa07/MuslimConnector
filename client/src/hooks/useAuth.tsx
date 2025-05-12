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
    queryKey: ["/api/v1/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/v1/login", credentials);
      try {
        // Yanıtı text olarak alıp kontrol edelim
        const text = await res.text();
        console.log("Login API raw response:", text);
        
        // Eğer boş bir yanıt gelirse boş bir nesne döndür
        if (!text.trim()) {
          console.log("Empty response from login API");
          return {};
        }
        
        try {
          // JSON olarak işlemeyi dene
          const result = JSON.parse(text);
          console.log("Login API parsed response:", result);
          return result;
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          // JSON parse hatası olursa boş bir nesne döndür
          return {};
        }
      } catch (error) {
        console.error("Error parsing login response:", error);
        return {};
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
      
      queryClient.setQueryData(["/api/v1/user"], user);
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
        const res = await apiRequest("POST", "/api/v1/register/user", credentials);
        
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
      
      queryClient.setQueryData(["/api/v1/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/v1/user"] });
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
      await apiRequest("POST", "/api/v1/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/v1/user"], null);
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