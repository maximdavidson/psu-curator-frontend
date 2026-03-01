import {
  baseQueryWithReauth,
  type TSigninFormDto,
  type TSignupFormDto
} from "@/shared";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: TSigninFormDto) => ({
        url: "/Auth/session",
        method: "POST",
        body: credentials
      })
    }),
    register: builder.mutation({
      // в прод такое лучше не допускать но для мвп простительно
      query: (credentials: TSignupFormDto) => ({
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
