export interface PersonalInfo {
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  /** Target application metadata, used only for naming the downloaded file. */
  job_title?: string;
  company?: string;
}

export interface Experience {
  position?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  highlights?: string[];
}

export interface Education {
  degree?: string;
  institution?: string;
  location?: string;
  start_year?: string;
  end_year?: string;
  graduation_date?: string;
}

export type Skills = Record<string, string[]> | string[];

export interface ResumeData {
  personal: PersonalInfo;
  summary?: string;
  skills?: Skills;
  experience?: Experience[];
  education?: Education[];
}

export const CONTACT_FIELDS: (keyof PersonalInfo)[] = [
  "location",
  "email",
  "phone",
  "linkedin",
  "github",
  "website",
];

/** A saved row from the Supabase `resume` table. */
export interface ApplicationRecord {
  id: number;
  created_at: string;
  name: string;
  title: string;
  job_title: string;
  company: string;
  resume: ResumeData;
  cover_letter: string | null;
}
