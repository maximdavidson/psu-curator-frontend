import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  logoutOnSessionExpired,
  refreshAccessToken
} from "@/shared/api/session-refresh";

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
      await logoutOnSessionExpired(api.dispatch);
      return result;
    }

    const newAccess = await refreshAccessToken(api.dispatch);
    if (!newAccess) {
      await logoutOnSessionExpired(api.dispatch);
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
