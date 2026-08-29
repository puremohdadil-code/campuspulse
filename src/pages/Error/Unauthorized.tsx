import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ErrorLayout } from "./ErrorLayout";
import { ErrorActions } from "./components/ErrorActions";

export default function Unauthorized() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ErrorLayout
      variant="401"
      code={t("errors.unauthorized.code")}
      title={t("errors.unauthorized.title")}
      description={t("errors.unauthorized.description")}
      actions={<ErrorActions primaryLabel={t("errors.signIn")} onPrimary={() => navigate("/auth")} />}
    />
  );
}
