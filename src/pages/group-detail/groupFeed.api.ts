import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
import type { FeedItemComment } from "@/pages/groups/group.api";
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
  baseQuery: baseQueryWithReauth,
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
          formData.append("Attachments", file, file.name);
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
      {
        id: string;
        body: UpdateFeedItemRequest;
      }
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
    deleteFeedItem: builder.mutation<
      void,
      {
        id: string;
        groupId: string;
      }
    >({
      query: ({ id }) => ({
        url: `/GroupFeedItem/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Feed", id: "LIST" },
        { type: "Group", id: arg.groupId }
      ]
    }),
    addFeedItemComment: builder.mutation<
      FeedItemComment,
      { feedItemId: string; groupId: string; text: string }
    >({
      query: ({ feedItemId, text }) => ({
        url: `/GroupFeedItem/${feedItemId}/comments`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { text }
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Group", id: arg.groupId }
      ]
    })
  })
});
export const {
  useCreateFeedItemMutation,
  useDeleteFeedItemMutation,
  useUpdateFeedItemMutation,
  useAddFeedItemCommentMutation
} = groupFeedApi;
