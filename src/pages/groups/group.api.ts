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

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  /** 0 — сообщение, 1 — опрос, 2 — документ (если отдаёт API). */
  type?: number;
  surveyId?: string | null;
  attachments: {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    description: string;
    downloadUrl: string;
    uploadedByName: string;
  }[];
}

export interface GroupMember {
  id: string;
  fullName: string | null;
  email: string | null;
}

export interface GroupDetails {
  id: string;
  name: string;
  faculty: string;
  courseNumber: number;
  curatorId: string;
  curatorFullName: string;
  headStudentId: string;
  headStudentName: string;
  feedItems: FeedItem[];
  students?: GroupMember[] | null;
}

/** Тело как в OpenAPI бэкенда (свойство grouId). */
export interface AddStudentsToGroupRequest {
  groupId: string;
  studentIds: string[];
}

export type RemoveStudentsFromGroupRequest = AddStudentsToGroupRequest;

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
    }),
    getGroupById: builder.query<GroupDetails, string>({
      query: (groupId) => `/Group/${groupId}`,
      providesTags: (result) =>
        result
          ? [
              { type: "Group", id: result.id },
              { type: "Group", id: "LIST" }
            ]
          : [{ type: "Group", id: "LIST" }]
    }),

    addStudentsToGroup: builder.mutation<void, AddStudentsToGroupRequest>({
      query: ({ groupId, studentIds }) => ({
        url: "/Group/groups/students",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          grouId: groupId,
          studentIds
        }
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
        { type: "Group", id: "LIST" }
      ]
    }),

    removeStudentsFromGroup: builder.mutation<
      void,
      RemoveStudentsFromGroupRequest
    >({
      query: ({ groupId, studentIds }) => ({
        url: "/Group/groups/students",
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: {
          grouId: groupId,
          studentIds
        }
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
        { type: "Group", id: "LIST" }
      ]
    })
  })
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation,
  useGetGroupByIdQuery,
  useAddStudentsToGroupMutation,
  useRemoveStudentsFromGroupMutation
} = groupApi;
