import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigation } from "react-router-dom";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { COLORS } from "../styles/colors";

// A slim top-of-viewport progress bar (GitHub/YouTube/Linear style) that
// reacts to two independent sources automatically, with no per-page wiring:
//   - route navigation (react-router's useNavigation — fires on any page
//     change, especially ones with data loaders)
//   - server requests (react-query's fetch/mutation counters — fires for
//     every query and mutation across the whole app)
// Mount this once near the app root; every page/request "just works".
export function GlobalProgressBar() {
  const navigation = useNavigation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const active = navigation.state !== "idle" || isFetching > 0 || isMutating > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    if (!visible) return;
    const timeout = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timeout);
  }, [active, visible]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 2000,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Box
        component={motion.div}
        initial={{ width: "0%", opacity: 1 }}
        animate={{
          width: active ? "88%" : "100%",
          opacity: active ? 1 : 0,
        }}
        transition={{
          width: { duration: active ? 6 : 0.25, ease: active ? "easeOut" : "easeIn" },
          opacity: { duration: 0.3, delay: active ? 0 : 0.15 },
        }}
        sx={{
          height: "100%",
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryHover})`,
          boxShadow: `0 0 8px ${COLORS.primary}`,
        }}
      />
    </Box>
  );
}
