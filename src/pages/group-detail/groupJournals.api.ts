import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
export type GroupJournalType = 1;
export interface GroupJournalListItem {
  id: string;
  groupId: string;
  title: string;
  type: GroupJournalType;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdByName: string;
  entriesCount: number;
}
export interface GroupJournalDaySchedule {
  id?: string | null;
  date: string;
  requiredHours: number;
}
export interface GroupJournalEntry {
  id?: string | null;
  date: string;
  requiredHours: number;
  missedHours?: number | null;
  attendedHours?: number | null;
  comment?: string | null;
  canEdit?: boolean;
}
export interface GroupJournalParticipant {
  userId: string;
  fullName: string;
  email: string;
  isHeadman: boolean;
  isFormerMember: boolean;
  canRemoveFromJournal: boolean;
  entries: GroupJournalEntry[];
}
export interface GroupJournalDetail {
  id: string;
  groupId: string;
  groupName: string;
  title: string;
  type: GroupJournalType;
  startDate: string;
  endDate: string;
  dates: string[];
  daySchedules: GroupJournalDaySchedule[];
  canManage: boolean;
  canEditEntries: boolean;
  participants: GroupJournalParticipant[];
}
export interface CreateGroupJournalRequest {
  title: string;
  startDate: string;
  endDate: string;
}
export type UpdateGroupJournalRequest = CreateGroupJournalRequest;
export interface SaveGroupJournalDayScheduleRequest {
  date: string;
  requiredHours: number;
}
export interface SaveGroupJournalEntryRequest {
  userId: string;
  date: string;
  attendedHours: number;
  comment?: string | null;
}
export interface SaveGroupJournalEntriesRequest {
  daySchedules: SaveGroupJournalDayScheduleRequest[];
  entries: SaveGroupJournalEntryRequest[];
}
export const groupJournalsApi = createApi({
  reducerPath: "groupJournalsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GroupJournal"],
  endpoints: (builder) => ({
    getGroupJournals: builder.query<GroupJournalListItem[], string>({
      query: (groupId) => `/Group/${groupId}/journals`,
      providesTags: (_result, _error, groupId) => [
        { type: "GroupJournal", id: `GROUP-${groupId}` }
      ]
    }),
    getGroupJournal: builder.query<GroupJournalDetail, string>({
      query: (journalId) => `/GroupJournals/${journalId}`,
      providesTags: (_result, _error, journalId) => [
        { type: "GroupJournal", id: journalId }
      ]
    }),
    createGroupJournal: builder.mutation<
      string,
      {
        groupId: string;
        body: CreateGroupJournalRequest;
      }
    >({
      query: ({ groupId, body }) => ({
        url: `/Group/${groupId}/journals`,
        method: "POST",
        body
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GroupJournal", id: `GROUP-${groupId}` }
      ]
    }),
    updateGroupJournal: builder.mutation<
      void,
      {
        journalId: string;
        groupId: string;
        body: UpdateGroupJournalRequest;
      }
    >({
      query: ({ journalId, body }) => ({
        url: `/GroupJournals/${journalId}`,
        method: "PUT",
        body
      }),
      invalidatesTags: (_result, _error, { journalId, groupId }) => [
        { type: "GroupJournal", id: journalId },
        { type: "GroupJournal", id: `GROUP-${groupId}` }
      ]
    }),
    deleteGroupJournal: builder.mutation<
      void,
      {
        journalId: string;
        groupId: string;
      }
    >({
      query: ({ journalId }) => ({
        url: `/GroupJournals/${journalId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, { journalId, groupId }) => [
        { type: "GroupJournal", id: journalId },
        { type: "GroupJournal", id: `GROUP-${groupId}` }
      ]
    }),
    saveGroupJournalEntries: builder.mutation<
      void,
      {
        journalId: string;
        body: SaveGroupJournalEntriesRequest;
      }
    >({
      query: ({ journalId, body }) => ({
        url: `/GroupJournals/${journalId}/entries`,
        method: "PUT",
        body
      }),
      invalidatesTags: (_result, _error, { journalId }) => [
        { type: "GroupJournal", id: journalId }
      ]
    }),
    downloadGroupJournalExcel: builder.mutation<Blob, string>({
      query: (journalId) => ({
        url: `/GroupJournals/${journalId}/export/excel`,
        method: "GET",
        responseHandler: (response) => response.blob()
      })
    }),
    removeFormerJournalParticipant: builder.mutation<
      void,
      {
        journalId: string;
        userId: string;
      }
    >({
      query: ({ journalId, userId }) => ({
        url: `/GroupJournals/${journalId}/participants/${userId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, { journalId }) => [
        { type: "GroupJournal", id: journalId }
      ]
    })
  })
});
export const {
  useGetGroupJournalsQuery,
  useGetGroupJournalQuery,
  useCreateGroupJournalMutation,
  useUpdateGroupJournalMutation,
  useDeleteGroupJournalMutation,
  useSaveGroupJournalEntriesMutation,
  useDownloadGroupJournalExcelMutation,
  useRemoveFormerJournalParticipantMutation
} = groupJournalsApi;
