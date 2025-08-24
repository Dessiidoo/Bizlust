import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable auth cache time
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent flashing
    refetchInterval: false, // Don't auto-refetch
    refetchOnMount: false, // Don't refetch on mount if we have cached data
  });

  return {
    user: error?.message === "Unauthorized" ? null : user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
