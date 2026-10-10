import type { SignatureFieldType } from "@/lib/signature";

export type FieldTypeConfig = {
  type: SignatureFieldType;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
};

// Default sizes in px at the editor/signing view's render scale.
export const FIELD_TYPES: FieldTypeConfig[] = [
  { type: "signature", label: "Signature", defaultWidth: 180, defaultHeight: 60 },
  { type: "initials", label: "Initials", defaultWidth: 70, defaultHeight: 50 },
  { type: "date", label: "Date", defaultWidth: 110, defaultHeight: 30 },
  { type: "text", label: "Text", defaultWidth: 160, defaultHeight: 30 },
  { type: "checkbox", label: "Checkbox", defaultWidth: 24, defaultHeight: 24 },
];

export function fieldTypeConfig(type: SignatureFieldType): FieldTypeConfig {
  return FIELD_TYPES.find((f) => f.type === type) ?? FIELD_TYPES[0];
}

export type PlacedFieldPayload = {
  type: SignatureFieldType;
  page: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  label?: string;
  sortOrder: number;
};
