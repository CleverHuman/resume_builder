import { CONTACT_FIELDS, Education, Experience, PersonalInfo, Skills } from "./types";

export interface BoldSegment {
  text: string;
  bold: boolean;
}

/** Split "foo **bar** baz" into [{text:"foo ",bold:false},{text:"bar",bold:true},{text:" baz",bold:false}] */
export function parseBoldSegments(text: string): BoldSegment[] {
  const parts = text.split(/\*\*(.+?)\*\*/);
  return parts
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((seg) => seg.text.length > 0);
}

export function formatContactLine(personal: PersonalInfo): string {
  return CONTACT_FIELDS.map((f) => personal[f])
    .filter((v): v is string => Boolean(v))
    .join("  |  ");
}

/** En-dash date range, e.g. "Mar 2023 – Present". */
export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

export function formatExperienceDates(exp: Experience): string {
  return formatDateRange(exp.start_date, exp.end_date);
}

/** Company line location segment (no company — company is styled separately). */
export function formatExperienceLocation(exp: Experience): string {
  return exp.location?.trim() ?? "";
}

export function formatEducationDates(edu: Education): string {
  if (edu.start_year && edu.end_year) {
    return formatDateRange(edu.start_year, edu.end_year);
  }
  return edu.graduation_date?.trim() ?? "";
}

/** Institution + location for the education secondary segment. */
export function formatEducationPlace(edu: Education): string {
  const parts: string[] = [];
  if (edu.institution) parts.push(edu.institution);
  if (edu.location) parts.push(edu.location);
  return parts.join(", ");
}

function normalizeEducationExtra(value: string | string[] | undefined): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean).join(", ");
  return value.trim();
}

/**
 * Optional john-role education bullets, e.g.
 * [{ label: "Core Modules", text: "Distributed Systems, Cloud Computing" }, ...]
 * Accepts snake_case or titled keys.
 */
export function educationExtraBullets(
  edu: Education
): { label: string; text: string }[] {
  const modules = normalizeEducationExtra(edu.core_modules ?? edu["Core Modules"]);
  const capstone = normalizeEducationExtra(edu.capstone ?? edu.Capstone);
  const bullets: { label: string; text: string }[] = [];
  if (modules) bullets.push({ label: "Core Modules", text: modules });
  if (capstone) bullets.push({ label: "Capstone", text: capstone });
  return bullets;
}

/** Normalize skills into [category, items[]][] pairs; category is "" for a flat list. */
export function skillEntries(skills: Skills | undefined): [string, string[]][] {
  if (!skills) return [];
  if (Array.isArray(skills)) return [["", skills]];
  return Object.entries(skills);
}

/** "name-job-title_company.ext", degrading gracefully when job_title/company are absent. */
export function buildResumeFilename(personal: PersonalInfo, ext: string): string {
  const slug = (s: string) => s.trim().replace(/\s+/g, "_");
  let base = slug(personal.name || "resume");
  if (personal.job_title) base += `-${slug(personal.job_title)}`;
  if (personal.company) base += `_${slug(personal.company)}`;
  return `${base}.${ext}`;
}
