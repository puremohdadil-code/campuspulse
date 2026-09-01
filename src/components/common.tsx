/* eslint-disable react-refresh/only-export-components */
import React, { useRef, useState } from "react";

import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  Paper, 
  Badge,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  AvatarGroup,
  Avatar,
  Radio,
  Checkbox,
  Chip,
  Tooltip as MuiTooltip,
  Divider,
  Box,
  Stack,
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  Pagination as MuiPagination,
  Alert as MuiAlert,
  CircularProgress,
  Skeleton,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { DataGridProps, GridValidRowModel } from "@mui/x-data-grid";

import type {
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
  TypographyProps,
  TextFieldProps,
  SelectProps,
  SwitchProps,
  AvatarProps,
  SelectChangeEvent,
  TabsProps,
  DialogProps,
  AlertProps,
} from "@mui/material";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

import { LineChart, BarChart, PieChart } from "@mui/x-charts";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { DatePickerProps } from "@mui/x-date-pickers/DatePicker";

import { COLORS, resolveCssVar } from "../styles/colors";
import { useThemeMode } from "../hooks/useThemeMode";

// re-exported so screens only ever need to import from "./common"
export { COLORS };

// COLORS.* values are CSS var() references (see styles/colors.ts) so the
// whole kit repaints for light/dark mode with zero re-renders — but that
// means MUI's own `alpha()` can't parse them (it needs a real hex/rgb).
// `mix` is a drop-in replacement using CSS color-mix() instead, which
// resolves the var() natively in the browser.
export function mix(colorVar: string, opacity: number): string {
  return `color-mix(in srgb, ${colorVar} ${Math.round(opacity * 100)}%, transparent)`;
}

// =====================================================
// Shared tokens — everything below derives from COLORS.
// Change COLORS (or the active THEME) and the whole kit
// re-skins itself. Nothing in this file hardcodes a color.
// =====================================================

export const RADIUS = 2.5; // ~10px — controls: buttons, inputs, chips
export const RADIUS_LG = 3.5; // ~14px — surfaces: cards, dialogs, menus
export const FONT = "0.8rem";
export const FONT_SM = "0.6rem";
export const FONT_XS = "1.0rem";

export const TRANSITION = "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)";

// Elevation — always derived from the active theme's tinted shadow color,
// so dark themes get a soft black glow while light themes get a subtle
// colored one, instead of one flat gray shadow everywhere.
export const SHADOW_SM = `0 1px 2px ${COLORS.shadow}`;
export const SHADOW_MD = `0 8px 24px -4px ${COLORS.shadow}`;
export const SHADOW_LG = `0 16px 40px -8px ${COLORS.shadow}`;

// Reusable field styling — reused by AppInput / AppSelectOne / AppSelectMulti
export const fieldSx = {
  fontSize: FONT,
  borderRadius: RADIUS,
  backgroundColor: COLORS.card,
  transition: TRANSITION,

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.border,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: mix(COLORS.primary, 0.5),
  },
  "&.Mui-focused": {
    boxShadow: `0 0 0 3px ${mix(COLORS.primary, 0.14)}`,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
} as const;

export const labelSx = {
  fontSize: FONT,
  color: COLORS.textLight,
  "&.Mui-focused": { color: COLORS.primary },
} as const;

const statusPalette = {
  default: { main: COLORS.textLight, bg: mix(COLORS.textLight, 0.12) },
  primary: { main: COLORS.primary, bg: mix(COLORS.primary, 0.12) },
  success: { main: COLORS.success, bg: mix(COLORS.success, 0.12) },
  warning: { main: COLORS.warning, bg: mix(COLORS.warning, 0.12) },
  error: { main: COLORS.error, bg: mix(COLORS.error, 0.12) },
  info: { main: COLORS.info, bg: mix(COLORS.info, 0.12) },
} as const;

type StatusColor = keyof typeof statusPalette;

// Palette used across all charts — always derived from COLORS, in a fixed
// order so the same series index gets the same color across charts.
export const CHART_PALETTE = [
  COLORS.primary,
  COLORS.info,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  COLORS.textLight,
];

interface Option {
  label: string;
  value: string;
}

// =====================================================
// Button
// =====================================================

interface AppButtonProps extends MuiButtonProps {
  colorType?: "primary" | "danger" | "secondary" | "success";
  buttonVariant?: "solid" | "outlined" | "ghost";
  loading?: boolean;
}

export function AppButton({
  children,
  colorType = "primary",
  buttonVariant = "solid",
  loading = false,
  disabled,
  sx,
  ...props
}: AppButtonProps) {
  const paletteMap = {
    primary: COLORS.primary,
    danger: COLORS.error,
    secondary: COLORS.textLight,
    success: COLORS.success,
  };
  const hoverMap = {
    primary: COLORS.primaryHover,
    danger: mix(COLORS.error, 0.85),
    secondary: mix(COLORS.textLight, 0.85),
    success: mix(COLORS.success, 0.85),
  };
  const mainColor = paletteMap[colorType];
  const hoverColor = hoverMap[colorType];

  const variantStyles = {
    solid: {
      backgroundColor: mainColor,
      color: COLORS.onPrimary,
      boxShadow: `0 1px 2px ${mix(mainColor, 0.25)}`,
      "&:hover": { backgroundColor: hoverColor, boxShadow: `0 4px 12px ${mix(mainColor, 0.32)}` },
    },
    outlined: {
      backgroundColor: "transparent",
      color: mainColor,
      border: `1.5px solid ${mix(mainColor, 0.45)}`,
      "&:hover": { backgroundColor: mix(mainColor, 0.08), borderColor: mainColor },
    },
    ghost: {
      backgroundColor: mix(mainColor, 0.1),
      color: mainColor,
      "&:hover": { backgroundColor: mix(mainColor, 0.18) },
    },
  } as const;

  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      variant="contained"
      sx={{
        minHeight: 38,
        px: 2.5,
        py: 0.7,
        borderRadius: RADIUS,
        textTransform: "none",
        fontSize: FONT,
        fontWeight: 600,
        letterSpacing: "0.01em",
        boxShadow: "none",
        transition: TRANSITION,
        gap: 0.75,
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...variantStyles[buttonVariant],
        "&:hover": { ...variantStyles[buttonVariant]["&:hover"], transform: "translateY(-1px)" },
        "&:active": { transform: "translateY(0)" },
        "&:disabled": {
          backgroundColor: buttonVariant === "solid" ? COLORS.border : "transparent",
          color: COLORS.textMuted,
          boxShadow: "none",
          border: buttonVariant === "outlined" ? `1.5px solid ${COLORS.border}` : undefined,
        },
        ...sx,
      }}
    >
      {loading ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : children}
    </MuiButton>
  );
}

