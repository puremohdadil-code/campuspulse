import { useEffect, useState } from "react";
import { applyMode, getStoredMode, type Mode } from "../styles/colors";

/**
 * Live light/dark mode state. Most of the app never needs this — CSS
 * variables (see colors.ts) repaint on their own when the mode flips.
 * Only reach for this hook when you need the resolved mode in JS itself
 * (e.g. the toggle button's icon, or resolving a CSS var to a literal
 * color for a canvas/SVG context like charts).
 */
export function useThemeMode(): [Mode, () => void] {
  const [mode, setModeState] = useState<Mode>(() => getStoredMode());

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const toggle = () => setModeState((m) => (m === "light" ? "dark" : "light"));

  return [mode, toggle];
}
