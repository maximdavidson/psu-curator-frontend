import { removeToken, setTokens } from "@/stores/auth.store";
import type { AppDispatch } from "@/app/store/store.types";
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

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(
  dispatch: AppDispatch
): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return null;
      }

      const res = await fetch(refreshEndpointUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) {
        return null;
      }

      const raw: unknown = await res.json().catch(() => null);
      const parsed = parseAuthTokens(raw);
      if (!parsed) {
        return null;
      }

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

export async function logoutOnSessionExpired(
  dispatch: AppDispatch
): Promise<void> {
  dispatch(removeToken());
  if (
    window.location.pathname !== "/login" &&
    !window.location.pathname.startsWith("/forgot-password")
  ) {
    window.location.assign("/login");
  }
}
