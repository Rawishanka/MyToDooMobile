import { createApi } from '@/src/shared/utils/api';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

export interface ServiceListingTasker {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rating?: number;
}

export interface ServiceListing {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  price: number;
  currency: string;
  radiusKm: number;
  suburb: string;
  lat?: number | null;
  lng?: number | null;
  status: 'active' | 'paused' | 'deleted';
  tasker?: ServiceListingTasker | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceListingInput {
  title: string;
  description: string;
  price: number;
  suburb: string;
  lat: number;
  lng: number;
  categories?: string[];
  currency?: string;
  radiusKm?: number;
  status?: 'active' | 'paused';
}

export interface ServiceListingSearchParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ServiceListingBookInput {
  amount?: number;
  message?: string;
  dateType?: string;
  dateEnd?: string;
  time?: string;
}

export interface ServiceListingBookResult {
  taskId: string;
  offerId: string;
  amount: number;
  currency: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export async function searchServiceListings(
  params: ServiceListingSearchParams = {}
): Promise<ApiListResponse<ServiceListing[]>> {
  try {
    const response = await api.get('/service-listings/search', { params });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Search service listings failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function getMyServiceListings(): Promise<ApiListResponse<ServiceListing[]>> {
  try {
    const response = await api.get('/service-listings/mine');
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get my service listings failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function getServiceListing(id: string): Promise<ApiListResponse<ServiceListing>> {
  try {
    const response = await api.get(`/service-listings/${id}`);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get service listing failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function createServiceListing(
  input: ServiceListingInput
): Promise<ApiListResponse<ServiceListing>> {
  try {
    const response = await api.post('/service-listings', input);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Create service listing failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function updateServiceListing(
  id: string,
  input: Partial<ServiceListingInput>
): Promise<ApiListResponse<ServiceListing>> {
  try {
    const response = await api.put(`/service-listings/${id}`, input);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Update service listing failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function deleteServiceListing(id: string): Promise<ApiListResponse<ServiceListing>> {
  try {
    const response = await api.delete(`/service-listings/${id}`);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Delete service listing failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function bookServiceListing(
  id: string,
  input: ServiceListingBookInput = {}
): Promise<ApiListResponse<ServiceListingBookResult>> {
  try {
    const response = await api.post(`/service-listings/${id}/book`, input);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Book service listing failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export function isAbnRequiredListingError(error: any): boolean {
  const code = error?.response?.data?.code || error?.code || error?.response?.data?.details?.code;
  const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();
  return (
    code === 'ABN_REQUIRED' ||
    (error?.response?.status === 403 && message.includes('abn'))
  );
}

export const ServiceListingAPI = {
  searchServiceListings,
  getMyServiceListings,
  getServiceListing,
  createServiceListing,
  updateServiceListing,
  deleteServiceListing,
  bookServiceListing,
  isAbnRequiredListingError,
};
