import { useQuery } from "@tanstack/react-query";
import { useSession } from "./useSession";

export interface CurrentUserInfo {
  firstname?: string;
  lastname?: string;
  accountStatus?: string;
  role?: string;
  company?: { name?: string; logo?: string };
}

export function useCurrentUser() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<CurrentUserInfo> => {
      const parts = session?.name.trim().split(/\s+/) ?? [];
      return {
        firstname: parts[0],
        lastname: parts.slice(1).join(" "),
        accountStatus: session?.isVerified ? "Active" : "Unverified",
        role: "Student",
      };
    },
    enabled: !!session,
    staleTime: 60_000,
  });
}
