import { useTranslation } from "react-i18next";
import { ErrorLayout } from "./ErrorLayout";

export default function Forbidden() {
  const { t } = useTranslation();
  return (
    <ErrorLayout
      variant="403"
      code={t("errors.forbidden.code")}
      title={t("errors.forbidden.title")}
      description={t("errors.forbidden.description")}
    />
  );
}
