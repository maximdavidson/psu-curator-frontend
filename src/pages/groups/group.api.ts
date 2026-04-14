import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Group {
  id: string;
  name: string;
  faculty: string;
  countOfstudents: number;
  firstName: string;
  lastName: string;
  surname: string;

  curatorEmail: string;
  headStudentEmail?: string;
}

export interface CreateGroupRequest {
  name: string;
  faculty: string;
  courseNumber: number;
  curatorEmail: string;
  headStudentEmail?: string;
}

export interface UpdateGroupRequest {
  id: string;
  name: string;
  faculty: string;
  courseNumber: number;
  curatorEmail: string;
  headEmail?: string;
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
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Group" as const,
                id
              })),
              { type: "Group" as const, id: "LIST" }
            ]
          : [{ type: "Group" as const, id: "LIST" }]
    }),

    createGroup: builder.mutation<Group, CreateGroupRequest>({
      query: (data) => ({
        url: "/Group",
        method: "POST",
        body: data
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }]
    }),

    deleteGroup: builder.mutation<void, string>({
      query: (groupId) => ({
        url: `/Group/${groupId}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }]
    }),

    updateGroup: builder.mutation<Group, UpdateGroupRequest>({
      query: ({ id, ...body }) => ({
        url: `/Group`,
        method: "PUT",
        body: { id, ...body }
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }]
    })
  })
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation
} = groupApi;
