import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface GroupAbsenceItem {
  userId: string;
  fullName: string;
  date: string;
  journalId: string;
  journalTitle: string;
  missedHours: number;
  comment?: string | null;
}

export interface GroupAbsenceStudentTotal {
  userId: string;
  fullName: string;
  isHeadman: boolean;
  totalMissedHours: number;
  absenceDaysCount: number;
}

export interface GroupAbsenceReport {
  groupId: string;
  groupName: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  totalMissedHours: number;
  studentTotals: GroupAbsenceStudentTotal[];
  items: GroupAbsenceItem[];
}

export interface GroupAbsencesQueryArgs {
  groupId: string;
  dateFrom?: string;
  dateTo?: string;
}

const buildAbsenceParams = (args: GroupAbsencesQueryArgs) => {
  const params: Record<string, string> = {};

  if (args.dateFrom) {
    params.dateFrom = args.dateFrom;
  }

  if (args.dateTo) {
    params.dateTo = args.dateTo;
  }

  return params;
};

export const groupAbsencesApi = createApi({
  reducerPath: "groupAbsencesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GroupAbsence"],
  endpoints: (builder) => ({
    getGroupAbsences: builder.query<GroupAbsenceReport, GroupAbsencesQueryArgs>(
      {
        query: ({ groupId, dateFrom, dateTo }) => ({
          url: `/Group/${groupId}/absences`,
          params: buildAbsenceParams({ groupId, dateFrom, dateTo })
        }),
        providesTags: (_result, _error, { groupId }) => [
          { type: "GroupAbsence", id: groupId }
        ]
      }
    ),
    downloadGroupAbsencesExcel: builder.mutation<Blob, GroupAbsencesQueryArgs>({
      query: ({ groupId, dateFrom, dateTo }) => ({
        url: `/Group/${groupId}/absences/export/excel`,
        method: "GET",
        params: buildAbsenceParams({ groupId, dateFrom, dateTo }),
        responseHandler: (response) => response.blob()
      })
    })
  })
});

export const {
  useGetGroupAbsencesQuery,
  useDownloadGroupAbsencesExcelMutation
} = groupAbsencesApi;
