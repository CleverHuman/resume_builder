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
    .join(" | ");
}

export function formatExperienceMeta(exp: Experience): string {
  const parts: string[] = [];
  if (exp.company) parts.push(exp.company);
  if (exp.location) parts.push(exp.location);
  const start = exp.start_date ?? "";
  const end = exp.end_date ?? "";
  if (start || end) parts.push(`${start} - ${end}`);
  return parts.join(" | ");
}

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
