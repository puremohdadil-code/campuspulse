import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import { apiErrorMessage } from "../api/campuspulse";
import PageLoading from "./PageLoading";
import { useCampusTranslation } from "../i18n/campusTranslations";

export function ApiLoading() {
  return <PageLoading />;
}

export function ApiError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { text } = useCampusTranslation();
  return (
    <div className="empty-state api-error-state" role="alert">
      <ErrorOutlineRoundedIcon />
      <h2>{text("system.loadFailed")}</h2>
      <p>{apiErrorMessage(error)}</p>
      {onRetry ? <button className="solid-button" onClick={onRetry}>{text("system.retry")}</button> : null}
    </div>
  );
}

export function ApiEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <InboxRoundedIcon />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
