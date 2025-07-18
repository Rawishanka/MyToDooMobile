// External library imports
import { useQuery } from "@tanstack/react-query";

// Internal application modules (API, constants, types)



const KEYS = {
    myTasks: () => ["my-tasks"] as const,
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


export function useMyTasksQuery() {
    return useQuery({
        queryKey: KEYS.myTasks(),
        queryFn: () =>console.log("hello")
        // queryFn: () => weatherAPI.getGeoCode(keyWord)
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