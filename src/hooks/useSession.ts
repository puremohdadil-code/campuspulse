import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/campuspulse";
import type { ApiUser } from "../api/types";

export type SessionUser = ApiUser;

// Backs route guarding (ProtectedRoute) and anything that just needs to
// know "is there a valid session" + the JWT's own claims (role/email).
// http.ts's interceptor already retries once via /auth/refresh-token on a
// 401, so a query error here means the session is genuinely gone.
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}
