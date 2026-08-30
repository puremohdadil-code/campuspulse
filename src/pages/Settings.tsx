import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MenuItem, Box } from "@mui/material";

import {
  AppSectionHeader,
  AppCard,
  AppInput,
  AppSelectOne,
  AppSelectMulti,
  AppSwitch,
  AppSettingRow,
  AppAccordion,
  AppButton,
  AppLoader,
  AppAlert,
  AppEmptyState,
} from "../components/common";

import { http } from "../api/http";
import { USER } from "../api/endpoint";

// Mirrors userSettingSchema.js — see the plan's backend contract notes.
const schema = z.object({
  currency: z.string().min(1),
  timezone: z.string().min(1),
  taxSystem: z.string().min(1),
  vatRate: z.coerce.number().min(0).max(1),
  batchingMethod: z.string().min(1),
  discountPolicy: z.string().min(1),
  TWM: z.boolean(),
  strict_control_mode: z.boolean(),
  needsApproval: z.array(z.string()),
  autoJournalEntry: z.array(z.string()),
  ThreeWayTolerances: z.object({
    quantityVariancePct: z.coerce.number(),
    priceVariancePct: z.coerce.number(),
    priceBlockThresholdPct: z.coerce.number(),
    qtyBlockThresholdPct: z.coerce.number(),
    duplicateInvoiceWindowDays: z.coerce.number(),
    maxInvoicesPerGRN: z.coerce.number(),
  }),
});

type SettingsValues = z.infer<typeof schema>;

const CURRENCY_OPTIONS = ["USD", "EGP", "SAR", "AED", "EUR", "GBP"];
const TIMEZONE_OPTIONS = ["UTC", "Africa/Cairo", "Asia/Riyadh", "Asia/Dubai", "Europe/London", "America/New_York"];
const TAX_SYSTEM_OPTIONS = ["VAT", "Sales Tax", "None"];
const BATCHING_OPTIONS = ["FIFO", "LIFO", "FEFO", "WeightedAverage"];
const DISCOUNT_POLICY_OPTIONS = [
  { value: "income", label: "Income" },
  { value: "contraRevenue", label: "Contra Revenue" },
];

const DOC_TYPE_OPTIONS = [
  { label: "Purchase Invoice", value: "PURCHASE_INVOICE" },
  { label: "Sale Invoice", value: "SALE_INVOICE" },
  { label: "Purchase Order", value: "PURCHASE_ORDER" },
  { label: "Sale Order", value: "SALE_ORDER" },
];

const JOURNAL_TYPE_OPTIONS = [
  { label: "Internal Purchase Invoice (IPI)", value: "IPI" },
  { label: "Manufacturing Order (IOM)", value: "IOM" },
  { label: "Internal Sale Invoice (ISI)", value: "ISI" },
  { label: "Internal Purchase Invoice Variance (IPIV)", value: "IPIV" },
];

export default function Settings() {
  const { t } = useTranslation();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await http.get<{ settings: SettingsValues }>(USER.settings);
      return data.settings;
    },
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <AppSectionHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      {isLoading && <AppLoader />}

      {isError &&
        (axios.isAxiosError(error) && error.response?.status === 404 ? (
          <AppEmptyState title={t("settings.notConfigured")} />
        ) : (
          <AppAlert severity="error">{t("settings.loadError")}</AppAlert>
        ))}

      {data && <SettingsForm initial={data} />}
    </Box>
  );
}

