import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
  invitedUsersIds: string[];
}

export interface CreateCalendarEventRequest {
  dateOfEvent: string;
  title: string;
  description: string;
  invitedUserIds: string[];
}

export interface GetEventByIdResponse {
  dateOfEvent: string;
  title: string;
  description: string;
  creatorFullName: string;
  invitedUsersIds: string[];
}

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ["CalendarEvent"],
  endpoints: (builder) => ({
    // GET all
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

    // GET by id
    getEventById: builder.query<GetEventByIdResponse, string>({
      query: (id) => `/CalendarEvent/events/${id}`,
      providesTags: (_res, _err, id) => [{ type: "CalendarEvent", id }]
    }),

    // CREATE
    createEvent: builder.mutation<CalendarEvent, CreateCalendarEventRequest>({
      query: (body) => ({
        url: "/CalendarEvent/events",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "CalendarEvent", id: "LIST" }]
    }),

    // DELETE
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/CalendarEvent/events/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "CalendarEvent", id },
        { type: "CalendarEvent", id: "LIST" }
      ]
    })
  })
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useDeleteEventMutation
} = calendarApi;
