// 🏷️ **REACT QUERY HOOKS FOR CATEGORIES API**
// This file contains React Query hooks for category operations

import { CategoriesAPI } from '@/api/categories-api';
import { useQuery } from '@tanstack/react-query';

// 🔑 **QUERY KEYS**
export const CATEGORIES_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORIES_QUERY_KEYS.all, 'list'] as const,
  list: () => [...CATEGORIES_QUERY_KEYS.lists()] as const,
};

/**
 * 🏷️ Get All Categories Hook
 * Fetches categories from the database (extracted from tasks)
 */
export function useGetAllCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.list(),
    queryFn: () => CategoriesAPI.getAllCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 1, // Reduced to 1 retry to fail faster
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
}

/**
 * 🏷️ Get Categories with All Categories Option
 * Returns categories list with "All Categories" as the first option
 */
export function useGetCategoriesWithAll() {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEYS.list(), 'with-all'],
    queryFn: async (): Promise<string[]> => {
      const response = await CategoriesAPI.getAllCategories();
      if (response.success && response.data) {
        const categoryNames = response.data.map(cat => cat.name);
        return ['All Categories', ...categoryNames];
      }
      // Fallback to default categories
      return [
        'All Categories',
        'Appliance installation and repair',
        'Auto Michanic and Electrician',
        'Buliding Maintatance and Renovations',
        'Business and Accounting',
        'Carpentry',
        'Cleaning and Organising',
        'Removalist',
        'Education and Tutoring',
        'Electrical',
        'Event Planning',
        'Furniture repair and Flatpack Assemply',
        'Gardening and Landscaping',
        'Graphic Design',
        'Handyman and Handywomen',
        'Health & Fitness',
        'IT & Tech',
        'Legal Services',
        'Marketting and Advertising',
        'Music and Entertainment',
        'Painting',
        'Pet Care',
        'Photography',
        'Plumbing',
        'Something Else',
        'Web & App Development',
        'Personal Assistance',
        'Tours and Transport',
        'Delivery',
        'Realestate',
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}

/**
 * 🏷️ Get Category Names Only
 * Returns just the category names as a string array (without counts)
 */
export function useGetCategoryNames() {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEYS.list(), 'names-only'],
    queryFn: async (): Promise<string[]> => {
      const response = await CategoriesAPI.getAllCategories();
      if (response.success && response.data) {
        return response.data.map(cat => cat.name);
      }
      // Fallback to default categories
      return [
        'Appliance installation and repair',
        'Auto Michanic and Electrician',
        'Buliding Maintatance and Renovations',
        'Business and Accounting',
        'Carpentry',
        'Cleaning and Organising',
        'Removalist',
        'Education and Tutoring',
        'Electrical',
        'Event Planning',
        'Furniture repair and Flatpack Assemply',
        'Gardening and Landscaping',
        'Graphic Design',
        'Handyman and Handywomen',
        'Health & Fitness',
        'IT & Tech',
        'Legal Services',
        'Marketting and Advertising',
        'Music and Entertainment',
        'Painting',
        'Pet Care',
        'Photography',
        'Plumbing',
        'Something Else',
        'Web & App Development',
        'Personal Assistance',
        'Tours and Transport',
        'Delivery',
        'Realestate',
      ];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}