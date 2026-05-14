import type { ParsedAuthTokens } from "@/shared/lib/parse-auth-response";

/** Ответ логина/регистрации/refresh (см. parseAuthTokens). */
export type TAuthResponseDto = ParsedAuthTokens;
