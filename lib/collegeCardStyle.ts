// Deterministic visual helpers for college cards — same input always yields
// the same output, so a given school looks identical everywhere it appears.

// Dark, saturated tones that all read well with white text on top:
// HSP red, navy, dark teal, plum, dark amber, dark forest green, charcoal,
// deep indigo.
const CARD_PALETTE = [
  "#CE2C22", // HSP red
  "#1e3a5f", // navy
  "#0f4c4c", // dark teal
  "#5b2b47", // plum
  "#8a5a12", // dark amber
  "#1f3d2b", // dark forest green
  "#2b2f36", // charcoal
  "#3a2c63", // deep indigo
];

export function getCollegeCardColor(unitid: number): string {
  const n = Math.abs(Math.trunc(unitid || 0));
  return CARD_PALETTE[n % CARD_PALETTE.length];
}

const MONOGRAM_STOP_WORDS = new Set([
  "of",
  "the",
  "and",
  "at",
  "for",
  "in",
  "a",
  "an",
]);

export function getCollegeMonogram(institutionName: string): string {
  const words = (institutionName || "")
    .replace(/[^A-Za-z\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 0 && !MONOGRAM_STOP_WORDS.has(w.toLowerCase()));

  const source = words.length > 0 ? words : (institutionName || "").trim().split(/\s+/);
  const initials = source
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return initials.slice(0, 4) || "?";
}
