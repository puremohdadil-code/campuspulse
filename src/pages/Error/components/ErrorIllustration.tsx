import { Box } from "@mui/material";
import { motion } from "framer-motion";
import ExploreOffOutlinedIcon from "@mui/icons-material/ExploreOffOutlined";
import GppBadOutlinedIcon from "@mui/icons-material/GppBadOutlined";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

import { COLORS } from "../../../styles/colors";

export type ErrorVariant = "404" | "403" | "401" | "500" | "generic";

const ICONS: Record<ErrorVariant, typeof ExploreOffOutlinedIcon> = {
  "404": ExploreOffOutlinedIcon,
  "403": GppBadOutlinedIcon,
  "401": LockPersonOutlinedIcon,
  "500": CloudOffOutlinedIcon,
  generic: ReportProblemOutlinedIcon,
};

interface ErrorIllustrationProps {
  variant: ErrorVariant;
  size?: number;
}

// Abstract, brand-colored composition (blurred glow + slow-spinning dashed
// ring + a floating icon) rather than a literal cartoon — reads as "premium
// SaaS empty state" (Linear/Vercel style) instead of a mascot illustration.
export function ErrorIllustration({ variant, size = 168 }: ErrorIllustrationProps) {
  const Icon = ICONS[variant];

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)`,
          opacity: 0.18,
          filter: "blur(20px)",
        }}
      />

      <Box
        component={motion.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        sx={{
          position: "absolute",
          inset: 8,
          borderRadius: "50%",
          border: `1.5px dashed ${COLORS.borderStrong}`,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 24,
          borderRadius: "50%",
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.card,
          boxShadow: `0 8px 24px -4px ${COLORS.shadow}`,
        }}
      />

      <Box
        component={motion.div}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        sx={{ position: "relative", display: "flex", color: COLORS.primary }}
      >
        <Icon sx={{ fontSize: size * 0.34 }} />
      </Box>
    </Box>
  );
}
