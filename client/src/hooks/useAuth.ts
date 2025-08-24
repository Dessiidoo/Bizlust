import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check auth status
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
