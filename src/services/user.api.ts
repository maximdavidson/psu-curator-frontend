import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
export interface UserFullName {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl?: string | null;
  fundingType?: number | null;
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
  lastSeenAt?: string | null;
  isOnline?: boolean;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserAttendanceSummary {
  isInGroup: boolean;
  totalMissedHours: number;
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

export interface CreateStudentUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  surname?: string;
  studentCardNumber: string;
  courseNumber: number;
  enrollmentYear?: number;
  groupId?: string;
  fundingType: number;
}

export interface StudentListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  surname?: string | null;
  studentCardNumber: string;
  courseNumber: number;
  enrollmentYear: number;
  fundingType: number;
  groupId?: string | null;
  groupName?: string | null;
  isInGroup: boolean;
  totalMissedHours: number;
}
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Group", "Students"],
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
    getStudents: builder.query<StudentListItem[], void>({
      query: () => "/User/students",
      providesTags: ["Students"]
    }),
    createStudentUser: builder.mutation<UserListItem, CreateStudentUserRequest>(
      {
        query: (body) => ({
          url: "/User/students",
          method: "POST",
          body
        }),
        invalidatesTags: ["User", "Group", "Students"]
      }
    ),
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
    }),
    deleteCurrentUserAvatar: builder.mutation<UserFullInformation, void>({
      query: () => ({
        url: "/User/me/avatar",
        method: "DELETE"
      }),
      invalidatesTags: ["User"]
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: "/User/me/password",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: {
          currentPassword: body.currentPassword,
          newPassword: body.newPassword
        }
      })
    }),
    getCurrentUserAttendanceSummary: builder.query<UserAttendanceSummary, void>(
      {
        query: () => "/User/me/attendance-summary",
        providesTags: [{ type: "User", id: "attendance-summary" }]
      }
    ),
    forceChangePassword: builder.mutation<void, { newPassword: string }>({
      query: (body) => ({
        url: "/User/me/force-change-password",
        method: "PUT",
        body
      })
    })
  })
});
export const {
  useGetUserByIdQuery,
  useLazySearchUsersByNameQuery,
  useGetUsersQuery,
  useCreateStaffUserMutation,
  useGetStudentsQuery,
  useCreateStudentUserMutation,
  useDeleteUserMutation,
  useUploadCurrentUserAvatarMutation,
  useDeleteCurrentUserAvatarMutation,
  useChangePasswordMutation,
  useForceChangePasswordMutation,
  useGetCurrentUserAttendanceSummaryQuery
} = userApi;
