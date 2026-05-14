import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: "event" | "feed" | "survey" | "document";
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getAllNotifications: builder.query<Notification[], void>({
      query: () => "/Notification",
      providesTags: ["Notification"]
    }),

    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => "/Notification/unreads",
      providesTags: ["Notification"]
    }),

    markAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/Notification/all/${notificationId}`,
        method: "PATCH"
      }),
      invalidatesTags: ["Notification"]
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/Notification",
        method: "PATCH"
      }),
      invalidatesTags: ["Notification"]
    })
  })
});

export const {
  useGetAllNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} = notificationApi;
