import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import NotFound from "./NotFound";
import Forbidden from "./Forbidden";
import Unauthorized from "./Unauthorized";
import ServerError from "./ServerError";
import AppError from "./AppError";

// Wired as `errorElement` on the root route (see main.tsx). React Router
// renders this for BOTH unmatched URLs (a synthetic 404 response) and any
// error thrown by a route's render/loader/action — it dispatches to the
// matching page for HTTP-shaped errors and falls back to the generic
// AppError page (with dev-mode details) for anything else.
export default function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return <NotFound />;
      case 403:
        return <Forbidden />;
      case 401:
        return <Unauthorized />;
      default:
        if (error.status >= 500) return <ServerError error={error} />;
    }
  }

  return <AppError error={error} />;
}
