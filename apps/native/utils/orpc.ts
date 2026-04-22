import { env } from "@ultimate-ts-starter/env/native";
import { createAppQueryClient } from "@ultimate-ts-starter/query";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";

export const { queryClient, client, orpc } = createAppQueryClient({
  credentials: Platform.OS === "web" ? "include" : "omit",
  headers: (): Record<string, string> => {
    if (Platform.OS === "web") {
      return {};
    }
    const cookies = authClient.getCookie();
    return cookies ? { Cookie: cookies } : {};
  },
  onError: (error) => {
    console.log(error);
  },
  serverUrl: env.EXPO_PUBLIC_SERVER_URL,
});