// =====================================================
// Link — inline text action (auth screens: "Forgot password?",
// "Sign up", "Back to sign in", ...). Renders a <button> so it works
// as an onClick handler, not just navigation.
// =====================================================

interface AppLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AppLink({ children, style, ...props }: AppLinkProps) {
  return (
    <button
      type="button"
      {...props}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        color: COLORS.primary,
        fontSize: FONT,
        fontWeight: 600,
        fontFamily: "inherit",
        textDecoration: "none",
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
    >
      {children}
    </button>
  );
}

// =====================================================
// Icon Button
// =====================================================

interface AppIconButtonProps extends MuiIconButtonProps {
  colorType?: "primary" | "danger" | "secondary";
  tone?: "ghost" | "solid";
}

export function AppIconButton({
  children,
  colorType = "primary",
  tone = "ghost",
  sx,
  ...props
}: AppIconButtonProps) {
  const paletteMap = {
    primary: COLORS.primary,
    danger: COLORS.error,
    secondary: COLORS.textLight,
  };
  const hoverMap = {
    primary: COLORS.primaryHover,
    danger: mix(COLORS.error, 0.85),
    secondary: mix(COLORS.textLight, 0.85),
  };
  const mainColor = paletteMap[colorType];

  return (
    <MuiIconButton
      {...props}
      size="small"
      sx={{
        borderRadius: RADIUS,
        backgroundColor: tone === "solid" ? mainColor : mix(mainColor, 0.1),
        color: tone === "solid" ? COLORS.onPrimary : mainColor,
        transition: TRANSITION,
        "&:hover": {
          backgroundColor: tone === "solid" ? hoverMap[colorType] : mix(mainColor, 0.18),
          transform: "translateY(-1px)",
        },
        ...sx,
      }}
    >
      {children}
    </MuiIconButton>
  );
}

// =====================================================
// Typography
// =====================================================

interface AppTextProps extends TypographyProps {
  colorType?: "primary" | "secondary" | "success" | "warning" | "error";
  weight?: number;
  truncate?: boolean;
}

