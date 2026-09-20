import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  submitFaceVerification,
  getVerificationStatus,
  FaceVerificationRequest,
  FaceVerificationResponse,
} from "@/src/api/face-verification-api";
import { USER_PROFILE_QUERY_KEYS } from "./useUserProfileApi";

export function useSubmitFaceVerification() {
  const queryClient = useQueryClient();

  return useMutation<FaceVerificationResponse, Error, FaceVerificationRequest>({
    mutationFn: submitFaceVerification,
    onSuccess: (data) => {
      console.log("✅ Face ID Verification result:", data);
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("❌ Face ID Verification error:", error);
    },
  });
}

export function useGetVerificationStatus() {
  return useQuery({
    queryKey: ["verification-status"],
    queryFn: getVerificationStatus,
    staleTime: 60000,
  });
}
