/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './campuspulse.css';
import './university-theme.css';
import './i18n/index.ts';
import App from './App.tsx';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { SnackbarProvider } from "notistack";
import { useTranslation } from "react-i18next";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material";

import { createEmotionCache } from "./hooks/cache";
import { dirFor, type Lang } from "./i18n";
import RootLayout from './RootLayout.tsx';
import DashboardHome from './pages/DashboardHome.tsx';
import LandingPage from './pages/LandingPage.tsx';
import ErrorPage from './pages/Error/ErrorPage.tsx';
import AppError from './pages/Error/AppError.tsx';
import DiscoverPage from './pages/DiscoverPage.tsx';
import CalendarPage from './pages/CalendarPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import MessagesPage from './pages/MessagesPage.tsx';
import MmuPage from './pages/MmuPage.tsx';
import CampusProfilePage from './pages/CampusProfilePage.tsx';
import CampusLoginPage from './pages/auth/CampusLoginPage.tsx';
import CampusSignupPage from './pages/auth/CampusSignupPage.tsx';
import CampusForgotPasswordPage from './pages/auth/CampusForgotPasswordPage.tsx';
import CampusVerifyEmailPage from './pages/auth/CampusVerifyEmailPage.tsx';
import CampusResetPasswordPage from './pages/auth/CampusResetPasswordPage.tsx';
import TermsPage from './pages/legal/TermsPage.tsx';
import PrivacyPage from './pages/legal/PrivacyPage.tsx';
import AttendancePage from './pages/AttendancePage.tsx';
import RequireAuth from './routes/RequireAuth.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import CampusOnboardingPage from './pages/CampusOnboardingPage.tsx';
import CampusSettingsPage from './pages/CampusSettingsPage.tsx';
import RequireOnboarded from './routes/RequireOnboarded.tsx';

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    // RootLayout mounts on every route (loading bar today, toast host /
    // command palette tomorrow). errorElement here catches BOTH unmatched
    // URLs (a synthetic 404) and any thrown render/loader/action error
    // anywhere below — see pages/Error/ErrorPage.tsx for how it's routed
    // to the right 404/403/401/500/generic page.
    <Route element={<RootLayout />} errorElement={<ErrorPage />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<CampusLoginPage />} />
      <Route path="/signup" element={<CampusSignupPage />} />
      <Route path="/forgot-password" element={<CampusForgotPasswordPage />} />
      <Route path="/verify-email" element={<CampusVerifyEmailPage />} />
      <Route path="/auth/reset-password" element={<CampusResetPasswordPage />} />
      <Route path="/reset-password" element={<CampusResetPasswordPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<CampusOnboardingPage />} />
        <Route element={<RequireOnboarded />}>
          <Route path="/updates" element={<Navigate to="/dashboard/updates" replace />} />
          <Route path="/attendance" element={<Navigate to="/dashboard/attendance" replace />} />
          <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
          <Route path="/dashboard" element={<App />}>
            <Route index element={<DashboardHome />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="updates" element={<DiscoverPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
          <Route path="mmu" element={<MmuPage />} />
            <Route path="settings" element={<CampusSettingsPage />} />
            <Route path="profile" element={<CampusProfilePage />} />
          </Route>
        </Route>
      </Route>
    </Route>
  )
);

// Wraps every route (dashboard, auth, landing) in a direction-aware MUI
// context. This used to live only inside App.tsx's dashboard shell, so
// standalone routes (Auth, LandingPage, ResetPasswordPage) rendered with
// MUI's default direction ("ltr") regardless of the active language —
// components that read theme.direction internally (Tabs' sliding
// indicator, Menu/Popper placement, Drawer anchor mirroring) stayed
// LTR-positioned under Arabic and could visually collide with the
// RTL-flowing content around them.
function Root() {
  const { i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const direction = dirFor(lang);
  const cache = useMemo(() => createEmotionCache(direction), [direction]);
  // MUI's Typography variants set their own font-family via generated
  // classes, which outrank the plain `* { font-family }` rule in index.css
  // (a class selector always beats the universal selector) — so without
  // this, every AppText/Typography-based element (most of the UI) quietly
  // renders in MUI's default Roboto stack instead of the portal type system.
  const muiTheme = useMemo(
    () => createTheme({ direction, typography: { fontFamily: '"Source Sans 3", "Cairo", sans-serif' } }),
    [direction]
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Outermost safety net — catches errors outside the router's own
        control (e.g. in QueryClientProvider itself). Anything thrown
        inside a route is already handled by errorElement above. */}
    <ErrorBoundary FallbackComponent={AppError}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Root />
        </SnackbarProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
