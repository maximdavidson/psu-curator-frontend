import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const FeedItemType = {
  Message: 0,
  Poll: 1,
  Document: 2
} as const;

export type FeedItemType = (typeof FeedItemType)[keyof typeof FeedItemType];

export interface GroupFeedItem {
  id: string;
  title: string;
  description: string;
  type: FeedItemType;
  groupId: string;
  surveyId?: string;
  documentId?: string;
  createdAt: string;
  authorEmail: string;
}

export interface CreateFeedItemRequest {
  title: string;
  description: string;
  type: FeedItemType;
  groupId: string;
  surveyId?: string;
  attachments?: string[];
}

export interface UpdateFeedItemRequest {
  title: string;
  description: string;
  type: FeedItemType;
  groupId: string;
  surveyId?: string;
  attachments?: string[];
}

export const groupFeedApi = createApi({
  reducerPath: "groupFeedApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ["Feed", "Group"],
  endpoints: (builder) => ({
    createFeedItem: builder.mutation<void, CreateFeedItemRequest>({
      query: (body) => {
        // Создание - через FormData
        const formData = new FormData();
        formData.append("Title", body.title);
        formData.append("Description", body.description);
        formData.append("Type", body.type.toString());
        formData.append("GroupId", body.groupId);
        formData.append("SurveyId", body.surveyId || "");
        formData.append("Attachments", "");

        return {
          url: `/GroupFeedItem`,
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Feed", id: "LIST" },
        { type: "Group", id: arg.groupId }
      ]
    }),

    updateFeedItem: builder.mutation<
      void,
      { id: string; body: UpdateFeedItemRequest }
    >({
      query: ({ id, body }) => ({
        // Обновление - через JSON
        url: `/GroupFeedItem/${id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          Title: body.title,
          Description: body.description,
          Type: body.type,
          GroupId: body.groupId,
          SurveyId: body.surveyId || null,
          Attachments: body.attachments || []
        }
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Feed", id: "LIST" },
        { type: "Group", id: arg.body.groupId }
      ]
    }),

    deleteFeedItem: builder.mutation<void, { id: string; groupId: string }>({
      query: ({ id }) => ({
        url: `/GroupFeedItem/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Feed", id: "LIST" },
        { type: "Group", id: arg.groupId }
      ]
    })
  })
});

export const {
  useCreateFeedItemMutation,
  useDeleteFeedItemMutation,
  useUpdateFeedItemMutation
} = groupFeedApi;
