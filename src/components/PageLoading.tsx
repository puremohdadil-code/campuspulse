import { useCampusTranslation } from "../i18n/campusTranslations";

/**
 * Shown while a page's own server data is still loading. Deliberately the
 * same spinner as the route-level loader in .auth-route-loading, so moving
 * between pages never changes what "waiting" looks like.
 */
export default function PageLoading({ label }: { label?: string }) {
  const { text } = useCampusTranslation();
  return (
    <div className="campus-page-loading" role="status" aria-live="polite">
      <span />
      <p>{label ?? text("common.loading")}</p>
    </div>
  );
}
