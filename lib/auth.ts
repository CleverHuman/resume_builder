export type Role = "user" | "jay" | "eric" | "john" | "caleb" | "bin";

interface Credential {
  username: string;
  password: string;
  role: Role;
}

const CREDENTIALS: Credential[] = [
  { username: "bidder", password: "qwe123QWE!@#", role: "user" },
  { username: "jay", password: "qwe123QWE!@#", role: "jay" },
  { username: "eric", password: "qwe123QWE!@#", role: "eric" },
  { username: "john", password: "qwe123QWE!@#", role: "john" },
  { username: "caleb", password: "qwe123QWE!@#", role: "caleb" },
  { username: "bin", password: "qwe123QWE!@#", role: "bin" },
];

/** Mock auth: checks against the hardcoded credential list, no backend involved. */
export function authenticate(username: string, password: string): Role | null {
  const match = CREDENTIALS.find((c) => c.username === username && c.password === password);
  return match?.role ?? null;
}

/**
 * Each privileged profile can point at its own Supabase table; user/jay share the default.
 * Note: the actual Postgres table is `resumev1` (lowercase) — unquoted identifiers
 * are case-folded to lowercase by Postgres, so `resumeV1` in SQL created `resumev1`.
 */
export function tableForRole(role: Role): string {
  if (role === "eric") return "resumev1";
  if (role === "john") return "euresumev0";
  if (role === "caleb") return "caleb";
  if (role === "bin") return "bin";
  return "resume";
}

/** Roles that can open the Applications tab. */
export function canSeeApplications(role: Role): boolean {
  return role === "jay" || role === "eric" || role === "john" || role === "caleb" || role === "bin";
}

/** John-only: render Core Modules / Capstone under education. */
export function showsEducationExtras(role: Role): boolean {
  return role === "john";
}

/** Title-case header name (Caleb / Jay Calibri layout). */
export function usesTitleCaseName(role: Role): boolean {
  return role === "caleb" || role === "jay";
}

/** Calibri grayscale layout (company-first experience, etc.). */
export function usesCalebResumeStyle(role: Role): boolean {
  return role === "caleb" || role === "jay";
}

/** Original Calibri / black-rule layout (position-first experience). */
export function usesOriginalResumeStyle(role: Role): boolean {
  return role === "eric";
}

/** Bin layout: serif / black-rule, pipe-separated experience headers. */
export function usesBinResumeStyle(role: Role): boolean {
  return role === "bin";
}

const STORAGE_KEY = "resumeApp.authRole";

export function loadStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return (
    value === "user" ||
    value === "jay" ||
    value === "eric" ||
    value === "john" ||
    value === "caleb" ||
    value === "bin"
  )
    ? value
    : null;
}

export function storeRole(role: Role): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(STORAGE_KEY);
}
