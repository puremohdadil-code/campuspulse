import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Box, Stack } from "@mui/material";

import { AppCard, AppPasswordInput, AppButton, AppLink, AppAlert, COLORS } from "../../components/common";
import { http } from "../../api/http";
import { AUTH } from "../../api/endpoint";

const schema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"] });

// Reached from the emailed reset link (`${CLIENT_URL}/auth/reset-password?token=...`,
// see auth_controller.js requestPasswordReset) — a real route, not a dialog,
// since it's opened outside the app.
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { newPassword: "", confirmPassword: "" } });

  const submit = handleSubmit(async (values) => {
    if (!token) return;
    try {
      const { data } = await http.post<{ message: string }>(AUTH.resetPassword, {
        token,
        password: values.newPassword,
      });
      enqueueSnackbar(data.message ?? t("auth.resetPassword.success"), { variant: "success" });
      navigate("/auth", { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
      enqueueSnackbar(message ?? t("auth.login.genericError"), { variant: "error" });
    }
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: COLORS.background,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <AppCard title={t("auth.resetPassword.title")} subtitle={t("auth.resetPassword.subtitle")} dense={false}>
          {!token ? (
            <Stack spacing={2}>
              <AppAlert severity="error">{t("auth.resetPassword.invalidToken")}</AppAlert>
              <AppLink onClick={() => navigate("/auth")}>{t("auth.resetPassword.backToLogin")}</AppLink>
            </Stack>
          ) : (
            <Stack component="form" spacing={2.5} onSubmit={submit} noValidate>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <AppPasswordInput {...field} label={t("auth.resetPassword.newPassword")} error={!!errors.newPassword} />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <AppPasswordInput
                    {...field}
                    label={t("auth.resetPassword.confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword ? t("auth.resetPassword.passwordMismatch") : undefined}
                  />
                )}
              />
              <AppButton type="submit" loading={isSubmitting} sx={{ width: "100%" }}>
                {t("auth.resetPassword.submit")}
              </AppButton>
            </Stack>
          )}
        </AppCard>
      </Box>
    </Box>
  );
}
