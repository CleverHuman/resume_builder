/** Default visual tokens (Bin Liu / Garamond blue-accent style). */

export const RESUME_COLORS = {
  dark: "#1A1A1A",
  accent: "#0B5FA5",
  muted: "#555555",
} as const;

/** Hex without # — for the `docx` package. */
export const RESUME_COLORS_HEX = {
  dark: "1A1A1A",
  accent: "0B5FA5",
  muted: "555555",
} as const;

/** Self-hosted from public/fonts (see globals.css and lib/pdf/generateResumePdf.tsx). */
export const RESUME_FONT = "EB Garamond";
export const RESUME_PDF_FONT = "EB Garamond";
export const RESUME_PDF_FONT_BOLD = "EB Garamond-Bold";
export const RESUME_PDF_FONT_ITALIC = "EB Garamond-Italic";

export const RESUME_SECTIONS = {
  summary: "PROFESSIONAL SUMMARY",
  skills: "SKILLS",
  experience: "EXPERIENCE",
  education: "EDUCATION",
} as const;

/** Caleb-role tokens: Calibri / grayscale layout. */
export const CALEB_COLORS = {
  name: "#111111",
  dark: "#1A1A1A",
  body: "#111111",
  muted: "#333333",
  position: "#222222",
  rule: "#444444",
} as const;

export const CALEB_COLORS_HEX = {
  name: "111111",
  dark: "1A1A1A",
  body: "111111",
  muted: "333333",
  position: "222222",
  rule: "444444",
} as const;

export const CALEB_FONT = "Calibri";
/** Built-in sans for @react-pdf (no Calibri file shipped). */
export const CALEB_PDF_FONT = "Helvetica";
export const CALEB_PDF_FONT_BOLD = "Helvetica-Bold";
export const CALEB_PDF_FONT_ITALIC = "Helvetica-Oblique";
export const CALEB_PDF_FONT_BOLD_ITALIC = "Helvetica-BoldOblique";

export const CALEB_SECTIONS = {
  summary: "SUMMARY",
  skills: "TECHNICAL SKILLS",
  experience: "PROFESSIONAL EXPERIENCE",
  education: "EDUCATION",
} as const;

/** Original Calibri / black-rule layout (pre–Bin Liu Garamond). */
export const ORIGINAL_COLORS = {
  dark: "#111111",
} as const;

export const ORIGINAL_COLORS_HEX = {
  dark: "111111",
} as const;

export const ORIGINAL_FONT = "Calibri";
/** Built-in sans for @react-pdf (no Calibri file shipped). */
export const ORIGINAL_PDF_FONT = "Helvetica";
export const ORIGINAL_PDF_FONT_BOLD = "Helvetica-Bold";
export const ORIGINAL_PDF_FONT_ITALIC = "Helvetica-Oblique";

export const ORIGINAL_SECTIONS = {
  summary: "SUMMARY",
  skills: "TECHNICAL SKILLS",
  experience: "WORK EXPERIENCE",
  education: "EDUCATION",
} as const;

/** Bin-role tokens: Calibri / black-rule (Charles Bloomberg-style). */
export const BIN_COLORS = {
  dark: "#111111",
  muted: "#333333",
  rule: "#111111",
} as const;

export const BIN_COLORS_HEX = {
  dark: "111111",
  muted: "333333",
  rule: "111111",
} as const;

export const BIN_FONT = "Calibri";
/** Built-in sans for @react-pdf (no Calibri file shipped). */
export const BIN_PDF_FONT = "Helvetica";
export const BIN_PDF_FONT_BOLD = "Helvetica-Bold";
export const BIN_PDF_FONT_ITALIC = "Helvetica-Oblique";

export const BIN_SECTIONS = {
  summary: "SUMMARY",
  skills: "TECHNICAL SKILLS",
  experience: "WORK EXPERIENCE",
  education: "EDUCATION",
} as const;
