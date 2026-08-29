import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Stack } from "@mui/material";

import {
  AppSectionHeader,
  AppCard,
  AppAvatar,
  AppText,
  AppChip,
  AppInfoRow,
  AppButton,
  AppLoader,
  AppDivider,
} from "../components/common";

import { useSession } from "../hooks/useSession";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { http } from "../api/http";
import { AUTH } from "../api/endpoint";

// No backend endpoint exists to edit profile fields (only GET /user/get/info) —
// this stays read-only. "Change password" reuses the forgot-password flow
// (email a reset link to yourself) instead of inventing a new endpoint.
export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: session } = useSession();
  const { data: user, isLoading } = useCurrentUser();
  const [sendingReset, setSendingReset] = useState(false);

  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "—";

  const handleChangePassword = async () => {
    if (!session?.email) return;
    setSendingReset(true);
    try {
      const { data } = await http.post<{ message: string }>(AUTH.forgotPassword, { email: session.email });
      enqueueSnackbar(data.message ?? t("profile.changePasswordSent"), { variant: "success" });
    } catch {
      enqueueSnackbar(t("auth.login.genericError"), { variant: "error" });
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      await http.post(AUTH.logout);
    } finally {
      queryClient.clear();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <AppSectionHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      {isLoading && <AppLoader />}

      {user && (
        <Stack spacing={2.5} sx={{ maxWidth: 520 }}>
          <AppCard dense={false}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
              <AppAvatar src={user.company?.logo} sx={{ width: 56, height: 56, fontSize: "1.2rem" }}>
                {fullName.charAt(0)}
              </AppAvatar>
              <Box sx={{ minWidth: 0 }}>
                <AppText weight={800} sx={{ fontSize: "1.1rem" }} truncate>
                  {fullName}
                </AppText>
                <AppText colorType="secondary" truncate>
                  {session?.email}
                </AppText>
              </Box>
            </Stack>

            <AppDivider sx={{ mb: 1 }} />

            <AppInfoRow label={t("profile.email")} value={session?.email ?? "—"} />
            <AppInfoRow label={t("profile.role")} value={user.role ?? "—"} />
            <AppInfoRow label={t("profile.company")} value={user.company?.name ?? "—"} />
            <AppInfoRow
              label={t("profile.status")}
              value={
                <AppChip
                  label={user.accountStatus ?? "—"}
                  colorType={user.accountStatus === "Active" ? "success" : "warning"}
                />
              }
            />
          </AppCard>

          <AppCard title={t("profile.security")}>
            <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <AppText colorType="secondary">{t("profile.changePasswordHint")}</AppText>
              <AppButton buttonVariant="outlined" onClick={handleChangePassword} loading={sendingReset}>
                {t("profile.changePassword")}
              </AppButton>
            </Stack>
          </AppCard>

          <Box>
            <AppButton colorType="danger" buttonVariant="ghost" onClick={handleLogout}>
              {t("profile.logout")}
            </AppButton>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
