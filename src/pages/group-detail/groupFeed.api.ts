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
  /** Файлы в multipart-поле Attachments (контракт OpenAPI: array binary). */
  attachmentFiles?: File[];
}

export interface UpdateFeedItemRequest {
  title: string;
  description: string;
  type: FeedItemType;
  groupId: string;
  surveyId?: string | null;
  documentId?: string | null;
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
        const formData = new FormData();
        formData.append("Title", body.title);
        formData.append("Description", body.description ?? "");
        formData.append("Type", String(body.type));
        formData.append("GroupId", body.groupId);
        if (body.surveyId) {
          formData.append("SurveyId", body.surveyId);
        }
        for (const file of body.attachmentFiles ?? []) {
          formData.append("Attachments", file);
        }

        return {
          url: `/GroupFeedItem`,
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Feed", id: "LIST" },
        { type: "Group", id: arg.groupId }
      ]
    }),

    updateFeedItem: builder.mutation<
      void,
      { id: string; body: UpdateFeedItemRequest }
    >({
      query: ({ id, body }) => ({
        url: `/GroupFeedItem/${id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          title: body.title,
          description: body.description,
          type: body.type,
          groupId: body.groupId,
          surveyId: body.surveyId ?? null,
          documentId: body.documentId ?? null
        }
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Feed", id: "LIST" },
        { type: "Group", id: arg.body.groupId }
      ]
    }),

    deleteFeedItem: builder.mutation<void, { id: string; groupId: string }>({
      query: ({ id }) => ({
        url: `/GroupFeedItem/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, arg) => [
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
