import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
export interface CalendarEvent {
  id: string;
  dateOfEvent: string;
  endDateOfEvent?: string | null;
  title: string;
  description?: string;
  eventTypeId?: string | null;
  eventTypeName?: string | null;
  isCreator?: boolean;
  isAccepted?: boolean;
  invitedUsers: CalendarEventInvitedUser[];
}
export interface CalendarEventInvitedUser {
  id: string;
  fullName: string;
  email: string;
  isAccepted?: boolean;
}
export interface CalendarEventDetails {
  id: string;
  dateOfEvent: string;
  endDateOfEvent?: string | null;
  title: string;
  description: string;
  eventTypeId?: string | null;
  eventTypeName?: string | null;
  creatorFullName: string;
  invitedUserEmails: string[];
  invitedUsers: CalendarEventInvitedUser[];
  isCreator: boolean;
  isAccepted: boolean;
}
export interface CreateCalendarEventRequest {
  dateOfEvent: string;
  endDateOfEvent?: string | null;
  title: string;
  description?: string;
  eventTypeId?: string | null;
  invitedUsersIds?: string[];
  invitedUserEmails: string[];
  invitedGroupIds?: string[];
}
export interface UpdateCalendarEventRequest {
  newDateOfEvent?: string;
  newEndDateOfEvent?: string | null;
  newTitle?: string;
  newDescription?: string;
  newEventTypeId?: string | null;
  userForDelete?: string[];
  newUsers?: string[];
  newUserEmails?: string[];
  newGroupIds?: string[];
}
export interface CalendarEventAttendanceParticipant {
  userId: string;
  fullName: string;
  email: string;
  isAccepted: boolean;
  acceptedAt?: string | null;
  wasPresent?: boolean | null;
}
export interface CalendarEventAttendanceReport {
  eventId: string;
  title: string;
  dateOfEvent: string;
  endDateOfEvent?: string | null;
  invitedCount: number;
  acceptedCount: number;
  attendedCount: number;
  canManage: boolean;
  participants: CalendarEventAttendanceParticipant[];
}
export interface SaveCalendarEventAttendanceRequest {
  entries: { userId: string; wasPresent: boolean }[];
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
    }),
    updateEvent: builder.mutation<
      void,
      {
        id: string;
        body: UpdateCalendarEventRequest;
      }
    >({
      query: ({ id, body }) => ({
        url: `/CalendarEvent/events/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "CalendarEvent", id: arg.id },
        { type: "CalendarEvent", id: "LIST" }
      ]
    }),
    acceptEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/CalendarEvent/events/${id}/accept`,
        method: "POST"
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "CalendarEvent", id },
        { type: "CalendarEvent", id: "LIST" }
      ]
    }),
    getAttendanceReport: builder.query<CalendarEventAttendanceReport, string>({
      query: (eventId) => `/CalendarEvent/events/${eventId}/attendance-report`,
      providesTags: (_result, _error, eventId) => [
        { type: "CalendarEvent", id: `${eventId}-attendance` }
      ]
    }),
    saveAttendance: builder.mutation<
      CalendarEventAttendanceReport,
      { eventId: string; body: SaveCalendarEventAttendanceRequest }
    >({
      query: ({ eventId, body }) => ({
        url: `/CalendarEvent/events/${eventId}/attendance`,
        method: "PUT",
        body
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "CalendarEvent", id: `${eventId}-attendance` },
        { type: "CalendarEvent", id: eventId },
        { type: "CalendarEvent", id: "LIST" }
      ]
    }),
    downloadAttendanceReportDocx: builder.mutation<Blob, string>({
      query: (eventId) => ({
        url: `/CalendarEvent/events/${eventId}/attendance-report/export/docx`,
        method: "GET",
        responseHandler: (response) => response.blob()
      })
    })
  })
});
export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
  useUpdateEventMutation,
  useAcceptEventMutation,
  useGetAttendanceReportQuery,
  useSaveAttendanceMutation,
  useDownloadAttendanceReportDocxMutation
} = calendarApi;
