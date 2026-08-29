import { useTranslation } from "react-i18next";
import { ErrorLayout } from "./ErrorLayout";
import { ErrorActions } from "./components/ErrorActions";
import { formatError } from "./formatError";

interface ServerErrorProps {
  error?: unknown;
  onRetry?: () => void;
}

export default function ServerError({ error, onRetry }: ServerErrorProps) {
  const { t } = useTranslation();

  return (
    <ErrorLayout
      variant="500"
      code={t("errors.serverError.code")}
      title={t("errors.serverError.title")}
      description={t("errors.serverError.description")}
      actions={<ErrorActions onRetry={onRetry ?? (() => window.location.reload())} />}
      devDetails={error ? formatError(error) : undefined}
    />
  );
}
