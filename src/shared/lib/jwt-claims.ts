/** Значения роли в JWT от бэкенда (UserRoles.ToString()). */
const ROLE_CLAIM_KEYS = [
  "role",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
] as const;

export function decodeJwtPayload(
  accessToken: string
): Record<string, unknown> | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRoleStringFromAccessToken(
  accessToken: string | null
): string | null {
  if (!accessToken) return null;
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;
  for (const key of ROLE_CLAIM_KEYS) {
    const v = payload[key];
    if (typeof v === "string" && v.length > 0) return v;
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  }
  return null;
}

/** Кураторы, деканат, преподаватели, админ — могут управлять группами на уровне UI. */
export function roleCanManageStudentGroups(role: string | null): boolean {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  return r !== "student" && r !== "headman";
}