export function AppText({
  children,
  colorType = "primary",
  weight = 400,
  truncate = false,
  sx,
  ...props
}: AppTextProps) {
  const colorMap = {
    primary: COLORS.text,
    secondary: COLORS.textLight,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
  };

  return (
    <Typography
      {...props}
      sx={{
        color: colorMap[colorType],
        fontSize: FONT,
        lineHeight: 1.5,
        fontWeight: weight,
        ...(truncate && {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

// =====================================================
// Input
// =====================================================

type AppInputProps = TextFieldProps & {
  label?: string;
};

export function AppInput({ label = "Input", sx, ...props }: AppInputProps) {
  return (
    <FormControl fullWidth>
      <TextField
        {...props}
        label={label}
        size="small"
        variant="outlined"
        sx={{
          "& .MuiInputBase-root": fieldSx,
          "& .MuiInputLabel-root": labelSx,
          "& .MuiFormHelperText-root": { fontSize: FONT, ml: 0.25 },
          ...sx,
        }}
      />
    </FormControl>
  );
}

// =====================================================
// Password Input — AppInput with a show/hide toggle
// =====================================================

export function AppPasswordInput({ label = "Password", slotProps, ...props }: AppInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AppInput
      {...props}
      label={label}
      type={visible ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <AppIconButton
                tone="ghost"
                colorType="secondary"
                edge="end"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
              </AppIconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

// =====================================================
// Select (single)
// =====================================================

type AppSelectProps = SelectProps & {
  label?: string;
  helperText?: string;
};

export function AppSelectOne({ label = "Select", helperText, sx, children, ...props }: AppSelectProps) {
  return (
    <FormControl fullWidth size="small" error={props.error}>
      <InputLabel sx={labelSx}>{label}</InputLabel>
      <Select {...props} label={label} sx={{ ...fieldSx, ...sx }}>
        {children}
      </Select>
      {helperText && <FormHelperText sx={{ fontSize: FONT, ml: 0.25 }}>{helperText}</FormHelperText>}
    </FormControl>
  );
}

// =====================================================
// Select (multi) — real multi-select with removable chips
// =====================================================

interface AppSelectMultiProps extends Omit<SelectProps<string[]>, "multiple" | "value" | "onChange"> {
  label?: string;
  value: string[];
  options: Option[];
  onChange: (value: string[]) => void;
}

export function AppSelectMulti({
  label = "Select",
  value,
  options,
  onChange,
  sx,
  ...props
}: AppSelectMultiProps) {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const next = event.target.value;
    onChange(typeof next === "string" ? next.split(",") : next);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel sx={labelSx}>{label}</InputLabel>
      <Select
        {...props}
        multiple
        value={value}
        onChange={handleChange}
        label={label}
        sx={{ ...fieldSx, ...sx }}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <Chip
                  key={val}
                  label={opt?.label ?? val}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: FONT,
                    backgroundColor: mix(COLORS.primary, 0.12),
                    color: COLORS.primary,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Box>
        )}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: FONT }}>
            <Checkbox
              size="small"
              checked={value.includes(opt.value)}
              sx={{ color: COLORS.border, "&.Mui-checked": { color: COLORS.primary } }}
            />
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// =====================================================
// Date picker — thin wrapper over @mui/x-date-pickers, styled
// to match AppInput. Needs a <LocalizationProvider> ancestor
// (App.tsx wraps the app with AdapterLuxon).
// =====================================================

interface AppDatePickerProps extends Omit<DatePickerProps, "label"> {
  label?: string;
}

export function AppDatePicker({ label = "Date", slotProps, ...props }: AppDatePickerProps) {
  return (
    <DatePicker
      {...props}
      label={label}
      slotProps={{
        ...slotProps,
        textField: {
          size: "small",
          fullWidth: true,
          sx: { "& .MuiInputBase-root": fieldSx, "& .MuiInputLabel-root": labelSx },
          ...slotProps?.textField,
        },
        popper: {
          sx: {
            "& .MuiPaper-root": {
              borderRadius: RADIUS_LG,
              border: `1px solid ${COLORS.border}`,
              boxShadow: SHADOW_LG,
              backgroundColor: COLORS.card,
              backgroundImage: "none",
            },
            "& .MuiPickersDay-root": { fontSize: FONT },
            "& .MuiPickersDay-root.Mui-selected": {
              backgroundColor: `${COLORS.primary} !important`,
              color: `${COLORS.onPrimary} !important`,
            },
          },
          ...slotProps?.popper,
        },
      }}
    />
  );
}

// =====================================================
// OTP Input — fixed-length numeric code entry (email/phone
// verification), auto-advance + backspace + paste support.
// =====================================================

interface AppOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  error?: boolean;
}

export function AppOtpInput({ length = 6, value, onChange, autoFocus, error }: AppOtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <Stack direction="row" spacing={1}>
      {digits.map((digit, i) => (
        <TextField
          key={i}
          inputRef={(el: HTMLInputElement | null) => { inputsRef.current[i] = el; }}
          value={digit}
          error={error}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={autoFocus && i === 0}
          size="small"
          slotProps={{
            htmlInput: {
              maxLength: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: { textAlign: "center", fontSize: "1.1rem", fontWeight: 700, padding: "10px 0" },
            },
          }}
          sx={{ width: 44, "& .MuiInputBase-root": fieldSx }}
        />
      ))}
    </Stack>
  );
}

// =====================================================
// File Upload — button + filename preview. Use for optional
// single-file fields (e.g. a company logo on signup).
// =====================================================

interface AppFileUploadProps {
  label?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}

export function AppFileUpload({ label = "Upload file", value, onChange, accept = "image/*" }: AppFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <AppButton type="button" buttonVariant="outlined" colorType="secondary" onClick={() => inputRef.current?.click()}>
        {label}
      </AppButton>
      <AppText colorType="secondary" truncate sx={{ maxWidth: 200 }}>
        {value ? value.name : "No file chosen"}
      </AppText>
      {value && (
        <AppIconButton colorType="danger" onClick={() => onChange(null)} aria-label="Remove file">
          <CloseOutlinedIcon fontSize="small" />
        </AppIconButton>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </Stack>
  );
}

// =====================================================
// Checkbox
// =====================================================

export function AppCheckbox({ label, sx, ...props }: { label?: string } & React.ComponentProps<typeof Checkbox>) {
  const box = (
    <Checkbox
      {...props}
      size="small"
      sx={{
        color: COLORS.border,
        "&.Mui-checked": { color: COLORS.primary },
        ...sx,
      }}
    />
  );

  if (!label) return box;

  return (
    <FormControlLabel
      control={box}
      label={<AppText colorType="primary">{label}</AppText>}
      sx={{ ml: 0 }}
    />
  );
}

// =====================================================
// Avatar
// =====================================================

export function AppAvatar(props: AvatarProps) {
  return (
    <Avatar
      {...props}
      sx={{
        width: 32,
        height: 32,
        fontSize: "0.8rem",
        fontWeight: 600,
        backgroundColor: mix(COLORS.primary, 0.15),
        color: COLORS.primary,
        ...props.sx,
      }}
    />
  );
}

interface AppAvatarGroupProps {
  users: { name: string; image?: string }[];
  total?: number;
}

export function AppAvatarGroup({ users, total }: AppAvatarGroupProps) {
  return (
    <AvatarGroup
      max={5}
      total={total}
      sx={{ "& .MuiAvatar-root": { width: 32, height: 32, fontSize: "0.75rem", borderColor: COLORS.card, borderWidth: 2 } }}
    >
      {users.map((user, index) => (
        <AppAvatar key={index} alt={user.name} src={user.image} />
      ))}
    </AvatarGroup>
  );
}

// =====================================================
// Switch
// =====================================================

export function AppSwitch(props: SwitchProps) {
  return (
    <Switch
      {...props}
      size="small"
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": { color: COLORS.primary },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: COLORS.primary,
          opacity: 0.5,
        },
      }}
    />
  );
}

// =====================================================
// Radio
// =====================================================

interface AppRadioProps {
  label: string;
  options: Option[];
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  row?: boolean;
}

export function AppRadio({ label, options, value, onChange, row = false }: AppRadioProps) {
  return (
    <FormControl>
      <FormLabel sx={{ fontSize: FONT, color: COLORS.textLight, "&.Mui-focused": { color: COLORS.primary } }}>
        {label}
      </FormLabel>
      <RadioGroup value={value} onChange={onChange} row={row}>
        {options.map((item) => (
          <FormControlLabel
            key={item.value}
            value={item.value}
            control={
              <Radio
                size="small"
                sx={{ color: COLORS.border, "&.Mui-checked": { color: COLORS.primary } }}
              />
            }
            label={<AppText colorType="primary">{item.label}</AppText>}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

// =====================================================
// Badge
// =====================================================

interface AppBadgeProps {
  children?: React.ReactNode;
  count?: number;
  dot?: boolean;
  colorType?: StatusColor;
}

export function AppBadge({ children, count, dot = false, colorType = "primary" }: AppBadgeProps) {
  const tone = statusPalette[colorType];
  return (
    <Badge
      badgeContent={dot ? undefined : count}
      variant={dot ? "dot" : "standard"}
      sx={{
        "& .MuiBadge-badge": {
          backgroundColor: tone.main,
          color: colorType === "primary" ? COLORS.onPrimary : COLORS.white,
          fontSize: FONT_SM,
          fontWeight: 600,
        },
      }}
    >
      {children}
    </Badge>
  );
}

// =====================================================
// Chip (status / tag)
// =====================================================

interface AppChipProps {
  label: React.ReactNode;
  colorType?: StatusColor;
  onDelete?: () => void;
  size?: "small" | "medium";
}

export function AppChip({ label, colorType = "default", onDelete, size = "small" }: AppChipProps) {
  const tone = statusPalette[colorType];
  return (
    <Chip
      label={label}
      onDelete={onDelete}
      size={size}
      sx={{
        backgroundColor: tone.bg,
        color: tone.main,
        fontWeight: 600,
        fontSize: FONT_SM,
        borderRadius: 1,
        "& .MuiChip-deleteIcon": { color: tone.main, "&:hover": { color: tone.main } },
      }}
    />
  );
}

// =====================================================
// Tooltip
// =====================================================

export function AppTooltip({ children, ...props }: React.ComponentProps<typeof MuiTooltip>) {
  // Swap text/background rather than hardcoding "dark bg, white text": in a
  // dark theme COLORS.text is already the light color, so this always lands
  // on a tooltip that contrasts with the page, light or dark.
  return (
    <MuiTooltip
      {...props}
      arrow
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: COLORS.text,
            color: COLORS.background,
            fontSize: FONT,
            fontWeight: 500,
            borderRadius: 1.25,
            px: 1.25,
            py: 0.6,
            boxShadow: SHADOW_MD,
          },
        },
        arrow: { sx: { color: COLORS.text } },
      }}
    >
      {children}
    </MuiTooltip>
  );
}

// =====================================================
// Divider
// =====================================================

export function AppDivider(props: React.ComponentProps<typeof Divider>) {
  return <Divider {...props} sx={{ borderColor: COLORS.border, ...props.sx }} />;
}

// =====================================================
// Card
// =====================================================

interface AppCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dense?: boolean;
}

export function AppCard({ title, subtitle, action, children, footer, dense = true }: AppCardProps) {
  return (
    <MuiCard
      elevation={0}
      sx={{
        borderRadius: RADIUS_LG,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
        boxShadow: SHADOW_SM,
        transition: TRANSITION,
      }}
    >
      {title && (
        <CardHeader
          title={<AppText weight={700}>{title}</AppText>}
          subheader={subtitle && <AppText colorType="secondary" sx={{ fontSize: FONT }}>{subtitle}</AppText>}
          action={action}
          sx={{ pb: dense ? 1 : 2 }}
        />
      )}
      <CardContent sx={{ pt: title ? 0 : 2, "&:last-child": { pb: dense ? 1.5 : 2 } }}>{children}</CardContent>
      {footer && <CardActions sx={{ px: 2, pb: 1.5, borderTop: `1px solid ${COLORS.border}` }}>{footer}</CardActions>}
    </MuiCard>
  );
}

// =====================================================
// Section Header — title/subtitle + right-aligned actions
// (list page headers, panel headers, etc.)
// =====================================================

interface AppSectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppSectionHeader({ title, subtitle, actions }: AppSectionHeaderProps) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        rowGap: 1.5,
        columnGap: 2,
        mb: 2,
        pb: 1.5,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <AppText weight={800} sx={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
          {title}
        </AppText>
        {subtitle && (
          <AppText colorType="secondary" sx={{ fontSize: FONT, mt: 0.25 }}>
            {subtitle}
          </AppText>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

// =====================================================
// Dialog
// =====================================================

interface AppDialogProps extends Omit<DialogProps, "title"> {
  title?: string;
  actions?: React.ReactNode;
}

export function AppDialog({ title, actions, children, sx, ...props }: AppDialogProps) {
  return (
    <Dialog
      {...props}
      sx={sx}
      slotProps={{
        paper: {
          sx: {
            borderRadius: RADIUS_LG,
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOW_LG,
            backgroundColor: COLORS.card,
            backgroundImage: "none",
            minWidth: 360,
          },
        },
      }}
    >
      {title && (
        <DialogTitle sx={{ fontSize: "1.05rem", fontWeight: 700, color: COLORS.text }}>{title}</DialogTitle>
      )}
      <DialogContent sx={{ fontSize: FONT }}>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, pb: 2 }}>{actions}</DialogActions>}
    </Dialog>
  );
}

// =====================================================
// Drawer — slide-in side panel for forms / detail views.
// Prefer this over AppDialog when the content is a form with
// several fields (invoices, records, settings, ...).
// =====================================================

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  anchor?: "left" | "right";
}

