import * as ServiceListingAPI from '@/src/api/service-listing-api';
import type {
  ServiceListingBookInput,
  ServiceListingInput,
  ServiceListingSearchParams,
} from '@/src/api/service-listing-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const SERVICE_LISTING_QUERY_KEYS = {
  all: ['service-listings'] as const,
  search: (params: ServiceListingSearchParams) =>
    [...SERVICE_LISTING_QUERY_KEYS.all, 'search', params] as const,
  mine: () => [...SERVICE_LISTING_QUERY_KEYS.all, 'mine'] as const,
  detail: (id: string) => [...SERVICE_LISTING_QUERY_KEYS.all, 'detail', id] as const,
};

export function useSearchServiceListings(
  params: ServiceListingSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: SERVICE_LISTING_QUERY_KEYS.search(params),
    queryFn: () => ServiceListingAPI.searchServiceListings(params),
    enabled,
    select: (response) => response.data || [],
    staleTime: 30 * 1000,
  });
}

export function useGetMyServiceListings(enabled = true) {
  const { isAuthenticated, token, user } = useAuthStore();
  const hasMinimumAuth = isAuthenticated && !!token;

  return useQuery({
    queryKey: [...SERVICE_LISTING_QUERY_KEYS.mine(), user?._id],
    queryFn: () => ServiceListingAPI.getMyServiceListings(),
    enabled: enabled && hasMinimumAuth,
    select: (response) => response.data || [],
    staleTime: 30 * 1000,
  });
}

export function useGetServiceListing(id: string, enabled = true) {
  return useQuery({
    queryKey: SERVICE_LISTING_QUERY_KEYS.detail(id),
    queryFn: () => ServiceListingAPI.getServiceListing(id),
    enabled: enabled && !!id,
    select: (response) => response.data,
    staleTime: 30 * 1000,
  });
}

export function useCreateServiceListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ServiceListingInput) => ServiceListingAPI.createServiceListing(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_LISTING_QUERY_KEYS.mine() });
      queryClient.invalidateQueries({ queryKey: SERVICE_LISTING_QUERY_KEYS.all });
    },
  });
}

export function useDeleteServiceListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ServiceListingAPI.deleteServiceListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_LISTING_QUERY_KEYS.mine() });
      queryClient.invalidateQueries({ queryKey: SERVICE_LISTING_QUERY_KEYS.all });
    },
  });
}

export function useBookServiceListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: ServiceListingBookInput }) =>
      ServiceListingAPI.bookServiceListing(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
}
