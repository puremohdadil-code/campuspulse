import { useTranslation } from "react-i18next";
import { ErrorLayout } from "./ErrorLayout";
import { ErrorActions } from "./components/ErrorActions";
import { formatError } from "./formatError";

// Shape-compatible with react-error-boundary's FallbackProps, so this can be
// passed directly as `<ErrorBoundary FallbackComponent={AppError} />` — see
// main.tsx — as well as rendered standalone with no props at all.
interface AppErrorProps {
  error?: unknown;
  resetErrorBoundary?: (...args: unknown[]) => void;
}

export default function AppError({ error, resetErrorBoundary }: AppErrorProps) {
  const { t } = useTranslation();

  return (
    <ErrorLayout
      variant="generic"
      code={t("errors.appError.code")}
      title={t("errors.appError.title")}
      description={t("errors.appError.description")}
      actions={<ErrorActions onRetry={resetErrorBoundary ?? (() => window.location.reload())} />}
      devDetails={error ? formatError(error) : undefined}
    />
  );
}