export function AppDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 460,
  anchor = "right",
}: AppDrawerProps) {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: width },
            maxWidth: "100vw",
            backgroundColor: COLORS.card,
            backgroundImage: "none",
            boxShadow: SHADOW_LG,
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {(title || subtitle) && (
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            px: 3,
            py: 2.5,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <AppText weight={800} sx={{ fontSize: "1.1rem" }}>
                {title}
              </AppText>
            )}
            {subtitle && (
              <AppText colorType="secondary" sx={{ fontSize: FONT, mt: 0.25 }}>
                {subtitle}
              </AppText>
            )}
          </Box>
          <AppIconButton onClick={onClose} aria-label="Close">
            <CloseOutlinedIcon fontSize="small" />
          </AppIconButton>
        </Stack>
      )}

      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>{children}</Box>

      {footer && (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", px: 3, py: 2, borderTop: `1px solid ${COLORS.border}` }}>
          {footer}
        </Stack>
      )}
    </Drawer>
  );
}

// =====================================================
// Tabs
// =====================================================

interface AppTabsProps extends Omit<TabsProps, "onChange"> {
  tabs: string[];
  value: number;
  onChange: (value: number) => void;
}

export function AppTabs({ tabs, value, onChange, sx, ...props }: AppTabsProps) {
  return (
    <Tabs
      {...props}
      value={value}
      onChange={(_, v) => onChange(v)}
      slotProps={{ indicator: { style: { backgroundColor: COLORS.primary } } }}
      sx={{
        minHeight: 36,
        borderBottom: `1px solid ${COLORS.border}`,
        "& .MuiTab-root": {
          fontSize: FONT,
          textTransform: "none",
          fontWeight: 600,
          color: COLORS.textLight,
          minHeight: 36,
        },
        "& .Mui-selected": { color: `${COLORS.primary} !important` },
        ...sx,
      }}
    >
      {tabs.map((t) => (
        <Tab key={t} label={t} />
      ))}
    </Tabs>
  );
}

// =====================================================
// Accordion
// =====================================================

