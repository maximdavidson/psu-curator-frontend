import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface CalendarEventType {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  eventsCount: number;
}

export interface CreateCalendarEventTypeRequest {
  name: string;
  description?: string | null;
}

export type UpdateCalendarEventTypeRequest = CreateCalendarEventTypeRequest;

export const calendarEventTypeApi = createApi({
  reducerPath: "calendarEventTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CalendarEventType"],
  endpoints: (builder) => ({
    getEventTypes: builder.query<CalendarEventType[], void>({
      query: () => "/CalendarEvent/event-types",
      providesTags: ["CalendarEventType"]
    }),
    createEventType: builder.mutation<
      CalendarEventType,
      CreateCalendarEventTypeRequest
    >({
      query: (body) => ({
        url: "/CalendarEvent/event-types",
        method: "POST",
        body
      }),
      invalidatesTags: ["CalendarEventType"]
    }),
    updateEventType: builder.mutation<
      CalendarEventType,
      { id: string; body: UpdateCalendarEventTypeRequest }
    >({
      query: ({ id, body }) => ({
        url: `/CalendarEvent/event-types/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["CalendarEventType"]
    }),
    deleteEventType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/CalendarEvent/event-types/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["CalendarEventType"]
    })
  })
});

export const {
  useGetEventTypesQuery,
  useCreateEventTypeMutation,
  useUpdateEventTypeMutation,
  useDeleteEventTypeMutation
} = calendarEventTypeApi;
