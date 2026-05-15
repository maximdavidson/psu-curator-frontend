import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
import type {
  SurveyDetail,
  SurveyListItem,
  SubmitSurveyPayload,
  SurveyStatistics
} from "./survey.types";

export interface CreateSurveyRequest {
  title: string;
  description: string;
  questions: {
    text: string;
    type: string;
    options: string[];
  }[];
}

export const surveyApi = createApi({
  reducerPath: "surveyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Survey"],
  endpoints: (builder) => ({
    getUserSurveys: builder.query<SurveyListItem[], string>({
      query: (userId) => `/Survey/users/${userId}`,
      providesTags: ["Survey"]
    }),

    getSurveyById: builder.query<SurveyDetail, string>({
      query: (surveyId) => `/Survey/${surveyId}`,
      providesTags: (_result, _error, surveyId) => [
        { type: "Survey", id: surveyId }
      ]
    }),

    createSurvey: builder.mutation<void, CreateSurveyRequest>({
      query: (data) => ({
        url: "/Survey",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Survey"]
    }),

    deleteSurvey: builder.mutation<void, string>({
      query: (surveyId) => ({
        url: `/Survey/${surveyId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Survey"]
    }),

    submitSurveyResponse: builder.mutation<
      void,
      { surveyId: string; body: SubmitSurveyPayload }
    >({
      query: ({ surveyId, body }) => ({
        url: `/Survey/${surveyId}/responses`,
        method: "POST",
        body
      }),
      invalidatesTags: (_result, _error, { surveyId }) => [
        { type: "Survey", id: surveyId },
        "Survey"
      ]
    }),

    getSurveyStatistics: builder.query<SurveyStatistics, string>({
      query: (surveyId) => `/Survey/${surveyId}/statistics`,
      providesTags: (_result, _error, surveyId) => [
        { type: "Survey", id: `${surveyId}-stats` }
      ]
    })
  })
});

export const {
  useGetUserSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
  useDeleteSurveyMutation,
  useSubmitSurveyResponseMutation,
  useGetSurveyStatisticsQuery
} = surveyApi;