interface AppAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function AppAccordion({ title, children, defaultExpanded = false }: AppAccordionProps) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      elevation={0}
      disableGutters
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: `${RADIUS_LG * 4}px !important`,
        backgroundColor: COLORS.card,
        transition: TRANSITION,
        "&:before": { display: "none" },
        "&:hover": { borderColor: COLORS.borderStrong },
        overflow: "hidden",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: COLORS.textLight }} />}>
        <AppText weight={600}>{title}</AppText>
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: `1px solid ${COLORS.border}` }}>{children}</AccordionDetails>
    </Accordion>
  );
}

// =====================================================
// Menu (dropdown) — pass a trigger renderer + items
// =====================================================

interface AppMenuProps {
  trigger: (open: (e: React.MouseEvent<HTMLElement>) => void) => React.ReactNode;
  items: { label: string; onClick: () => void; danger?: boolean }[];
}

export function AppMenu({ trigger, items }: AppMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      {trigger((e) => setAnchor(e.currentTarget))}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: RADIUS,
              border: `1px solid ${COLORS.border}`,
              boxShadow: SHADOW_LG,
              backgroundColor: COLORS.card,
              backgroundImage: "none",
              minWidth: 160,
              mt: 0.5,
            },
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              item.onClick();
              setAnchor(null);
            }}
            sx={{
              fontSize: FONT,
              color: item.danger ? COLORS.error : COLORS.text,
              mx: 0.5,
              my: 0.25,
              borderRadius: 1.25,
              "&:hover": { backgroundColor: item.danger ? mix(COLORS.error, 0.1) : COLORS.cardHover },
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// =====================================================
// Pagination
// =====================================================

export function AppPagination(props: React.ComponentProps<typeof MuiPagination>) {
  return (
    <MuiPagination
      {...props}
      shape="rounded"
      size="small"
      sx={{
        "& .MuiPaginationItem-root": { fontSize: FONT, borderRadius: RADIUS, transition: TRANSITION },
        "& .Mui-selected": {
          backgroundColor: `${COLORS.primary} !important`,
          color: COLORS.onPrimary,
        },
        ...props.sx,
      }}
    />
  );
}

// =====================================================
// Alert (inline banner — use SweetAlert2 for confirmations)
// =====================================================

interface AppAlertProps extends Omit<AlertProps, "severity" | "color"> {
  severity: "success" | "warning" | "error" | "info";
}

const alertIcon = {
  success: <CheckCircleIcon fontSize="inherit" />,
  warning: <WarningAmberIcon fontSize="inherit" />,
  error: <ErrorIcon fontSize="inherit" />,
  info: <InfoIcon fontSize="inherit" />,
};

export function AppAlert({ severity, children, sx, ...props }: AppAlertProps) {
  const tone = statusPalette[severity];
  return (
    <MuiAlert
      {...props}
      icon={alertIcon[severity]}
      sx={{
        borderRadius: RADIUS,
        fontSize: FONT,
        fontWeight: 500,
        backgroundColor: tone.bg,
        color: tone.main,
        border: `1px solid ${mix(tone.main, 0.25)}`,
        "& .MuiAlert-icon": { color: tone.main },
        ...sx,
      }}
    >
      {children}
    </MuiAlert>
  );
}

// =====================================================
// Loader
// =====================================================

export function AppLoader({ label, size = 28 }: { label?: string; size?: number }) {
  return (
    <Stack spacing={1} sx={{ alignItems: "center", justifyContent: "center", py: 4 }}>
      <CircularProgress size={size} sx={{ color: COLORS.primary }} />
      {label && <AppText colorType="secondary">{label}</AppText>}
    </Stack>
  );
}

export function AppSkeletonRows({ rows = 4, height = 36 }: { rows?: number; height?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={height}
          sx={{ borderRadius: RADIUS, backgroundColor: mix(COLORS.border, 0.5) }}
        />
      ))}
    </Stack>
  );
}

// =====================================================
// Empty state
// =====================================================

interface AppEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function AppEmptyState({
  title = "لا توجد بيانات",
  description,
  action,
  icon,
}: AppEmptyStateProps) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: "center", justifyContent: "center", py: 6, textAlign: "center" }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: mix(COLORS.primary, 0.1),
          color: COLORS.primary,
        }}
      >
        {icon ?? <InboxOutlinedIcon fontSize="small" />}
      </Box>
      <AppText weight={700}>{title}</AppText>
      {description && <AppText colorType="secondary" sx={{ maxWidth: 320 }}>{description}</AppText>}
      {action}
    </Stack>
  );
}

// =====================================================
// Setting Row — label + description + right-aligned control
// (switch/select/input). Use inside an AppCard for Settings screens.
// =====================================================

interface AppSettingRowProps {
  label: string;
  description?: string;
  control: React.ReactNode;
}

export function AppSettingRow({ label, description, control }: AppSettingRowProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        "&:not(:last-of-type)": { borderBottom: `1px solid ${COLORS.border}` },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <AppText weight={600}>{label}</AppText>
        {description && (
          <AppText colorType="secondary" sx={{ fontSize: FONT, mt: 0.25 }}>
            {description}
          </AppText>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Stack>
  );
}

// =====================================================
// Info Row — label/value display row for read-only screens
// (Profile, summaries).
// =====================================================

interface AppInfoRowProps {
  label: string;
  value: React.ReactNode;
}

export function AppInfoRow({ label, value }: AppInfoRowProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
        "&:not(:last-of-type)": { borderBottom: `1px solid ${COLORS.border}` },
      }}
    >
      <AppText colorType="secondary">{label}</AppText>
      <AppText weight={600} sx={{ textAlign: "right" }}>
        {value}
      </AppText>
    </Stack>
  );
}

// =====================================================
// Nav Sidebar
// =====================================================

