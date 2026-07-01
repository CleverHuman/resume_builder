import { createClient } from "@/lib/supabase/client";
import { ApplicationRecord, PersonalInfo, ResumeData } from "@/lib/types";

const REQUIRED_PERSONAL_FIELDS = ["name", "title", "job_title", "company"] as const;

function missingRequiredFields(personal: PersonalInfo): string[] {
  return REQUIRED_PERSONAL_FIELDS.filter((f) => !personal[f]?.trim());
}

export type SaveResumeResult =
  | { status: "invalid"; missingFields: string[] }
  | { status: "duplicate" }
  | { status: "error"; error: string }
  | { status: "inserted"; id: number };

/**
 * One row per company: inserts a new resume record, or reports "duplicate" if
 * a record for that company already exists (schema requires name/title/job_title/
 * company/resume to all be non-null, so resumes are never partially saved).
 */
export async function saveResumeRecord(
  resumeData: ResumeData,
  table: string
): Promise<SaveResumeResult> {
  const personal = resumeData.personal ?? {};
  const missingFields = missingRequiredFields(personal);
  if (missingFields.length > 0) {
    return { status: "invalid", missingFields };
  }

  const supabase = createClient();
  const company = personal.company!.trim();

  const { data: existing, error: selectError } = await supabase
    .from(table)
    .select("id")
    .eq("company", company)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    return { status: "error", error: selectError.message };
  }
  if (existing) {
    return { status: "duplicate" };
  }

  const { data, error } = await supabase
    .from(table)
    .insert({
      name: personal.name!.trim(),
      title: personal.title!.trim(),
      job_title: personal.job_title!.trim(),
      company,
      resume: resumeData,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", error: error?.message ?? "Insert failed" };
  }
  return { status: "inserted", id: data.id };
}

export type SaveCoverLetterResult =
  | { status: "no-resume" }
  | { status: "error"; error: string }
  | { status: "saved" };

/** Attaches cover_letter to an already-saved resume record; requires recordId. */
export async function saveCoverLetterRecord(
  recordId: number | null,
  coverLetter: string,
  table: string
): Promise<SaveCoverLetterResult> {
  if (!recordId) {
    return { status: "no-resume" };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from(table)
    .update({ cover_letter: coverLetter })
    .eq("id", recordId);

  if (error) {
    return { status: "error", error: error.message };
  }
  return { status: "saved" };
}

interface ListApplicationsParams {
  page: number; // 1-indexed
  pageSize: number;
  search?: string;
  table: string;
}

interface ListApplicationsResult {
  data: ApplicationRecord[];
  count: number;
  error: string | null;
}

/**
 * Wraps a term for safe use inside a PostgREST ilike pattern within an `.or()` filter.
 * PostgREST's logic-tree grammar (used by `.or()`) requires values containing reserved
 * characters (`,` `.` `:` `(` `)`) to be double-quoted, with literal backslashes and
 * double-quotes inside escaped with a backslash.
 */
function toOrIlikePattern(term: string): string {
  const escaped = term.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

/** One page of saved application rows, most recent first, optionally filtered by company/job_title. */
export async function listApplications({
  page,
  pageSize,
  search,
  table,
}: ListApplicationsParams): Promise<ListApplicationsResult> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select("id, created_at, name, title, job_title, company, resume, cover_letter", {
      count: "exact",
    });

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const pattern = toOrIlikePattern(trimmedSearch);
    query = query.or(`company.ilike.${pattern},job_title.ilike.${pattern}`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    data: (data as ApplicationRecord[] | null) ?? [],
    count: count ?? 0,
    error: error?.message ?? null,
  };
}
