import { removeToken, setTokens } from "@/stores/auth.store";
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { parseAuthTokens } from "@/shared/lib/parse-auth-response";
function refreshEndpointUrl(): string {
  const base =
    (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "") ?? "";
  const pathRaw =
    (import.meta.env.VITE_AUTH_REFRESH_PATH as string) ||
    "/Auth/sessions/refresh";
  const path = pathRaw.startsWith("/") ? pathRaw : `/${pathRaw}`;
  return `${base}${path}`;
}
function shouldSkipRefreshForUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (u.includes("/auth/sessions/refresh") || u.endsWith("/auth/refresh")) {
    return true;
  }
  if (u.includes("/auth/users")) return true;
  if (u.includes("/auth/password-reset")) return true;
  if (u.includes("/auth/sessions") && !u.includes("refresh")) return true;
  return false;
}
function getUrlFromArgs(args: string | FetchArgs): string {
  if (typeof args === "string") return args;
  return args.url ?? "";
}
let refreshInFlight: Promise<string | null> | null = null;
async function refreshAccessToken(dispatch: BaseQueryApi["dispatch"]) {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;
      const res = await fetch(refreshEndpointUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
      if (!res.ok) return null;
      const raw: unknown = await res.json().catch(() => null);
      const parsed = parseAuthTokens(raw);
      if (!parsed) return null;
      localStorage.setItem("token", parsed.accessToken);
      if (parsed.refreshToken) {
        localStorage.setItem("refreshToken", parsed.refreshToken);
      }
      dispatch(setTokens(parsed));
      return parsed.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
export function createAppBaseQuery(
  apiBaseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  });
  const wrapped: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);
    if (result.error?.status !== 401) {
      return result;
    }
    const url = getUrlFromArgs(args);
    if (shouldSkipRefreshForUrl(url)) {
      return result;
    }
    if (!localStorage.getItem("refreshToken")) {
      api.dispatch(removeToken());
      return result;
    }
    const newAccess = await refreshAccessToken(api.dispatch);
    if (!newAccess) {
      api.dispatch(removeToken());
      return result;
    }
    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  };
  return wrapped;
}
export const baseQueryWithReauth = createAppBaseQuery(
  import.meta.env.VITE_API_URL as string
);