export interface AppNavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface AppSidebarProps {
  items: AppNavItem[];
  title?: string;
  subtitle?: string;
  width?: number;
  footer?: React.ReactNode;
  /** Controls the overlay drawer below the `md` breakpoint. Ignored on desktop, where the sidebar is always visible. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({
  items,
  title = "FatoraGo",
  subtitle,
  width = 240,
  footer,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const paperSx = {
    width,
    boxSizing: "border-box" as const,
    backgroundColor: COLORS.card,
    borderInlineEnd: `1px solid ${COLORS.border}`,
    boxShadow: SHADOW_SM,
    display: "flex",
    flexDirection: "column" as const,
  };

  const content = (
    <>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: RADIUS,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.95rem",
            color: COLORS.onPrimary,
            backgroundColor: COLORS.primary,
            boxShadow: `0 2px 8px ${mix(COLORS.primary, 0.35)}`,
          }}
        >
          {title.trim().charAt(0)}
        </Box>
        <Box sx={{ overflow: "hidden" }}>
          <AppText weight={800} sx={{ fontSize: "1.0rem" }} truncate>
            {title}
          </AppText>
          {subtitle && (
            <AppText colorType="secondary" sx={{ fontSize: FONT_SM }} truncate>
              {subtitle}
            </AppText>
          )}
        </Box>
      </Stack>

      <AppDivider />

      <List sx={{ px: 1.5, py: 1.5, flex: 1, overflowY: "auto" }}>
        {items.map((item) => (
          <ListItemButton
            key={item.label}
            selected={item.active}
            onClick={() => {
              item.onClick?.();
              onMobileClose?.();
            }}
            sx={{
              position: "relative",
              borderRadius: RADIUS,
              mb: 0.5,
              minHeight: 40,
              color: item.active ? COLORS.primary : COLORS.textLight,
              transition: TRANSITION,
              "&::before": {
                content: '""',
                position: "absolute",
                insetInlineStart: -12,
                top: "20%",
                height: "60%",
                width: 3,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
                opacity: item.active ? 1 : 0,
                transition: TRANSITION,
              },
              "&:hover": { backgroundColor: item.active ? undefined : COLORS.cardHover, color: COLORS.text },
              "&.Mui-selected": { backgroundColor: mix(COLORS.primary, 0.1) },
              "&.Mui-selected:hover": { backgroundColor: mix(COLORS.primary, 0.14) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText slotProps={{ primary: { sx: { fontSize: FONT, fontWeight: item.active ? 700 : 500 } } }}>
              {item.label}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>

      {footer && (
        <Box sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>{footer}</Box>
      )}
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }}>
      {/* Mobile: overlay drawer, closed by default, toggled from AppNav's hamburger button */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        {content}
      </Drawer>

