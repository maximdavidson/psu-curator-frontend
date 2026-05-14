import type { InferType } from "yup";
import type { authSchema } from "../schemas/auth.schema";
import type { ParsedAuthTokens } from "@/shared/lib/parse-auth-response";

export type TAuthFormDto = InferType<typeof authSchema>;

/** Ответ логина/регистрации/refresh (см. parseAuthTokens). */
export type TAuthResponseDto = ParsedAuthTokens;
