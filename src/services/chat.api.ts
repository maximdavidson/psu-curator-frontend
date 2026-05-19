import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  createdAt: string;
  readAt?: string | null;
}
export interface ChatDialog {
  userId: string;
  userFullName: string;
  userEmail: string;
  userAvatarUrl?: string | null;
  lastMessage: ChatMessage;
  unreadCount: number;
}
export interface ChatUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}
export interface SendChatMessageRequest {
  recipientId: string;
  text: string;
}
export interface UpdateChatMessageRequest {
  messageId: string;
  text: string;
}
export interface ChatMessagesQueryArg {
  interlocutorId: string;
  scope: string;
}
export const buildChatMessagesQueryArg = (
  currentUserId: string | null,
  interlocutorId: string
): ChatMessagesQueryArg => ({
  interlocutorId,
  scope: currentUserId ?? "anonymous"
});
export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ChatDialogs", "ChatMessages"],
  endpoints: (builder) => ({
    getDialogs: builder.query<ChatDialog[], void>({
      query: () => "/Chat/dialogs",
      providesTags: [{ type: "ChatDialogs", id: "LIST" }]
    }),
    getMessages: builder.query<ChatMessage[], ChatMessagesQueryArg>({
      query: ({ interlocutorId }) => `/Chat/${interlocutorId}/messages`,
      providesTags: (_result, _error, { interlocutorId, scope }) => [
        { type: "ChatMessages", id: `${scope}:${interlocutorId}` },
        { type: "ChatMessages", id: "LIST" }
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            chatApi.util.invalidateTags([{ type: "ChatDialogs", id: "LIST" }])
          );
        } catch {
          void 0;
        }
      }
    }),
    searchChatUsers: builder.query<ChatUser[], string>({
      query: (name) => ({
        url: "/Chat/users",
        params: { name }
      })
    }),
    sendMessage: builder.mutation<ChatMessage, SendChatMessageRequest>({
      query: (body) => ({
        url: "/Chat/messages",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      }),
      invalidatesTags: (_result, _error, { recipientId }) => [
        { type: "ChatMessages", id: recipientId },
        { type: "ChatMessages", id: "LIST" },
        { type: "ChatDialogs", id: "LIST" }
      ]
    }),
    updateMessage: builder.mutation<ChatMessage, UpdateChatMessageRequest>({
      query: ({ messageId, text }) => ({
        url: `/Chat/messages/${messageId}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { text }
      }),
      invalidatesTags: [
        { type: "ChatMessages", id: "LIST" },
        { type: "ChatDialogs", id: "LIST" }
      ]
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/Chat/messages/${messageId}`,
        method: "DELETE"
      }),
      invalidatesTags: [
        { type: "ChatMessages", id: "LIST" },
        { type: "ChatDialogs", id: "LIST" }
      ]
    }),
    deleteDialog: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/Chat/dialogs/${userId}`,
        method: "DELETE"
      }),
      invalidatesTags: [
        { type: "ChatMessages", id: "LIST" },
        { type: "ChatDialogs", id: "LIST" }
      ]
    })
  })
});
export const {
  useGetDialogsQuery,
  useGetMessagesQuery,
  useLazySearchChatUsersQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useDeleteDialogMutation
} = chatApi;
