import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { AppAccordion, AppText, COLORS } from "../../components/common";
import { ErrorCard } from "./components/ErrorCard";
import { ErrorIllustration, type ErrorVariant } from "./components/ErrorIllustration";
import { ErrorActions } from "./components/ErrorActions";

interface ErrorLayoutProps {
  variant: ErrorVariant;
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
  /** Raw technical details (stack trace, status text, ...) — rendered only when import.meta.env.DEV is true. */
  devDetails?: string;
}

export function ErrorLayout({ variant, code, title, description, actions, devDetails }: ErrorLayoutProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        backgroundColor: COLORS.background,
      }}
    >
      <ErrorCard>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <ErrorIllustration variant={variant} />
        </Box>

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          <AppText
            weight={800}
            sx={{
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              color: COLORS.primary,
              mt: 1,
            }}
          >
            {code}
          </AppText>
          <AppText weight={800} sx={{ fontSize: { xs: "1.35rem", sm: "1.6rem" }, mt: 0.5, letterSpacing: "-0.01em" }}>
            {title}
          </AppText>
          <AppText colorType="secondary" sx={{ fontSize: "0.9rem", mt: 1.25, lineHeight: 1.6 }}>
            {description}
          </AppText>
        </Box>

        {actions ?? <ErrorActions />}

        {import.meta.env.DEV && devDetails && (
          <Box sx={{ mt: 3.5, textAlign: "start" }}>
            <AppAccordion title={t("errors.devDetails")}>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontSize: "0.7rem",
                  lineHeight: 1.6,
                  color: COLORS.textLight,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {devDetails}
              </Box>
            </AppAccordion>
          </Box>
        )}
      </ErrorCard>
    </Box>
  );
}
