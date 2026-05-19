export interface UserNameParts {
  firstName?: string | null;
  lastName?: string | null;
  surname?: string | null;
}
export function formatFullName(parts: UserNameParts): string {
  return [parts.lastName, parts.firstName, parts.surname]
    .filter((p) => typeof p === "string" && p.trim().length > 0)
    .join(" ")
    .trim();
}
export function getDisplayNameFromEmail(email: string | null): string {
  if (!email) return "";
  const local = email.split("@")[0]?.trim();
  return local || email;
}
