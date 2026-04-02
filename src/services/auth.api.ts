import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TRegisterFormDto } from "@/shared";
import type { TLoginFormDto } from "@/shared";

export interface TAuthResponseDto {
  accessToken: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
  endpoints: (builder) => ({
    register: builder.mutation<TAuthResponseDto, TRegisterFormDto>({
      query: (credentials) => ({
        url: "/Auth/users",
        method: "POST",
        body: {
          email: credentials.email,
          password: credentials.password,
          role: credentials.role
        }
      })
    }),
    login: builder.mutation<TAuthResponseDto, TLoginFormDto>({
      query: (credentials) => ({
        url: "/Auth/sessions",
        method: "POST",
        body: credentials
      })
    })
  })
});

export const { useRegisterMutation, useLoginMutation } = authApi;
