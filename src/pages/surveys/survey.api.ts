import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ISurvey } from "./survey.types";

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
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ["Survey"],
  endpoints: (builder) => ({
    getUserSurveys: builder.query<ISurvey[], string>({
      query: (userId) => `/Survey/users/${userId}`,
      providesTags: ["Survey"]
    }),

    getSurveyById: builder.query<ISurvey, string>({
      query: (surveyId) => `/Survey/${surveyId}`,
      providesTags: ["Survey"]
    }),

    createSurvey: builder.mutation<ISurvey, CreateSurveyRequest>({
      query: (data) => ({
        url: "/Survey",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Survey"]
    }),

    deleteSurvey: builder.mutation<{ id: string }, string>({
      query: (surveyId) => ({
        url: `/Survey/${surveyId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Survey"]
    })
  })
});

export const {
  useGetUserSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
  useDeleteSurveyMutation
} = surveyApi;
