import { createApi } from "@/src/shared/utils/api";
import API_CONFIG from "./config";

const api = createApi(API_CONFIG.BASE_URL);

export interface FaceVerificationRequest {
  documentType: "driver_license" | "passport" | "national_id";
  documentUrl?: string;
  selfieUrl?: string;
  livenessVerified: boolean;
  threePointScanCompleted: boolean;
}

export interface FaceVerificationResponse {
  success: boolean;
  status: "verified" | "failed" | "review_required";
  isVerified: boolean;
  similarityScore: number;
  message: string;
  verification?: {
    status: string;
    documentType: string;
    similarityScore: number;
    verifiedAt?: string;
  };
}

export async function submitFaceVerification(
  payload: FaceVerificationRequest
): Promise<FaceVerificationResponse> {
  const response = await api.post<FaceVerificationResponse>(
    "/users/verify-face-id",
    payload
  );
  return response.data;
}

export async function getVerificationStatus(): Promise<{
  success: boolean;
  isVerified: boolean;
  faceMatch?: any;
}> {
  const response = await api.get("/users/verification-status");
  return response.data;
}
