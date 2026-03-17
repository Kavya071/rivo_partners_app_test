import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

const BASE_WIDTH = 375;
const SMALL_BREAKPOINT = 360;
const LARGE_BREAKPOINT = 414;

export function useResponsive() {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const scale = width / BASE_WIDTH;
    const isSmall = width < SMALL_BREAKPOINT;
    const isLarge = width >= LARGE_BREAKPOINT;

    const hp = (pct: number) => Math.round(width * pct / 100);

    const sp = (base: number) => Math.round(base * Math.min(Math.max(scale, 0.85), 1.2));

    const fs = (base: number) => {
      const scaled = base * Math.min(Math.max(scale, 0.88), 1.15);
      return Math.max(12, Math.round(scaled));
    };

    const cardPadding = isSmall ? 12 : isLarge ? 20 : 16;
    const screenPadding = Math.max(16, hp(6));
    const cardGap = isSmall ? 12 : 16;
    const sectionGap = isSmall ? 20 : isLarge ? 32 : 24;
    const iconTextGap = isSmall ? 12 : isLarge ? 16 : 14;

    return {
      width,
      scale,
      isSmall,
      isLarge,
      hp,
      sp,
      fs,
      cardPadding,
      screenPadding,
      cardGap,
      sectionGap,
      iconTextGap,
    };
  }, [width]);
}
