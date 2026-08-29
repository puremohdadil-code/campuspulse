import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { AppButton } from "../../../components/common";

interface ErrorActionsProps {
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Shows a third "Try Again" button — pass for recoverable errors (500 / generic). */
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onRetry,
  retryLabel,
}: ErrorActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      sx={{ justifyContent: "center", mt: 3.5 }}
    >
      {onRetry && (
        <AppButton buttonVariant="ghost" startIcon={<RefreshOutlinedIcon fontSize="small" />} onClick={onRetry}>
          {retryLabel ?? t("errors.retry")}
        </AppButton>
      )}
      <AppButton
        buttonVariant="outlined"
        colorType="secondary"
        startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
        onClick={onSecondary ?? (() => navigate(-1))}
      >
        {secondaryLabel ?? t("errors.goBack")}
      </AppButton>
      <AppButton startIcon={<HomeOutlinedIcon fontSize="small" />} onClick={onPrimary ?? (() => navigate("/"))}>
        {primaryLabel ?? t("errors.goHome")}
      </AppButton>
    </Stack>
  );
}
