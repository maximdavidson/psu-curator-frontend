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
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
      }
    }),
    register: builder.mutation<TAuthResponseDto, TAuthFormDto>({
      // в прод такое лучше не допускать но для мвп простительно
      query: (credentials) => ({
        url: "/Auth/users",
        method: "POST",
        body: { ...credentials, role: 1 }
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
        }
      }
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
