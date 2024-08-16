import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Custom hook to fetch the authenticated user's data
export function useUser() {
  return useQuery({
    queryKey: ["user"], // Unique key for caching and tracking the query
    queryFn: async () => {
      // Retrieve the authentication token from local storage
      const token = await AsyncStorage.getItem("token");
      if (!token) return null; 
      
      // Make a GET request to the server to fetch the user's details
      const response = await axios.get("http://localhost:3000/api/auth/me", {
        headers: {
          "x-auth-token": token,
        },
      });
      return response.data; // Returns the user data from the server
    },
  });
}
