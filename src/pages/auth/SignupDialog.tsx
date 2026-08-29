import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import axios from "axios";
import { MenuItem, Stack, Box } from "@mui/material";

import {
  AppDialog,
  AppTabs,
  AppInput,
  AppPasswordInput,
  AppSelectOne,
  AppRadio,
  AppFileUpload,
  AppButton,
  AppText,
} from "../../components/common";

import { http } from "../../api/http";
import { AUTH } from "../../api/endpoint";

// Mirrors the required/optional fields signup_controller.js actually reads
// off req.body — see the plan's backend contract notes.
const schema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(["Admin", "Owner"]),
  isNationality: z.enum(["Yes", "No"]),
  companyName: z.string().min(1),
  companyEmail: z.string().email(),
  companyPhoneNumber: z.string().min(1),
  commercialNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  website: z.string().optional(),
  addr1: z.string().min(1),
  addr2: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  postalCode: z.string().optional(),
});

type SignupValues = z.infer<typeof schema>;

const defaultValues: SignupValues = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  role: "Owner",
  isNationality: "Yes",
  companyName: "",
  companyEmail: "",
  companyPhoneNumber: "",
  commercialNumber: "",
  vatNumber: "",
  website: "",
  addr1: "",
  addr2: "",
  country: "",
  city: "",
  area: "",
  street: "",
  building: "",
  postalCode: "",
};

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function SignupDialog({ open, onClose, onSuccess }: SignupDialogProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [logo, setLogo] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const handleClose = () => {
    reset();
    setLogo(null);
    setTab(0);
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    (Object.entries(values) as [keyof SignupValues, string][]).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (logo) formData.append("logo", logo);

    try {
      const { data } = await http.post<{ message: string }>(AUTH.signup, formData);
      enqueueSnackbar(data.message ?? t("auth.signup.success"), { variant: "success" });
      const email = values.email;
      handleClose();
      onSuccess(email);
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
      enqueueSnackbar(message ?? t("auth.login.genericError"), { variant: "error" });
    }
  });

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={t("auth.signup.title")}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <AppButton buttonVariant="outlined" colorType="secondary" onClick={handleClose}>
            {t("auth.signup.cancel")}
          </AppButton>
          <AppButton onClick={submit} loading={isSubmitting}>
            {t("auth.signup.submit")}
          </AppButton>
        </>
      }
    >
      <AppText colorType="secondary" sx={{ mb: 2 }}>
        {t("auth.signup.subtitle")}
      </AppText>

      <AppTabs
        tabs={[t("auth.signup.tabAccount"), t("auth.signup.tabCompany"), t("auth.signup.tabAddress")]}
        value={tab}
        onChange={setTab}
        sx={{ mb: 2 }}
      />

      <Box component="form" onSubmit={submit} noValidate>
        <Box sx={{ display: tab === 0 ? "block" : "none" }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Controller
                name="firstname"
                control={control}
                render={({ field }) => (
                  <AppInput {...field} label={t("auth.signup.firstname")} error={!!errors.firstname} helperText={errors.firstname ? t("auth.signup.required") : undefined} />
                )}
              />
              <Controller
                name="lastname"
                control={control}
                render={({ field }) => (
                  <AppInput {...field} label={t("auth.signup.lastname")} error={!!errors.lastname} helperText={errors.lastname ? t("auth.signup.required") : undefined} />
                )}
              />
            </Stack>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <AppInput {...field} label={t("auth.signup.email")} error={!!errors.email} helperText={errors.email ? t("auth.signup.required") : undefined} />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <AppInput {...field} label={t("auth.signup.phone")} />}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <AppPasswordInput
                  {...field}
                  label={t("auth.signup.password")}
                  error={!!errors.password}
                  helperText={t("auth.signup.passwordHint")}
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <AppSelectOne {...field} label={t("auth.signup.role")}>
                  <MenuItem value="Owner" sx={{ fontSize: "0.8rem" }}>{t("auth.signup.roleOwner")}</MenuItem>
                  <MenuItem value="Admin" sx={{ fontSize: "0.8rem" }}>{t("auth.signup.roleAdmin")}</MenuItem>
                </AppSelectOne>
              )}
            />
            <Controller
              name="isNationality"
              control={control}
              render={({ field }) => (
                <AppRadio
                  label={t("auth.signup.isNationality")}
                  value={field.value}
                  onChange={field.onChange}
                  row
                  options={[
                    { label: t("auth.signup.isNationalityYes"), value: "Yes" },
                    { label: t("auth.signup.isNationalityNo"), value: "No" },
                  ]}
                />
              )}
            />
          </Stack>
        </Box>

        <Box sx={{ display: tab === 1 ? "block" : "none" }}>
          <Stack spacing={2}>
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <AppInput {...field} label={t("auth.signup.companyName")} error={!!errors.companyName} helperText={errors.companyName ? t("auth.signup.required") : undefined} />
              )}
            />
            <Controller
              name="companyEmail"
              control={control}
              render={({ field }) => (
                <AppInput {...field} label={t("auth.signup.companyEmail")} error={!!errors.companyEmail} helperText={errors.companyEmail ? t("auth.signup.required") : undefined} />
              )}
            />
            <Controller
              name="companyPhoneNumber"
              control={control}
              render={({ field }) => (
                <AppInput {...field} label={t("auth.signup.companyPhoneNumber")} error={!!errors.companyPhoneNumber} helperText={errors.companyPhoneNumber ? t("auth.signup.required") : undefined} />
              )}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="commercialNumber"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.commercialNumber")} />}
              />
              <Controller
                name="vatNumber"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.vatNumber")} />}
              />
            </Stack>
            <Controller
              name="website"
              control={control}
              render={({ field }) => <AppInput {...field} label={t("auth.signup.website")} />}
            />
            <AppFileUpload label={t("auth.signup.logoUpload")} value={logo} onChange={setLogo} />
          </Stack>
        </Box>

        <Box sx={{ display: tab === 2 ? "block" : "none" }}>
          <Stack spacing={2}>
            <Controller
              name="addr1"
              control={control}
              render={({ field }) => (
                <AppInput {...field} label={t("auth.signup.addr1")} error={!!errors.addr1} helperText={errors.addr1 ? t("auth.signup.required") : undefined} />
              )}
            />
            <Controller
              name="addr2"
              control={control}
              render={({ field }) => <AppInput {...field} label={t("auth.signup.addr2")} />}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.country")} />}
              />
              <Controller
                name="city"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.city")} />}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="area"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.area")} />}
              />
              <Controller
                name="street"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.street")} />}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="building"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.building")} />}
              />
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => <AppInput {...field} label={t("auth.signup.postalCode")} />}
              />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </AppDialog>
  );
}
