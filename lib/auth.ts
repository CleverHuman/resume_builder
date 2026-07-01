export type Role = "user" | "admin";

interface Credential {
  username: string;
  password: string;
  role: Role;
}

const CREDENTIALS: Credential[] = [
  { username: "bidder", password: "qwe123QWE!@#", role: "user" },
  { username: "admin", password: "qwe123QWE!@#", role: "admin" },
];

/** Mock auth: checks against the hardcoded credential list, no backend involved. */
export function authenticate(username: string, password: string): Role | null {
  const match = CREDENTIALS.find((c) => c.username === username && c.password === password);
  return match?.role ?? null;
}

const STORAGE_KEY = "resumeApp.authRole";

export function loadStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "user" || value === "admin" ? value : null;
}

export function storeRole(role: Role): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(STORAGE_KEY);
}
