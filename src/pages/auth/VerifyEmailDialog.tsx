import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import axios from "axios";
import { Stack } from "@mui/material";

import { AppDialog, AppOtpInput, AppButton, AppText } from "../../components/common";
import { http } from "../../api/http";
import { AUTH } from "../../api/endpoint";

interface VerifyEmailDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}

export function VerifyEmailDialog({ open, onClose, email, onVerified }: VerifyEmailDialogProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleClose = () => {
    setCode("");
    onClose();
  };

  const errorMessage = (err: unknown) =>
    (axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined) ??
    t("auth.login.genericError");

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data } = await http.post<{ message: string }>(AUTH.verifyEmail, { email, otp: code });
      enqueueSnackbar(data.message ?? t("auth.verifyEmail.success"), { variant: "success" });
      handleClose();
      onVerified();
    } catch (err) {
      enqueueSnackbar(errorMessage(err), { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const { data } = await http.post<{ message: string }>(AUTH.resendVerification, { email });
      enqueueSnackbar(data.message ?? t("auth.verifyEmail.resend"), { variant: "success" });
    } catch (err) {
      enqueueSnackbar(errorMessage(err), { variant: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={t("auth.verifyEmail.title")}
      fullWidth
      maxWidth="xs"
      actions={
        <>
          <AppButton buttonVariant="outlined" colorType="secondary" onClick={resend} loading={resending}>
            {t("auth.verifyEmail.resend")}
          </AppButton>
          <AppButton onClick={submit} loading={submitting} disabled={code.length !== 6}>
            {t("auth.verifyEmail.submit")}
          </AppButton>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ alignItems: "center" }}>
        <AppText colorType="secondary" sx={{ textAlign: "center" }}>
          {t("auth.verifyEmail.subtitle", { email })}
        </AppText>
        <AppOtpInput value={code} onChange={setCode} autoFocus />
      </Stack>
    </AppDialog>
  );
}
