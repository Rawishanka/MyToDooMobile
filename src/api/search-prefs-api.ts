import { createApi } from '@/src/shared/utils/api';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

export interface SearchPrefs {
  radiusKm: number;
  lat?: number;
  lng?: number;
  suburb?: string;
}

export interface SearchPrefsResponse {
  success: boolean;
  data: SearchPrefs;
}

export async function getSearchPrefs(): Promise<SearchPrefsResponse> {
  try {
    const response = await api.get('/users/profile/search-prefs');
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get search prefs failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function updateSearchPrefs(prefs: SearchPrefs): Promise<SearchPrefsResponse> {
  try {
    const response = await api.put('/users/profile/search-prefs', {
      radiusKm: prefs.radiusKm,
      lat: prefs.lat,
      lng: prefs.lng,
      suburb: prefs.suburb,
    });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Update search prefs failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export const SearchPrefsAPI = {
  getSearchPrefs,
  updateSearchPrefs,
};
