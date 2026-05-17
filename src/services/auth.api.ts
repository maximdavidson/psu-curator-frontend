import { createApi } from "@reduxjs/toolkit/query/react";
import type { TRegisterFormDto } from "@/shared";
import type { TLoginFormDto } from "@/shared";
import { baseQueryWithReauth } from "@/shared/api/base-query";
import {
  parseAuthTokens,
  type ParsedAuthTokens
} from "@/shared/lib/parse-auth-response";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation<ParsedAuthTokens, TRegisterFormDto>({
      query: (credentials) => ({
        url: "/Auth/users",
        method: "POST",
        body: {
          email: credentials.email,
          password: credentials.password
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
    })
  })
});

export const { useRegisterMutation, useLoginMutation } = authApi;
