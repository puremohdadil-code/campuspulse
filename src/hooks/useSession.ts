import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";
import { verifyToken } from "../api/endpoint";

export interface SessionUser {
  sub: string;
  role: string;
  email: string;
  type: string;
}

// Backs route guarding (ProtectedRoute) and anything that just needs to
// know "is there a valid session" + the JWT's own claims (role/email).
// http.ts's interceptor already retries once via /auth/refresh-token on a
// 401, so a query error here means the session is genuinely gone.
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await http.get<{ valid: boolean; user: SessionUser }>(verifyToken);
      return data.user;
    },
    retry: false,
    staleTime: 60_000,
  });
}
