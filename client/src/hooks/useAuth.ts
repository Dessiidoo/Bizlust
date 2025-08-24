import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    throwOnError: false,
  });

  // If we get a 401 (unauthorized), that's expected for unauthenticated users
  const isAuthenticated = !!user && (!error || (error as any)?.status !== 401);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
