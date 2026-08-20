export type Role = "user" | "jay" | "super" | "john" | "caleb";

interface Credential {
  username: string;
  password: string;
  role: Role;
}

const CREDENTIALS: Credential[] = [
  { username: "bidder", password: "qwe123QWE!@#", role: "user" },
  { username: "jay", password: "qwe123QWE!@#", role: "jay" },
  { username: "super", password: "qwe123QWE!@#", role: "super" },
  { username: "john", password: "qwe123QWE!@#", role: "john" },
  { username: "caleb", password: "qwe123QWE!@#", role: "caleb" },
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
  if (role === "super") return "resumev1";
  if (role === "john") return "euresumev0";
  if (role === "caleb") return "caleb";
  return "resume";
}

/** Roles that can open the Applications tab. */
export function canSeeApplications(role: Role): boolean {
  return role === "jay" || role === "super" || role === "john" || role === "caleb";
}

/** John-only: render Core Modules / Capstone under education. */
export function showsEducationExtras(role: Role): boolean {
  return role === "john";
}

/** Caleb-only: render the header name in title case ("Caleb Tallquist") instead of all caps. */
export function usesTitleCaseName(role: Role): boolean {
  return role === "caleb";
}

/** Caleb-only: Calibri grayscale layout (company-first experience, etc.). */
export function usesCalebResumeStyle(role: Role): boolean {
  return role === "caleb";
}

const STORAGE_KEY = "resumeApp.authRole";

export function loadStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "user" || value === "jay" || value === "super" || value === "john" || value === "caleb"
    ? value
    : null;
}

export function storeRole(role: Role): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(STORAGE_KEY);
}