function SettingsForm({ initial }: { initial: SettingsValues }) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: initial });

  const twmEnabled = useWatch({ control, name: "TWM" });

  const submit = handleSubmit(async (values) => {
    try {
      const { data } = await http.put<{ message: string; settings: SettingsValues }>(USER.settings, values);
      enqueueSnackbar(data.message ?? t("settings.saved"), { variant: "success" });
      queryClient.setQueryData(["settings"], data.settings);
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
      const isForbidden = axios.isAxiosError(err) && err.response?.status === 403;
      enqueueSnackbar(message ?? (isForbidden ? t("settings.forbidden") : t("settings.loadError")), { variant: "error" });
    }
  });

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <AppCard title={t("settings.general")}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <AppSelectOne {...field} label={t("settings.currency")}>
                {CURRENCY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontSize: "0.8rem" }}>{c}</MenuItem>
                ))}
              </AppSelectOne>
            )}
          />
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <AppSelectOne {...field} label={t("settings.timezone")}>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <MenuItem key={tz} value={tz} sx={{ fontSize: "0.8rem" }}>{tz}</MenuItem>
                ))}
              </AppSelectOne>
            )}
          />
          <Controller
            name="taxSystem"
            control={control}
            render={({ field }) => (
              <AppSelectOne {...field} label={t("settings.taxSystem")}>
                {TAX_SYSTEM_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: "0.8rem" }}>{v}</MenuItem>
                ))}
              </AppSelectOne>
            )}
          />
          <Controller
            name="vatRate"
            control={control}
            render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.vatRate")} slotProps={{ htmlInput: { step: 0.01, min: 0, max: 1 } }} />
            )}
          />
          <Controller
            name="batchingMethod"
            control={control}
            render={({ field }) => (
              <AppSelectOne {...field} label={t("settings.batchingMethod")}>
                {BATCHING_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: "0.8rem" }}>{v}</MenuItem>
                ))}
              </AppSelectOne>
            )}
          />
          <Controller
            name="discountPolicy"
            control={control}
            render={({ field }) => (
              <AppSelectOne {...field} label={t("settings.discountPolicy")}>
                {DISCOUNT_POLICY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.8rem" }}>{o.label}</MenuItem>
                ))}
              </AppSelectOne>
            )}
          />
        </Box>
      </AppCard>

      <AppCard title={t("settings.controls")}>
        <Controller
          name="TWM"
          control={control}
          render={({ field }) => (
            <AppSettingRow
              label={t("settings.threeWayMatching")}
              description={t("settings.threeWayMatchingDesc")}
              control={<AppSwitch checked={field.value} onChange={field.onChange} />}
            />
          )}
        />
        <Controller
          name="strict_control_mode"
          control={control}
          render={({ field }) => (
            <AppSettingRow
              label={t("settings.strictControlMode")}
              description={t("settings.strictControlModeDesc")}
              control={<AppSwitch checked={field.value} onChange={field.onChange} />}
            />
          )}
        />
      </AppCard>

      <AppCard title={t("settings.automation")}>
        <Controller
          name="needsApproval"
          control={control}
          render={({ field }) => (
            <AppSettingRow
              label={t("settings.needsApproval")}
              description={t("settings.needsApprovalDesc")}
              control={
                <Box sx={{ minWidth: 220 }}>
                  <AppSelectMulti value={field.value} onChange={field.onChange} options={DOC_TYPE_OPTIONS} label={t("settings.needsApproval")} />
                </Box>
              }
            />
          )}
        />
        <Controller
          name="autoJournalEntry"
          control={control}
          render={({ field }) => (
            <AppSettingRow
              label={t("settings.autoJournalEntry")}
              description={t("settings.autoJournalEntryDesc")}
              control={
                <Box sx={{ minWidth: 220 }}>
                  <AppSelectMulti value={field.value} onChange={field.onChange} options={JOURNAL_TYPE_OPTIONS} label={t("settings.autoJournalEntry")} />
                </Box>
              }
            />
          )}
        />
      </AppCard>

      {twmEnabled && (
        <AppAccordion title={t("settings.tolerances")}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Controller name="ThreeWayTolerances.quantityVariancePct" control={control} render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.quantityVariancePct")} />
            )} />
            <Controller name="ThreeWayTolerances.priceVariancePct" control={control} render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.priceVariancePct")} />
            )} />
            <Controller name="ThreeWayTolerances.priceBlockThresholdPct" control={control} render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.priceBlockThresholdPct")} />
            )} />
            <Controller name="ThreeWayTolerances.qtyBlockThresholdPct" control={control} render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.qtyBlockThresholdPct")} />
            )} />
            <Controller name="ThreeWayTolerances.duplicateInvoiceWindowDays" control={control} render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.duplicateInvoiceWindowDays")} />
            )} />
            <Controller name="ThreeWayTolerances.maxInvoicesPerGRN" control={control} render={({ field }) => (
              <AppInput {...field} type="number" label={t("settings.maxInvoicesPerGRN")} />
            )} />
          </Box>
        </AppAccordion>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <AppButton type="submit" loading={isSubmitting}>
          {t("settings.save")}
        </AppButton>
      </Box>
    </Box>
  );
}
