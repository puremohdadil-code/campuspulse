import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

import { COLORS, RADIUS_LG, SHADOW_LG } from "../../../components/common";

interface ErrorCardProps {
  children: ReactNode;
}

export function ErrorCard({ children }: ErrorCardProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      sx={{
        width: "100%",
        maxWidth: 480,
        textAlign: "center",
        p: { xs: 3.5, sm: 5 },
        borderRadius: RADIUS_LG,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
        boxShadow: SHADOW_LG,
      }}
    >
      {children}
    </Box>
  );
}
