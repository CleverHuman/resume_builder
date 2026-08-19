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
