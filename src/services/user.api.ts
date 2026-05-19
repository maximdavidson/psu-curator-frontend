import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
export interface UserFullName {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl?: string | null;
}
export interface UserFullInformation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  surname?: string | null;
  phoneNumber?: string;
  faculty?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
}
export interface UserListItem extends UserFullInformation {
  role: number;
  accountStatus: number;
  createdAt: string;
}
export interface CreateStaffUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  surname?: string;
  faculty?: string;
  department?: string;
  role: number;
}
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUserById: builder.query<UserFullInformation, string>({
      query: (userId) => `/User/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
        "User"
      ]
    }),
    searchUsersByName: builder.query<UserFullName[], string>({
      query: (name) => ({
        url: "/User/names",
        params: { name }
      })
    }),
    getUsers: builder.query<UserListItem[], void>({
      query: () => "/User",
      providesTags: ["User"]
    }),
    createStaffUser: builder.mutation<UserListItem, CreateStaffUserRequest>({
      query: (body) => ({
        url: "/User/staff",
        method: "POST",
        body
      }),
      invalidatesTags: ["User"]
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/User/${userId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["User"]
    }),
    uploadCurrentUserAvatar: builder.mutation<UserFullInformation, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/User/me/avatar",
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: ["User"]
    })
  })
});
export const {
  useGetUserByIdQuery,
  useLazySearchUsersByNameQuery,
  useGetUsersQuery,
  useCreateStaffUserMutation,
  useDeleteUserMutation,
  useUploadCurrentUserAvatarMutation
} = userApi;
