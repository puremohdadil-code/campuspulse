import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Box, Stack } from "@mui/material";

import { AppCard, AppInput, AppPasswordInput, AppButton, AppLink, AppText, COLORS } from "../../components/common";

import { http } from "../../api/http";
import { AUTH } from "../../api/endpoint";

import { SignupDialog } from "./SignupDialog";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { VerifyEmailDialog } from "./VerifyEmailDialog";

const schema = z.object({
  userEmail: z.string().email(),
  password: z.string().min(1),
});

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [signupOpen, setSignupOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { userEmail: "", password: "" } });

  const openVerify = (email: string) => {
    setVerifyEmail(email);
    setVerifyOpen(true);
  };

  const submit = handleSubmit(async (values) => {
    try {
      const { data } = await http.post<{ message: string }>(AUTH.login, {
        userEmail: values.userEmail,
        password: values.password,
        deviceInfo: { userAgent: navigator.userAgent, platform: navigator.platform },
      });
      enqueueSnackbar(data.message ?? t("auth.login.submit"), { variant: "success" });
      queryClient.clear();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string; requiresVerification?: boolean })
        : undefined;
      if (data?.requiresVerification) {
        openVerify(values.userEmail);
        return;
      }
      enqueueSnackbar(data?.message ?? t("auth.login.genericError"), { variant: "error" });
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
        <AppCard title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} dense={false}>

          <Stack component="form" spacing={2.5} onSubmit={submit} noValidate>
            <Controller
              name="userEmail"
              control={control}
              render={({ field }) => (
                <AppInput
                  {...field}
                  label={t("auth.login.email")}
                  error={!!errors.userEmail}
                  helperText={errors.userEmail ? t("auth.login.emailInvalid") : undefined}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <AppPasswordInput
                  {...field}
                  label={t("auth.login.password")}
                  error={!!errors.password}
                  helperText={errors.password ? t("auth.login.passwordRequired") : undefined}
                />
              )}
            />

            <Box sx={{ textAlign: "end" }}>
              <AppLink onClick={() => setForgotOpen(true)}>{t("auth.login.forgotPassword")}</AppLink>
            </Box>

            <AppButton type="submit" loading={isSubmitting} sx={{ width: "100%" }}>
              {t("auth.login.submit")}
            </AppButton>

            <Stack direction="row" spacing={0.75} sx={{ justifyContent: "center" }}>
              <AppText colorType="secondary">{t("auth.login.noAccount")}</AppText>
              <AppLink onClick={() => setSignupOpen(true)}>{t("auth.login.signUp")}</AppLink>
            </Stack>
          </Stack>
        </AppCard>
      </Box>

      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} onSuccess={openVerify} />
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
      <VerifyEmailDialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        email={verifyEmail}
        onVerified={() => setVerifyOpen(false)}
      />
    </Box>
  );
}
