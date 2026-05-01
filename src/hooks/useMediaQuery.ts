// @/hooks/useMediaQuery.ts
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook that listens to a CSS media query and returns whether it matches.
 *
 * @param query - A valid CSS media query string, e.g. "(max-width: 640px)"
 * @returns `true` if the media query currently matches, `false` otherwise.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 640px)");
 * const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // ── SSR-safe initializer ─────────────────────────────────────────
  const getMatches = useCallback((): boolean => {
    // Server-side: window is not available
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    // Guard for SSR
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);

    // Set initial value in case it changed between render and effect
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Sync on mount (covers hydration mismatch)
    setMatches(mediaQueryList.matches);

    // Modern browsers
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return () => {
        mediaQueryList.removeEventListener("change", handleChange);
      };
    }

    // Fallback for older browsers (Safari < 14)
    // eslint-disable-next-line deprecation/deprecation
    mediaQueryList.addListener(handleChange);
    return () => {
      // eslint-disable-next-line deprecation/deprecation
      mediaQueryList.removeListener(handleChange);
    };
  }, [query]);

  return matches;
}
