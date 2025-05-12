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

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
