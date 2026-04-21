import { env } from "@ultimate-ts-starter/env/web";
import { createAppQueryClient } from "@ultimate-ts-starter/query";
import { toast } from "sonner";

export const { queryClient, client, orpc } = createAppQueryClient({
  credentials: "include",
  onError: (error) => {
    toast.error(`Error: ${error.message}`);
  },
  serverUrl: env.VITE_SERVER_URL,
});
