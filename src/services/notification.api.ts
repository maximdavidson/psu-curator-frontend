import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: "event" | "feed" | "survey" | "document";
  relatedEntityId?: string | null;
}
interface NotificationResponse extends Omit<Notification, "id"> {
  id?: string;
  notificationId?: string;
}
const normalizeNotification = (
  notification: NotificationResponse
): Notification => ({
  ...notification,
  id: notification.id ?? notification.notificationId ?? ""
});
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getAllNotifications: builder.query<Notification[], void>({
      query: () => "/Notification",
      transformResponse: (response: NotificationResponse[]) =>
        response.map(normalizeNotification),
      providesTags: ["Notification"]
    }),
    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => "/Notification/unreads",
      transformResponse: (response: NotificationResponse[]) =>
        response.map(normalizeNotification),
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
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/Notification/${notificationId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Notification"]
    })
  })
});
export const {
  useGetAllNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;
