import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import axios from "axios";
import { Box } from "@mui/material";

import { AppDialog, AppInput, AppButton, AppText } from "../../components/common";
import { http } from "../../api/http";
import { AUTH } from "../../api/endpoint";

const schema = z.object({ email: z.string().email() });

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordDialog({ open, onClose }: ForgotPasswordDialogProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const { data } = await http.post<{ message: string }>(AUTH.forgotPassword, values);
      enqueueSnackbar(data.message ?? t("auth.forgotPassword.success"), { variant: "success" });
      handleClose();
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
      enqueueSnackbar(message ?? t("auth.login.genericError"), { variant: "error" });
    }
  });

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={t("auth.forgotPassword.title")}
      fullWidth
      maxWidth="xs"
      actions={
        <>
          <AppButton buttonVariant="outlined" colorType="secondary" onClick={handleClose}>
            {t("auth.signup.cancel")}
          </AppButton>
          <AppButton onClick={submit} loading={isSubmitting}>
            {t("auth.forgotPassword.submit")}
          </AppButton>
        </>
      }
    >
      <AppText colorType="secondary" sx={{ mb: 2 }}>
        {t("auth.forgotPassword.subtitle")}
      </AppText>
      <Box component="form" onSubmit={submit} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              label={t("auth.forgotPassword.email")}
              error={!!errors.email}
              helperText={errors.email ? t("auth.login.emailInvalid") : undefined}
            />
          )}
        />
      </Box>
    </AppDialog>
  );
}
