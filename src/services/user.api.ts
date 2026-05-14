import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface UserFullName {
  id: string;
  fullName: string | null;
  email: string | null;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    searchUsersByName: builder.query<UserFullName[], string>({
      query: (name) => ({
        url: "/User/names",
        params: { name }
      })
    })
  })
});

export const { useLazySearchUsersByNameQuery } = userApi;
