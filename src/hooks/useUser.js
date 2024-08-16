import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;
      const response = await axios.get("http://localhost:3000/api/auth/me", {
        headers: {
          "x-auth-token": token,
        },
      });
      return response.data;
    },
  });
}
