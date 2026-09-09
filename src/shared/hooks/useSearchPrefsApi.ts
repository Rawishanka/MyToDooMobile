import * as SearchPrefsAPI from '@/src/api/search-prefs-api';
import type { SearchPrefs } from '@/src/api/search-prefs-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const SEARCH_PREFS_QUERY_KEYS = {
  all: ['search-prefs'] as const,
  prefs: () => [...SEARCH_PREFS_QUERY_KEYS.all, 'prefs'] as const,
};

export function useGetSearchPrefs() {
  const { isAuthenticated, token, user } = useAuthStore();
  const hasMinimumAuth = isAuthenticated && !!token;

  return useQuery({
    queryKey: [...SEARCH_PREFS_QUERY_KEYS.prefs(), user?._id],
    queryFn: () => SearchPrefsAPI.getSearchPrefs(),
    enabled: hasMinimumAuth,
    select: (response) => response.data,
    staleTime: 30 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.isAuthError) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useUpdateSearchPrefs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: SearchPrefs) => SearchPrefsAPI.updateSearchPrefs(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEARCH_PREFS_QUERY_KEYS.prefs() });
    },
    onError: (error) => {
      console.error('❌ Search prefs update failed:', error);
    },
  });
}
