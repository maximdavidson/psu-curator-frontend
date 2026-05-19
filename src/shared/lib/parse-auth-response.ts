export type ParsedAuthTokens = {
  accessToken: string;
  refreshToken?: string;
};
function pickString(
  obj: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}
export function parseAuthTokens(raw: unknown): ParsedAuthTokens | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  let access = pickString(o, ["accessToken", "AccessToken"]);
  let refresh = pickString(o, ["refreshToken", "RefreshToken"]);
  const tp = (o.tokenPair ?? o.TokenPair) as
    | Record<string, unknown>
    | undefined;
  if (tp && typeof tp === "object") {
    access ??= pickString(tp, ["accessToken", "AccessToken"]);
    refresh ??= pickString(tp, ["refreshToken", "RefreshToken"]);
  }
  if (!access) return null;
  return { accessToken: access, refreshToken: refresh };
}
