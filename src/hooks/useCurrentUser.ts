import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";
import { USER } from "../api/endpoint";
import { useSession } from "./useSession";

export interface CurrentUserInfo {
  firstname?: string;
  lastname?: string;
  accountStatus?: string;
  role?: string;
  company?: { name?: string; logo?: string };
}

// GET /user/get/info deliberately doesn't return email (see auth_controller.js
// selection) — pair with useSession() for that. Only runs once a session is
// confirmed valid, so it never fires alongside a doomed request on /auth.
export function useCurrentUser() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await http.get<{ userInfo: CurrentUserInfo }>(USER.info);
      return data.userInfo;
    },
    enabled: !!session,
    staleTime: 60_000,
  });
}
