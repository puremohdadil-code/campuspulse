/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, settingsApi } from "../api/campuspulse";
import { AUTH_SESSION_EXPIRED_EVENT } from "../api/http";
import type { ApiUser } from "../api/types";
import { getStoredLang, setLang } from "../i18n";

// The session the whole app reads from. `source` records where it came
// from: today that is always the CampusPulse API (GET /auth/me or the
// user object POST /auth/login returns), and consumers use it to decide
// whether a write to the backend is worth attempting at all.
export type AuthSession = ApiUser;

interface AuthContextValue {
  session: AuthSession | null;
  /** True only while the initial GET /auth/me probe is in flight. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // The HTTP layer reports an unrecoverable 401 without manipulating the
  // browser location. Keeping the state transition here prevents full-page
  // reload loops and lets RequireAuth perform one normal React redirect.
  useEffect(() => {
    const expireSession = () => {
      setSession(null);
      setLoading(false);
      queryClient.clear();
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, expireSession);
  }, [queryClient]);

  // Step 1 of the documented flow: ask the server who we are. The tokens
  // live in httpOnly cookies, so this call is the only way to learn there
  // is a live session — and http.ts already retries once through
  // POST /auth/refresh before the 401 reaches us here.
  useEffect(() => {
    let active = true;
    authApi
      .me()
      .then((user) => { if (active) setSession(user); })
      .catch(() => { if (active) setSession(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // interfaceLanguage is an account preference, not a device one — once we
  // know who is signed in, their saved language wins over whatever this
  // browser happened to have stored. LanguageSwitcher pushes the other way.
  const userId = session?.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    settingsApi
      .get()
      .then((settings) => {
        if (!active) return;
        if (settings.interfaceLanguage && settings.interfaceLanguage !== getStoredLang()) {
          setLang(settings.interfaceLanguage);
        }
      })
      .catch(() => { /* A missing preference never blocks the app. */ });
    return () => { active = false; };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    // Login already returns the user, so seeding the session from the
    // response saves a second round trip to /auth/me.
    const { user } = await authApi.login({ email, password });
    const next = user;
    queryClient.clear();
    setSession(next);
    setLoading(false);
    return next;
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await authApi.logout();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(() => ({ session, loading, signIn, signOut }), [session, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
