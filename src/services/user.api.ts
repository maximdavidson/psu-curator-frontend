import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface UserFullName {
  id: string;
  fullName: string | null;
  email: string | null;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
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
