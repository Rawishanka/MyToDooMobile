// External library imports
import { useApiFunctions } from "@/api/mytasks";
import { TaskAPI } from '@/api/task-api'; // ✅ ADDED: Import new TaskAPI
import { CreateTask } from "@/store/create-task-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Internal application modules (API, constants, types)



const KEYS = {
    myTasks: () => ["my-tasks"] as const,
    allTasks: () => ["all-tasks"] as const,
    // location: (search: string) => ["location", search] as const,
    // hourlyData: (hourlyData: Cordinates) => ["hourly-data", hourlyData] as const
}


// export function useWeatherQuery(cordinate?: Cordinates) {
//     cordinate = cordinate ?? DEFAULT_LOCATION;
//     return useQuery({
//         queryKey: KEYS.weather(cordinate),
//         queryFn: () => weatherAPI.getCurrentWeather(cordinate)
//     });
// }


export function useGetAllTasksQuery() {
  // ✅ FIXED: Using new TaskAPI with network error fallback instead of old mytasks.ts
  return useQuery({
    queryKey: KEYS.allTasks(),
    queryFn: () => TaskAPI.getAllTasks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduced retries since TaskAPI has its own fallback handling
  });
}

export function useMyTasksQuery() {
    return useQuery({
        queryKey: KEYS.myTasks(),
        queryFn: () =>console.log("hello")
        // queryFn: () => weatherAPI.getGeoCode(keyWord)
    });
}


export const useCreateTask = (task: CreateTask) => {
  const queryClient = useQueryClient();
 const { createTask } = useApiFunctions();
  return useMutation({
    mutationFn: () => createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
    },
  });
};

export function useCreateAuthToken() {
  const queryClient = useQueryClient();
 const { handleLoginUser } = useApiFunctions();
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => handleLoginUser(username, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-token'], data);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}

export function useCreateSignUpToken() {
  const queryClient = useQueryClient();
  const { handleSignUpUser } = useApiFunctions();
  return useMutation({
    mutationFn: (signUpData: { firstName: string; lastName: string; email: string; password: string; phone: string }) => 
      handleSignUpUser(signUpData),
    onSuccess: (data) => {
      queryClient.setQueryData(['signup'], data);
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
    },
  });
}

export function useVerifyOTP() {
  const queryClient = useQueryClient();
  const { handleVerifyOTP } = useApiFunctions();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => 
      handleVerifyOTP(email, otp),
    onSuccess: (data) => {
      queryClient.setQueryData(['otp-verification'], data);
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
    },
  });
}

// export function useMyTasksQuery() {
//     return useQuery({
//         queryKey: KEYS.myTasks(),
//         queryFn: () => weatherAPI.getGeoCode(keyWord),
//         enabled: keyWord.length > 2
//     });
// }




// export function useHourlyDataQuery(days?: string, location?: Cordinates) {
//     days = days ?? "5";
//     location = location ?? DEFAULT_LOCATION
//     return useQuery({
//         queryKey: KEYS.hourlyData(location),
//         queryFn: () => weatherAPI.getHourlyData(days, location)
//     });
// }