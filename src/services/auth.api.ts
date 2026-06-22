import { createApi } from "@reduxjs/toolkit/query/react";
import type { TRegisterFormDto, TLoginFormDto } from "@/shared";
import { baseQueryWithReauth } from "@/shared/api/base-query";
import {
  parseAuthTokens,
  type ParsedAuthTokens
} from "@/shared/lib/parse-auth-response";

export interface RecoverPasswordRequest {
  email: string;
  firstName: string;
  lastName: string;
  surname?: string;
  courseNumber?: number;
  faculty?: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation<ParsedAuthTokens, TRegisterFormDto>({
      query: (credentials) => ({
        url: "/Auth/users",
        method: "POST",
        body: {
          email: credentials.email.trim(),
          password: credentials.password,
          firstName: credentials.firstName.trim(),
          lastName: credentials.lastName.trim()
        }
      }),
      transformResponse: (raw: unknown) => {
        const t = parseAuthTokens(raw);
        if (!t?.accessToken) {
          throw new Error("Некорректный ответ сервера при регистрации");
        }
        return t;
      }
    }),
    login: builder.mutation<ParsedAuthTokens, TLoginFormDto>({
      query: (credentials) => ({
        url: "/Auth/sessions",
        method: "POST",
        body: credentials
      }),
      transformResponse: (raw: unknown) => {
        const t = parseAuthTokens(raw);
        if (!t?.accessToken) {
          throw new Error("Некорректный ответ сервера при входе");
        }
        return t;
      }
    }),
    recoverPassword: builder.mutation<
      { message: string },
      RecoverPasswordRequest
    >({
      query: (body) => ({
        url: "/Auth/password-reset",
        method: "POST",
        body
      })
    })
  })
});
export const {
  useRegisterMutation,
  useLoginMutation,
  useRecoverPasswordMutation
} = authApi;
