import { useQuery } from "@tanstack/react-query";

export interface UserData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Geçici mock kullanıcı verisi (Replit Auth sorunu çözülene kadar)
const mockUser: UserData = {
  id: "42233773", 
  email: "muslimuser@example.com",
  firstName: "Müslüman",
  lastName: "Kullanıcı",
  profileImageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=muslim&backgroundColor=b6e3f4,c0aede,d1d4f9",
  username: "muslimuser",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function useAuth() {
  /* Replit Auth şu anda çalışmadığı için devre dışı bırakıldı
  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  */
  
  // Geçici çözüm: Her zaman giriş yapmış olarak davran
  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
