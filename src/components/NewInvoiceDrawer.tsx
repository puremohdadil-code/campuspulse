import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { MenuItem, Stack } from "@mui/material";

import {
  AppDrawer,
  AppInput,
  AppSelectOne,
  AppSelectMulti,
  AppRadio,
  AppSwitch,
  AppCheckbox,
  AppDatePicker,
  AppButton,
  AppText,
} from "./common";

const CLIENT_OPTIONS = [
  "Nour Trading Co.",
  "Delta Foods",
  "Al Amal Pharma",
  "Cairo Steel",
  "Green Fields",
];

// Validation lives here, translation lives in the component — a failed
// field just looks up its own message by name at render time, so the
// schema itself stays a plain, reusable, language-agnostic contract.
const schema = z.object({
  client: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.any().refine((v) => v != null),
  status: z.enum(["Paid", "Pending", "Overdue"]),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(""),
  sendCopy: z.boolean().default(true),
  acceptTerms: z.boolean().refine((v) => v === true),
});

export type NewInvoiceValues = z.infer<typeof schema>;

interface NewInvoiceDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: NewInvoiceValues) => void;
}

export function NewInvoiceDrawer({ open, onClose, onCreate }: NewInvoiceDrawerProps) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      client: "",
      amount: "" as unknown as number,
      dueDate: null,
      status: "Pending" as const,
      tags: [] as string[],
      notes: "",
      sendCopy: true,
      acceptTerms: false,
    },
  });

  const statusOptions = [
    { label: t("dashboard.status.paid"), value: "Paid" },
    { label: t("dashboard.status.pending"), value: "Pending" },
    { label: t("dashboard.status.overdue"), value: "Overdue" },
  ];

  const tagOptions = [
    { label: t("invoiceForm.tagOptions.retail"), value: "retail" },
    { label: t("invoiceForm.tagOptions.wholesale"), value: "wholesale" },
    { label: t("invoiceForm.tagOptions.urgent"), value: "urgent" },
    { label: t("invoiceForm.tagOptions.recurring"), value: "recurring" },
  ];

  const submit = handleSubmit((values) => {
    onCreate(values);
    reset();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      title={t("invoiceForm.title")}
      subtitle={t("invoiceForm.subtitle")}
      footer={
        <>
          <AppButton buttonVariant="outlined" colorType="secondary" onClick={handleClose}>
            {t("invoiceForm.cancel")}
          </AppButton>
          <AppButton onClick={submit} loading={isSubmitting}>
            {t("invoiceForm.create")}
          </AppButton>
        </>
      }
    >
      <Stack spacing={2.5} component="form" onSubmit={submit} noValidate>
        <Controller
          name="client"
          control={control}
          render={({ field }) => (
            <AppSelectOne
              {...field}
              label={t("invoiceForm.client")}
              error={!!errors.client}
              helperText={errors.client ? t("invoiceForm.clientRequired") : undefined}
            >
              {CLIENT_OPTIONS.map((name) => (
                <MenuItem key={name} value={name} sx={{ fontSize: "0.8rem" }}>
                  {name}
                </MenuItem>
              ))}
            </AppSelectOne>
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              value={field.value ?? ""}
              type="number"
              label={t("invoiceForm.amount")}
              error={!!errors.amount}
              helperText={errors.amount ? t("invoiceForm.amountPositive") : undefined}
            />
          )}
        />

        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <AppDatePicker
              label={t("invoiceForm.dueDate")}
              value={field.value as never}
              onChange={field.onChange}
              slotProps={{
                textField: {
                  error: !!errors.dueDate,
                  helperText: errors.dueDate ? t("invoiceForm.dueDateRequired") : undefined,
                },
              }}
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <AppRadio label={t("invoiceForm.status")} options={statusOptions} value={field.value} onChange={field.onChange} row />
          )}
        />

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <AppSelectMulti label={t("invoiceForm.tags")} options={tagOptions} value={field.value ?? []} onChange={field.onChange} />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <AppInput {...field} label={t("invoiceForm.notes")} placeholder={t("invoiceForm.notesPlaceholder")} multiline rows={3} />
          )}
        />

        <Controller
          name="sendCopy"
          control={control}
          render={({ field }) => (
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <AppSwitch checked={field.value} onChange={field.onChange} />
              <AppText sx={{ fontSize: "0.8rem" }}>{t("invoiceForm.sendCopy")}</AppText>
            </Stack>
          )}
        />

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <>
              <AppCheckbox
                label={t("invoiceForm.acceptTerms")}
                checked={field.value}
                onChange={field.onChange}
              />
              {errors.acceptTerms && (
                <AppText colorType="error" sx={{ fontSize: "0.7rem", mt: -1.5 }}>
                  {t("invoiceForm.acceptTermsRequired")}
                </AppText>
              )}
            </>
          )}
        />
      </Stack>
    </AppDrawer>
  );
}
