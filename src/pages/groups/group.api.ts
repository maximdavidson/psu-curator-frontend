import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Group {
  id: string;
  name: string;
  faculty: string;
  countOfstudents: number;
  firstName: string;
  lastName: string;
  surname: string;
}

export interface CreateGroupRequest {
  name: string;
  faculty: string;
  courseNumber: number;
  curatorEmail: string;
  headStudentEmail?: string;
}

export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ["Group"],
  endpoints: (builder) => ({
    getGroups: builder.query<Group[], void>({
      query: () => "/Group",
      providesTags: ["Group"]
    }),
    createGroup: builder.mutation<Group, CreateGroupRequest>({
      query: (data) => ({
        url: "/Group",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Group"]
    })
  })
});

export const { useGetGroupsQuery, useCreateGroupMutation } = groupApi;
