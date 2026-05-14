import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface CalendarEvent {
  id: string;
  dateOfEvent: string;
  title: string;
  description?: string;
}

export interface CalendarEventDetails {
  id: string;
  dateOfEvent: string;
  title: string;
  description: string;
  creatorFullName: string;
  invitedUserEmails: string[];
}

export interface CreateCalendarEventRequest {
  dateOfEvent: string;
  title: string;
  description?: string;
  invitedUserEmails: string[];
}

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CalendarEvent"],
  endpoints: (builder) => ({
    getEvents: builder.query<CalendarEvent[], void>({
      query: () => "/CalendarEvent/events",
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({
                type: "CalendarEvent" as const,
                id: e.id
              })),
              { type: "CalendarEvent", id: "LIST" }
            ]
          : [{ type: "CalendarEvent", id: "LIST" }]
    }),

    createEvent: builder.mutation<CalendarEvent, CreateCalendarEventRequest>({
      query: (body) => ({
        url: "/CalendarEvent/events",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "CalendarEvent", id: "LIST" }]
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/CalendarEvent/events/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "CalendarEvent", id: "LIST" }]
    })
  })
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation
} = calendarApi;
