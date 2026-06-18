import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
import { groupCategoryApi } from "@/pages/groups/groupCategory.api";
export interface Group {
  id: string;
  name: string;
  faculty: string;
  department?: string | null;
  courseNumber: number;
  categoryId?: string | null;
  categoryName?: string | null;
  countOfstudents: number;
  firstName: string;
  lastName: string;
  surname: string;
  curatorEmail?: string | null;
  headStudentEmail?: string | null;
}
export interface CreateGroupRequest {
  name: string;
  faculty: string;
  department?: string;
  courseNumber: number;
  categoryId?: string;
  curatorEmail?: string;
  headStudentEmail?: string;
}
export interface UpdateGroupRequest {
  id: string;
  name: string;
  faculty: string;
  department?: string;
  courseNumber: number;
  curatorEmail?: string;
  headEmail?: string;
}
export interface FeedItemComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}
export interface FeedItem {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  type?: number;
  surveyId?: string | null;
  surveyTitle?: string | null;
  attachments: {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    description: string;
    downloadUrl: string;
    uploadedByName: string;
  }[];
  comments?: FeedItemComment[] | null;
}
export interface GroupMember {
  id: string;
  fullName: string | null;
  email: string | null;
  isHeadman?: boolean;
  isCurator?: boolean;
  isStudentRoster?: boolean;
  fundingType?: number | null;
}
export interface GroupDetails {
  id: string;
  name: string;
  faculty: string;
  department?: string | null;
  courseNumber: number;
  curatorId: string;
  curatorFullName: string;
  headStudentId: string;
  headStudentName: string;
  feedItems: FeedItem[];
  students?: GroupMember[] | null;
}
export interface AddStudentsToGroupRequest {
  groupId: string;
  studentIds: string[];
}
export type RemoveStudentsFromGroupRequest = AddStudentsToGroupRequest;
export interface AssignHeadStudentRequest {
  groupId: string;
  headId: string;
}
export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Group"],
  endpoints: (builder) => ({
    getGroups: builder.query<Group[], string | undefined>({
      query: (categoryId) => ({
        url: "/Group",
        params: categoryId ? { categoryId } : undefined
      }),
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
      invalidatesTags: [{ type: "Group", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            groupCategoryApi.util.invalidateTags([
              { type: "GroupCategory", id: "LIST" }
            ])
          );
        } catch {
          // mutation failed — counts unchanged
        }
      }
    }),
    deleteGroup: builder.mutation<void, string>({
      query: (groupId) => ({
        url: `/Group/${groupId}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            groupCategoryApi.util.invalidateTags([
              { type: "GroupCategory", id: "LIST" }
            ])
          );
        } catch {
          // mutation failed — counts unchanged
        }
      }
    }),
    updateGroup: builder.mutation<Group, UpdateGroupRequest>({
      query: ({ id, ...body }) => ({
        url: `/Group`,
        method: "PUT",
        body: { id, ...body }
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            groupCategoryApi.util.invalidateTags([
              { type: "GroupCategory", id: "LIST" }
            ])
          );
        } catch {
          // mutation failed — counts unchanged
        }
      }
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
    }),
    assignHeadStudent: builder.mutation<void, AssignHeadStudentRequest>({
      query: (body) => ({
        url: "/Group/groups/head-student",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
        { type: "Group", id: "LIST" }
      ]
    }),
    removeHeadStudent: builder.mutation<void, string>({
      query: (groupId) => ({
        url: `/Group/${groupId}/head-student`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, groupId) => [
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
  useRemoveStudentsFromGroupMutation,
  useAssignHeadStudentMutation,
  useRemoveHeadStudentMutation
} = groupApi;