      {/* Desktop: always-visible fixed sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: "none", md: "block" },
          width,
          "& .MuiDrawer-paper": { ...paperSx, position: "fixed" },
        }}
        open
      >
        {content}
      </Drawer>
    </Box>
  );
}

// =====================================================
// Stat Card (KPI tile for dashboards)
// =====================================================

interface AppStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" };
}

export function AppStatCard({ label, value, icon, trend }: AppStatCardProps) {
  return (
    <MuiCard
      elevation={0}
      sx={{
        borderRadius: RADIUS_LG,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
        boxShadow: SHADOW_SM,
        transition: TRANSITION,
        p: 2.25,
        "&:hover": { boxShadow: SHADOW_MD, borderColor: COLORS.borderStrong, transform: "translateY(-2px)" },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <AppText colorType="secondary" weight={600} sx={{ fontSize: FONT }}>
            {label}
          </AppText>
          <AppText weight={800} sx={{ fontSize: "1.5rem", mt: 0.5, letterSpacing: "-0.02em" }}>
            {value}
          </AppText>
        </Box>
        {icon && (
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: RADIUS,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: mix(COLORS.primary, 0.1),
              color: COLORS.primary,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>

      {trend && (
        <Box sx={{ mt: 1.5 }}>
          <AppChip
            label={`${trend.direction === "up" ? "▲" : "▼"} ${trend.value}`}
            colorType={trend.direction === "up" ? "success" : "error"}
          />
        </Box>
      )}
    </MuiCard>
  );
}

// =====================================================
// Charts — thin wrappers over @mui/x-charts, always
// themed from COLORS / CHART_PALETTE.
//   npm i @mui/x-charts   (if not already installed)
// =====================================================

const chartSx = {
  "& .MuiChartsAxis-line": { stroke: COLORS.border },
  "& .MuiChartsAxis-tick": { stroke: COLORS.border },
  "& .MuiChartsAxis-tickLabel": { fill: COLORS.textLight, fontSize: 11 },
  "& .MuiChartsGrid-line": { stroke: mix(COLORS.border, 0.6) },
  "& .MuiChartsLegend-series text": { fontSize: "11px !important", fill: `${COLORS.textLight} !important` },
} as const;

interface ChartSeries {
  data: number[];
  label: string;
  color?: string;
}

// @mui/x-charts paints series colors via a raw SVG `fill`/`stroke`
// attribute (not a CSS rule), where var() support is inconsistent across
// browsers/renderers. So — unlike the rest of this file — chart colors
// get resolved to literal hex values here, refreshed whenever mode flips.
function useResolvedChartPalette(): string[] {
  const [mode] = useThemeMode();
  return React.useMemo(
    () => CHART_PALETTE.map((c) => resolveCssVar(c)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );
}

export function AppLineChart({
  xLabels,
  series,
  height = 280,
}: {
  xLabels: (string | number)[];
  series: ChartSeries[];
  height?: number;
}) {
  const palette = useResolvedChartPalette();
  return (
    <LineChart
      height={height}
      xAxis={[{ scaleType: "point", data: xLabels }]}
      series={series.map((s, i) => ({
        data: s.data,
        label: s.label,
        color: s.color ?? palette[i % palette.length],
        curve: "monotoneX",
        area: series.length === 1,
      }))}
      grid={{ horizontal: true }}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "end" } } }}
      sx={chartSx}
    />
  );
}

export function AppBarChart({
  categories,
  series,
  height = 280,
}: {
  categories: string[];
  series: ChartSeries[];
  height?: number;
}) {
  const palette = useResolvedChartPalette();
  return (
    <BarChart
      height={height}
      xAxis={[{ scaleType: "band", data: categories }]}
      series={series.map((s, i) => ({
        data: s.data,
        label: s.label,
        color: s.color ?? palette[i % palette.length],
      }))}
      borderRadius={6}
      grid={{ horizontal: true }}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "end" } } }}
      sx={chartSx}
    />
  );
}

export function AppPieChart({
  data,
  height = 240,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const palette = useResolvedChartPalette();
  return (
    <PieChart
      height={height}
      series={[
        {
          data: data.map((d, i) => ({
            id: i,
            value: d.value,
            label: d.label,
            color: d.color ?? palette[i % palette.length],
          })),
          innerRadius: 45,
          paddingAngle: 2,
          cornerRadius: 4,
        },
      ]}
      slotProps={{ legend: { direction: "vertical", position: { vertical: "middle" } } }}
      sx={chartSx}
    />
  );
}

// =====================================================
// Table
// =====================================================

interface AppTableProps<R extends GridValidRowModel> extends DataGridProps<R> {
  /** Custom "no rows" content — falls back to the DataGrid default when omitted. Pass an <AppTableEmptyState /> for the kit's themed empty state. */
  emptyState?: React.ReactNode;
}

export function AppTable<R extends GridValidRowModel = GridValidRowModel>({
  emptyState,
  slots,
  ...props
}: AppTableProps<R>) {
  return (
    <Paper
      sx={{
        height: 400,
        width: "100%",
        minWidth: 0,
        borderRadius: RADIUS_LG,
        overflow: "hidden",
        boxShadow: SHADOW_SM,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
      }}
    >
      <DataGrid<R>
        {...props}
        slots={{
          ...(emptyState ? { noRowsOverlay: () => <>{emptyState}</> } : {}),
          ...slots,
        }}
        sx={{
          border: 0,
          backgroundColor: COLORS.card,
          fontSize: FONT,
          color: COLORS.text,

          "& .MuiDataGrid-columnHeaders": {
            fontSize: FONT,
            fontWeight: 700,
            backgroundColor: COLORS.cardHover,
            borderBottom: `1px solid ${COLORS.border}`,
          },
          // Cells with a custom renderCell (chips, icon-button stacks, monospace
          // text) render at their own intrinsic height, which can differ from a
          // plain single-line cell in the same row — force every cell to center
          // its content vertically so columns line up regardless of what's inside.
          "& .MuiDataGrid-cell": {
            borderColor: COLORS.border,
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          "& .MuiDataGrid-row": { transition: TRANSITION },
          "& .MuiDataGrid-row:hover": { backgroundColor: mix(COLORS.primary, 0.05) },
          "& .MuiDataGrid-footerContainer": { borderTop: `1px solid ${COLORS.border}` },
          "& .MuiTablePagination-root": { fontSize: FONT },
          ...props.sx,
        }}
      />
    </Paper>
  );
}

// =====================================================
// Table Empty State — dashed, on-brand "no rows" placeholder for
// AppTable's `emptyState` prop (list pages with nothing added yet).
// =====================================================

interface AppTableEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  tip?: React.ReactNode;
}

export function AppTableEmptyState({
  icon,
  title = "Nothing here yet",
  description,
  tip,
}: AppTableEmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1,
        p: 4,
        m: 2,
        borderRadius: RADIUS_LG,
        border: `2px dashed ${COLORS.border}`,
        background: `linear-gradient(145deg, ${mix(COLORS.primary, 0.05)}, ${COLORS.background})`,
        transition: TRANSITION,
        "&:hover": { borderColor: mix(COLORS.primary, 0.4), boxShadow: SHADOW_MD },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: mix(COLORS.primary, 0.12),
          color: COLORS.primary,
        }}
      >
        {icon ?? <AddCircleOutlineOutlinedIcon sx={{ fontSize: 30 }} />}
      </Box>
      <AppText weight={800} sx={{ fontSize: "1.15rem" }}>
        {title}
      </AppText>
      {description && (
        <AppText colorType="secondary" sx={{ maxWidth: 420 }}>
          {description}
        </AppText>
      )}
      {tip && (
        <AppAlert severity="info" sx={{ width: "fit-content", mx: "auto", textAlign: "left" }}>
          {tip}
        </AppAlert>
      )}
    </Box>
  );
}

// =====================================================
// Top Nav Bar — sticky header for the main content area.
// Pairs with AppSidebar: sidebar owns navigation, this owns
// search / notifications / the signed-in user menu.
// =====================================================

export interface AppNavUser {
  name: string;
  role?: string;
  avatarSrc?: string;
}

export interface AppNavMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface AppNavProps {
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  user?: AppNavUser;
  menuItems?: AppNavMenuItem[];
  actions?: React.ReactNode;
  /** Shows a hamburger button (mobile only) that calls this — wire it to open AppSidebar's mobileOpen state. */
  onMenuClick?: () => void;
  mode?: "light" | "dark";
  onToggleMode?: () => void;
  lang?: string;
  onToggleLang?: () => void;
}

