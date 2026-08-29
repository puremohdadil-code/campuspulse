import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-ignore
import './index.css';
import './campuspulse.css';
import './i18n/index.ts';
import App from './App.tsx';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
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
import PulseAIPage from './pages/PulseAIPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import CampusProfilePage from './pages/CampusProfilePage.tsx';

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

      <Route path="/dashboard" element={<App />}>
        <Route index element={<DashboardHome />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="agent" element={<PulseAIPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<CampusProfilePage />} />
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
  // renders in MUI's default Roboto stack instead of Inter/Cairo.
  const muiTheme = useMemo(
    () => createTheme({ direction, typography: { fontFamily: '"Inter", "Cairo", sans-serif' } }),
    [direction]
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <RouterProvider router={router} />
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
