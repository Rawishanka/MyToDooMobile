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

export type ServiceListingPricingType = 'fixed' | 'negotiable';

/** The viewing user's own unresolved booking on a listing (null when none). */
export interface ServiceListingMyBooking {
  taskId: string;
  offerId: string;
  /** countered = awaiting the tasker's approval; pending/payment_pending/payment_failed = awaiting payment */
  status: 'countered' | 'pending' | 'payment_pending' | 'payment_failed';
  amount?: number;
  currency?: string;
}

export interface ServiceListing {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  price: number;
  pricingType: ServiceListingPricingType;
  /** When true, booking requires a When (Easy/DoneBy/DoneOn) date choice. */
  bookingRequired: boolean;
  currency: string;
  radiusKm: number;
  suburb: string;
  lat?: number | null;
  lng?: number | null;
  status: 'active' | 'paused' | 'deleted';
  tasker?: ServiceListingTasker | string;
  myBooking?: ServiceListingMyBooking | null;
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
  pricingType?: ServiceListingPricingType;
  bookingRequired?: boolean;
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
  /** Required when the listing has bookingRequired: true. */
  dateType?: 'Easy' | 'DoneBy' | 'DoneOn';
  /** Required for DoneBy/DoneOn -- the specific date chosen. */
  date?: string;
  dateEnd?: string;
  time?: string;
}

export interface ServiceListingBookResult {
  taskId: string;
  offerId: string;
  amount: number;
  currency: string;
  negotiating?: boolean;
  status?: 'pending' | 'countered';
}

export type OfferNegotiationStatus = 'pending' | 'countered' | 'rejected';

export interface OfferNegotiationResult {
  offerId: string;
  status: OfferNegotiationStatus;
  amount?: number;
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

export async function respondToServiceNegotiation(
  taskId: string,
  offerId: string,
  action: 'approve' | 'reject'
): Promise<ApiListResponse<OfferNegotiationResult>> {
  try {
    const response = await api.post(`/service-listings/negotiations/${taskId}/${offerId}/respond`, { action });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Respond to service negotiation failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function reCounterServiceOffer(
  taskId: string,
  offerId: string,
  input: { amount: number; message?: string }
): Promise<ApiListResponse<OfferNegotiationResult>> {
  try {
    const response = await api.put(`/service-listings/negotiations/${taskId}/${offerId}/recounter`, input);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Re-counter service offer failed:', error?.response?.status || error?.message);
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
  respondToServiceNegotiation,
  reCounterServiceOffer,
  isAbnRequiredListingError,
};
