import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { academicApi } from "../api/campuspulse";
import { ApiError, ApiLoading } from "../components/ApiState";

export default function RequireOnboarded() {
  const location = useLocation();
  const academic = useQuery({
    queryKey: ["academic-profile"],
    queryFn: academicApi.get,
    retry: false,
  });

  if (academic.isLoading) return <ApiLoading />;
  if (academic.isError) return <ApiError error={academic.error} onRetry={() => academic.refetch()} />;

  const profile = academic.data;
  if (!profile) return <ApiError error={new Error("The academic profile response was empty.")} onRetry={() => academic.refetch()} />;
  const needsOnboarding = profile.provisioned === false
    || (profile.courses.length === 0 && profile.interests.length === 0);

  return needsOnboarding
    ? <Navigate to="/onboarding" replace state={{ from: location.pathname }} />
    : <Outlet />;
}
