import type { CSSProperties } from "react";

// Set the `--accent` CSS variable inline so a subtree re-themes every `*-accent`
// utility. Double-cast keeps TS happy about the custom property.
export function accentVar(accent: string): CSSProperties {
  return { "--accent": accent } as unknown as CSSProperties;
}
