/** Erweiterte Asset-Metadaten (in notes als JSON gespeichert) */

export interface AssetMeta {
  customCategory?: string;
  subcategory?: string;
  icon?: string;
  imageUrl?: string;
  currency?: string;
  isin?: string;
  wkn?: string;
}

export interface PositionNotesPayload {
  meta?: AssetMeta;
  text?: string;
}

export function serializePositionNotes(meta: AssetMeta, text?: string): string {
  const payload: PositionNotesPayload = { meta, text: text?.trim() || undefined };
  return JSON.stringify(payload);
}

export function parsePositionNotes(raw?: string | null): PositionNotesPayload {
  if (!raw?.trim()) return { text: "" };
  try {
    const parsed = JSON.parse(raw) as PositionNotesPayload;
    if (parsed && typeof parsed === "object" && ("meta" in parsed || "text" in parsed)) {
      return parsed;
    }
  } catch {
    // Legacy: plain text notes
  }
  return { text: raw };
}

export function getDisplayNotes(raw?: string | null): string {
  return parsePositionNotes(raw).text ?? "";
}

export function getAssetMeta(raw?: string | null): AssetMeta {
  return parsePositionNotes(raw).meta ?? {};
}

export const SUGGESTED_CATEGORIES = [
  "Crypto",
  "Aktien",
  "ETF",
  "Gold",
  "Silber",
  "Immobilien",
  "Sammlerstücke",
  "Rohstoffe",
  "Private Beteiligung",
  "Sonstige",
] as const;
