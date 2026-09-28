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

/** "JEREMY WYATT" -> "Jeremy Wyatt": capitalize each word's initial, lowercase the rest. */
export function toTitleCase(name: string): string {
  return name
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}

export function formatContactLine(personal: PersonalInfo): string {
  return CONTACT_FIELDS.map((f) => personal[f])
    .filter((v): v is string => Boolean(v))
    .join("  |  ");
}

/** Original-style contact: single spaces around the pipe. */
export function formatOriginalContactLine(personal: PersonalInfo): string {
  return CONTACT_FIELDS.map((f) => personal[f])
    .filter((v): v is string => Boolean(v))
    .join(" | ");
}

/** Original-style experience line: Company | Location | Start - End. */
export function formatExperienceMeta(exp: Experience): string {
  const parts: string[] = [];
  if (exp.company) parts.push(exp.company);
  if (exp.location) parts.push(exp.location);
  const start = exp.start_date ?? "";
  const end = exp.end_date ?? "";
  if (start || end) parts.push(`${start} - ${end}`);
  return parts.join(" | ");
}

/** Original-style education line: Institution - Location | years. */
export function formatEducationMeta(edu: Education): string {
  let meta = edu.institution ?? "";
  if (edu.location) meta += ` - ${edu.location}`;
  if (edu.start_year && edu.end_year) {
    meta += ` | ${edu.start_year} - ${edu.end_year}`;
  } else if (edu.graduation_date) {
    meta += ` | ${edu.graduation_date}`;
  }
  return meta;
}

/** Caleb header contact: location • phone • email (linkedin is a separate line). */
export function formatCalebContactLine(personal: PersonalInfo): string {
  return [personal.location, personal.phone, personal.email]
    .filter((v): v is string => Boolean(v?.trim()))
    .join("  •  ");
}

/** Strip protocol/trailing slash for a clean LinkedIn display line. */
export function formatCalebLinkedIn(personal: PersonalInfo): string {
  const raw = personal.linkedin?.trim();
  if (!raw) return "";
  return raw.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** Join skill names with commas (Caleb sample style). */
export function formatCalebSkillList(items: string[]): string {
  return items.join(", ");
}

/**
 * Whether to print the company+location header for this experience row.
 * Consecutive entries with the same company share one header (Caleb sample).
 */
export function shouldShowCompanyHeader(
  experience: Experience[],
  index: number
): boolean {
  const company = experience[index]?.company?.trim().toLowerCase() ?? "";
  if (!company) return Boolean(experience[index]?.location);
  if (index === 0) return true;
  const prev = experience[index - 1]?.company?.trim().toLowerCase() ?? "";
  return prev !== company;
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

/** Join skill names with pipes: "A | B | C". */
export function formatSkillList(items: string[]): string {
  return items.join(" | ");
}

function nonEmpty(parts: (string | undefined)[]): string[] {
  return parts.map((p) => p?.trim() ?? "").filter(Boolean);
}

/** Bin header contact: location • email • phone • linkedin. */
export function formatBinContactLine(personal: PersonalInfo): string {
  return nonEmpty([
    personal.location,
    personal.email,
    personal.phone,
    formatCalebLinkedIn(personal),
    personal.github,
    personal.website,
  ]).join("  •  ");
}

/** Bin experience header: Position | Company | Location | Start—End. */
export function formatBinExperienceHeader(exp: Experience): string {
  const dates = formatDateRange(exp.start_date, exp.end_date).replace(" – ", "—");
  return nonEmpty([exp.position, exp.company, exp.location, dates]).join(" | ");
}

/** Bin education header: Degree | Institution | Location | Year. */
export function formatBinEducationHeader(edu: Education): string {
  const dates = formatEducationDates(edu).replace(" – ", "—");
  return nonEmpty([edu.degree, edu.institution, edu.location, dates]).join(" | ");
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

/** "cover_letter_company.ext", degrading to "cover_letter.ext" when company is absent. */
export function buildCoverLetterFilename(company: string | undefined | null, ext: string): string {
  const slug = (s: string) => s.trim().replace(/\s+/g, "_");
  const base = company?.trim() ? `cover_letter_${slug(company)}` : "cover_letter";
  return `${base}.${ext}`;
}
