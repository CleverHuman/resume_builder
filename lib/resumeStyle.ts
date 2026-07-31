/** Visual tokens matching the Bin Liu reference resume. */

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

export const RESUME_FONT = "Garamond";
/** Built-in serif fallback for @react-pdf/renderer (no custom font files). */
export const RESUME_PDF_FONT = "Times-Roman";
export const RESUME_PDF_FONT_BOLD = "Times-Bold";
export const RESUME_PDF_FONT_ITALIC = "Times-Italic";

export const RESUME_SECTIONS = {
  summary: "PROFESSIONAL SUMMARY",
  skills: "SKILLS",
  experience: "EXPERIENCE",
  education: "EDUCATION",
} as const;
