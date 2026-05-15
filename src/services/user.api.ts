import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface UserFullName {
  id: string;
  fullName: string | null;
  email: string | null;
}

export interface UserFullInformation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  surname?: string | null;
  phoneNumber?: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUserById: builder.query<UserFullInformation, string>({
      query: (userId) => `/User/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }]
    }),
    searchUsersByName: builder.query<UserFullName[], string>({
      query: (name) => ({
        url: "/User/names",
        params: { name }
      })
    })
  })
});

export const { useGetUserByIdQuery, useLazySearchUsersByNameQuery } = userApi;
