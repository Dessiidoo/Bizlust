import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, isSuccess, isError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable auth cache time
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent flashing
    refetchInterval: false, // Don't auto-refetch
    refetchOnMount: false, // Don't refetch on mount if we have cached data
  });

  // Consider loading complete when we have either success or error (including 401)
  const actuallyLoading = isLoading && !isSuccess && !isError;

  return {
    user: error?.message === "Unauthorized" ? null : user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user && !error,
  };
}
