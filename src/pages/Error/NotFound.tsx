import { useTranslation } from "react-i18next";
import { ErrorLayout } from "./ErrorLayout";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <ErrorLayout
      variant="404"
      code={t("errors.notFound.code")}
      title={t("errors.notFound.title")}
      description={t("errors.notFound.description")}
    />
  );
}
