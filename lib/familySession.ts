export type FamilySession = {
  familyId: string;
  familyName: string;
  memberId: string;
  memberName: string;
  role: "owner" | "member";
};

export const DEFAULT_FAMILY_ID = "00000000-0000-0000-0000-000000000001";
const SESSION_KEY = "senhor-melo-family-session";

export function getFamilySession(): FamilySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as FamilySession) : null;
  } catch {
    return null;
  }
}

export function saveFamilySession(session: FamilySession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearFamilySession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentFamilyId() {
  return getFamilySession()?.familyId || DEFAULT_FAMILY_ID;
}

export function getCurrentFamilyName() {
  return getFamilySession()?.familyName || "Família Melo";
}

export function createInviteCode(familyId: string) {
  return `${familyId.replaceAll("-", "").slice(0, 12)}-${Date.now().toString(36)}`;
}
