import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { AppLoader } from "../components/common";

const ProtectedRoute = () => {
  const { data: session, isLoading, isError } = useSession();

  if (isLoading) return <AppLoader label="Checking session…" />;
  if (isError || !session) return <Navigate to="/auth" replace />;
 
  return <Outlet />;
};

export default ProtectedRoute;
