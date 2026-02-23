import {
  baseQueryWithReauth,
  type TSigninFormDto,
  type TSignupFormDto
} from "@/shared";
import { createApi } from "@reduxjs/toolkit/query";

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
      query: (credentials: TSignupFormDto) => ({
        url: "/Auth/users",
        method: "POST",
        body: credentials
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
