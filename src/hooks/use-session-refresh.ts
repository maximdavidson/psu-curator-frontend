import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/stores/auth.store";
import { getAccessTokenExpiryMs } from "@/shared/lib/jwt-claims";
import { refreshAccessToken } from "@/shared/api/session-refresh";
import { useAppDispatch } from "@/app/store/store.types";

const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000;
const MIN_REFRESH_DELAY_MS = 30_000;

export function useSessionRefresh() {
  const dispatch = useAppDispatch();
  const token = useSelector(selectToken);

  useEffect(() => {
    if (!token || !localStorage.getItem("refreshToken")) {
      return;
    }

    const expiryMs = getAccessTokenExpiryMs(token);
    if (!expiryMs) {
      return;
    }

    const delay = Math.max(
      MIN_REFRESH_DELAY_MS,
      expiryMs - Date.now() - REFRESH_BEFORE_EXPIRY_MS
    );

    const timerId = window.setTimeout(() => {
      void refreshAccessToken(dispatch);
    }, delay);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [dispatch, token]);
}
