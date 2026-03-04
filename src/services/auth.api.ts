import {
  baseQueryWithReauth,
  type TAuthFormDto,
  type TAuthResponseDto
} from "@/shared";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<TAuthResponseDto, TAuthFormDto>({
      query: (credentials) => ({
        url: "/Auth/session",
        method: "POST",
        body: credentials
      })
    }),
    register: builder.mutation<TAuthResponseDto, TAuthFormDto>({
      query: (credentials) => ({
        url: "/Auth/users",
        method: "POST",
        body: { ...credentials, role: 1 }
      })
    })
    // logout: builder.mutation({
    //   query: () => ({
    //     url: "/Auth/logout",
    //     method: "POST"
    //   })
    // }) TODO
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