export function AppNav({
  onSearch,
  searchPlaceholder = "Search…",
  notificationCount = 0,
  onNotificationsClick,
  user,
  menuItems = [],
  actions,
  onMenuClick,
  mode,
  onToggleMode,
  lang,
  onToggleLang,
}: AppNavProps) {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 1, sm: 2 },
        px: { xs: 1.5, sm: 3 },
        py: 1.5,
        backgroundColor: mix(COLORS.card, 0.85),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
        {onMenuClick && (
          <AppIconButton
            onClick={onMenuClick}
            aria-label="Open menu"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuOutlinedIcon fontSize="small" />
          </AppIconButton>
        )}

        <TextField
          size="small"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 18, color: COLORS.textMuted }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            display: { xs: "none", sm: "block" },
            maxWidth: 320,
            flex: 1,
            "& .MuiOutlinedInput-root": {
              fontSize: FONT,
              borderRadius: 999,
              backgroundColor: COLORS.background,
              transition: TRANSITION,
              "& fieldset": { borderColor: COLORS.border },
              "&:hover fieldset": { borderColor: mix(COLORS.primary, 0.5) },
              "&.Mui-focused": { boxShadow: `0 0 0 3px ${mix(COLORS.primary, 0.14)}` },
              "&.Mui-focused fieldset": { borderColor: COLORS.primary, borderWidth: 1.5 },
            },
          }}
        />
      </Stack>

      <Stack direction="row" spacing={{ xs: 0.25, sm: 1 }} sx={{ alignItems: "center", flexShrink: 0 }}>
        {actions}

        {onToggleLang && (
          <AppIconButton onClick={onToggleLang} aria-label="Toggle language">
            <AppText weight={700} sx={{ fontSize: FONT_SM, minWidth: 16, textAlign: "center" }}>
              {(lang ?? "en").toUpperCase()}
            </AppText>
          </AppIconButton>
        )}

        {onToggleMode && (
          <AppIconButton onClick={onToggleMode} aria-label="Toggle theme">
            {mode === "dark" ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </AppIconButton>
        )}

        <AppIconButton onClick={onNotificationsClick} aria-label="Notifications">
          <AppBadge dot={notificationCount > 0} colorType="error">
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </AppBadge>
        </AppIconButton>

        {user && (
          <>
            <AppDivider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: "center" }} />
            <AppMenu
              trigger={(open) => (
                <Stack
                  direction="row"
                  spacing={1}
                  onClick={open}
                  sx={{
                    alignItems: "center",
                    cursor: "pointer",
                    px: 1,
                    py: 0.5,
                    borderRadius: RADIUS,
                    transition: TRANSITION,
                    "&:hover": { backgroundColor: COLORS.cardHover },
                  }}
                >
                  <AppAvatar alt={user.name} src={user.avatarSrc}>
                    {user.name.charAt(0)}
                  </AppAvatar>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <AppText weight={700} sx={{ fontSize: FONT, lineHeight: 1.2 }} truncate>
                      {user.name}
                    </AppText>
                    {user.role && (
                      <AppText colorType="secondary" sx={{ fontSize: FONT_SM, lineHeight: 1.2 }} truncate>
                        {user.role}
                      </AppText>
                    )}
                  </Box>
                  <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 18, color: COLORS.textLight }} />
                </Stack>
              )}
              items={menuItems}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}

// =====================================================
// Summary Row — label + numeric value, for invoice/quotation totals
// panels (Subtotal, VAT, Discount, Grand Total, ...). Pass `editable`
// + `onChange` for the one or two lines a user can adjust manually
// (e.g. a discount %) — everything else renders as read-only text.
// Set `emphasis` on the final "Grand Total" row for a heavier look.
// =====================================================

interface AppSummaryRowProps {
  label: string;
  value: number;
  editable?: boolean;
  onChange?: (value: number) => void;
  prefix?: string;
  suffix?: string;
  emphasis?: boolean;
}

export function AppSummaryRow({
  label,
  value,
  editable = false,
  onChange,
  prefix = "",
  suffix = "",
  emphasis = false,
}: AppSummaryRowProps) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        py: emphasis ? 1.5 : 1,
        ...(emphasis
          ? { mt: 1, borderTop: `2px solid ${COLORS.border}` }
          : { "&:not(:last-of-type)": { borderBottom: `1px solid ${COLORS.border}` } }),
      }}
    >
      <AppText
        colorType={emphasis ? "primary" : "secondary"}
        weight={emphasis ? 700 : 500}
        sx={{ fontSize: emphasis ? "0.95rem" : FONT }}
      >
        {label}
      </AppText>

      {editable ? (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <TextField
            type="number"
            size="small"
            value={value}
            onChange={(e) => onChange?.(Number(e.target.value))}
            sx={{
              width: 90,
              "& .MuiInputBase-input": { textAlign: "right", fontWeight: 600, fontSize: FONT },
              "& .MuiInputBase-root": fieldSx,
            }}
          />
          {suffix && <AppText colorType="secondary">{suffix}</AppText>}
        </Stack>
      ) : (
        <AppText
          weight={emphasis ? 800 : 600}
          sx={{ fontSize: emphasis ? "1.4rem" : FONT, color: emphasis ? COLORS.primary : undefined }}
        >
          {prefix}
          {value.toFixed(2)}
          {suffix}
        </AppText>
      )}
    </Stack>
  );
}

// =====================================================
// Line Items Table — editable rows for invoice/quotation/order line
// items (product, quantity, price, computed subtotal/VAT/total, ...).
// Columns are caller-defined so the same shell works for sales,
// purchases, or manufacturing screens without this file hardcoding
// any one module's schema.
// =====================================================

export interface AppLineItemColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  render: (row: T, index: number) => React.ReactNode;
}

interface AppLineItemsTableProps<T> {
  columns: AppLineItemColumn<T>[];
  rows: T[];
  onDeleteRow?: (index: number) => void;
  onAddRow?: () => void;
  addLabel?: string;
  emptyLabel?: string;
}

export function AppLineItemsTable<T>({
  columns,
  rows,
  onDeleteRow,
  onAddRow,
  addLabel = "Add Row",
  emptyLabel = "No items added yet",
}: AppLineItemsTableProps<T>) {
  return (
    <Box>
      {onAddRow && (
        <Box sx={{ mb: 1.5 }}>
          <AppButton buttonVariant="outlined" onClick={onAddRow} sx={{ minHeight: 32, py: 0.4 }}>
            + {addLabel}
          </AppButton>
        </Box>
      )}

      <Box sx={{ border: `1px solid ${COLORS.border}`, borderRadius: RADIUS_LG, overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: COLORS.cardHover }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align}
                  sx={{
                    fontSize: FONT_SM,
                    fontWeight: 700,
                    color: COLORS.textLight,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    borderColor: COLORS.border,
                    width: col.width,
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
              {onDeleteRow && <TableCell sx={{ borderColor: COLORS.border, width: 48 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onDeleteRow ? 1 : 0)}
                  sx={{ borderColor: COLORS.border, py: 4, textAlign: "center" }}
                >
                  <AppText colorType="secondary">{emptyLabel}</AppText>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{ transition: TRANSITION, "&:hover": { backgroundColor: mix(COLORS.primary, 0.04) } }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align} sx={{ borderColor: COLORS.border, py: 1 }}>
                      {col.render(row, i)}
                    </TableCell>
                  ))}
                  {onDeleteRow && (
                    <TableCell sx={{ borderColor: COLORS.border }}>
                      <AppIconButton colorType="danger" onClick={() => onDeleteRow(i)} aria-label="Remove row">
                        <DeleteOutlineIcon fontSize="small" />
                      </AppIconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
