import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface CalendarEventType {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface CreateCalendarEventTypeRequest {
  name: string;
  description?: string | null;
}

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
    })
  })
});

export const { useGetEventTypesQuery, useCreateEventTypeMutation } =
  calendarEventTypeApi;
