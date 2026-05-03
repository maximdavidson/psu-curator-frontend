import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
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
