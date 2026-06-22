import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useSelector } from "react-redux";
import {
  type ChatUser,
  buildChatMessagesQueryArg,
  useGetDialogsQuery,
  useGetMessagesQuery,
  useLazySearchChatUsersQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useDeleteDialogMutation,
  useGetUserPresenceQuery,
  type ChatUserPresence
} from "@/services/chat.api";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { selectToken } from "@/stores/auth.store";
import { useGetUserByIdQuery } from "@/services/user.api";
import { UserAvatar } from "@/shared/ui/user-avatar/user-avatar";
import { formatLastSeen, isUserOnline } from "@/shared/lib/format-last-seen";
import type { ChatDialog } from "@/services/chat.api";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import styles from "./chat.module.scss";
const MIN_SEARCH_LENGTH = 2;
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const getUserTitle = (user: ChatUser): string =>
  user.fullName?.trim() || user.email || "Пользователь";
const getDialogTitle = (
  user: ChatUser,
  currentUserId: string | null
): string => (user.id === currentUserId ? "Избранное" : getUserTitle(user));
type PresenceSource =
  | Pick<ChatUser, "lastSeenAt" | "isOnline">
  | ChatUserPresence;

const getPresenceSource = (
  dialog?: ChatDialog,
  user?: Pick<ChatUser, "lastSeenAt" | "isOnline">,
  presence?: PresenceSource
) => ({
  lastSeenAt:
    presence?.lastSeenAt ?? dialog?.userLastSeenAt ?? user?.lastSeenAt ?? null,
  isOnline:
    presence?.isOnline ?? dialog?.userIsOnline ?? user?.isOnline ?? false
});

const getPresenceLabel = (
  userId: string,
  currentUserId: string | null,
  dialog?: ChatDialog,
  user?: Pick<ChatUser, "lastSeenAt" | "isOnline">,
  presence?: PresenceSource
): string | null => {
  if (userId === currentUserId) {
    return null;
  }

  const source = getPresenceSource(dialog, user, presence);
  return formatLastSeen(source?.lastSeenAt, source?.isOnline);
};
const getPresenceOnline = (
  userId: string,
  currentUserId: string | null,
  dialog?: ChatDialog,
  user?: Pick<ChatUser, "lastSeenAt" | "isOnline">,
  presence?: PresenceSource
): boolean => {
  if (userId === currentUserId) {
    return false;
  }

  const source = getPresenceSource(dialog, user, presence);
  return isUserOnline(source?.lastSeenAt, source?.isOnline);
};
const getReadState = (
  isOwnMessage: boolean,
  isFavoriteDialog: boolean,
  readAt?: string | null
): "saved" | "read" | "unread" | null => {
  if (!isOwnMessage) {
    return null;
  }
  if (isFavoriteDialog) {
    return "saved";
  }
  return readAt ? "read" : "unread";
};
export const ChatPage = () => {
  useChatRealtime();
  const token = useSelector(selectToken);
  const currentUserId = getUserIdFromAccessToken(token);
  const { data: currentUser } = useGetUserByIdQuery(currentUserId ?? "", {
    skip: !currentUserId
  });
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [openDialogMenuId, setOpenDialogMenuId] = useState<string | null>(null);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { data: dialogs = [], isLoading: isDialogsLoading } =
    useGetDialogsQuery();
  const { data: selectedUserPresence } = useGetUserPresenceQuery(
    selectedUser?.id ?? "",
    {
      skip: !selectedUser || selectedUser.id === currentUserId,
      pollingInterval: 60_000
    }
  );
  const messagesQueryArg = selectedUser
    ? buildChatMessagesQueryArg(currentUserId, selectedUser.id)
    : null;
  const { data: messages = [], isFetching: isMessagesFetching } =
    useGetMessagesQuery(messagesQueryArg!, {
      skip: !messagesQueryArg
    });
  const [searchUsers, searchState] = useLazySearchChatUsersQuery();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [updateMessage, { isLoading: isUpdating }] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [deleteDialog] = useDeleteDialogMutation();
  const { confirm } = useConfirm();
  useEffect(() => {
    const query = search.trim();
    if (query.length < MIN_SEARCH_LENGTH) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      void searchUsers(query, true);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [search, searchUsers]);
  useEffect(() => {
    startTransition(() => {
      setSelectedUser(null);
      setSearch("");
      setMessageText("");
      setEditingMessageId(null);
      setEditingText("");
      setOpenDialogMenuId(null);
      setOpenMessageMenuId(null);
      setError(null);
    });
  }, [currentUserId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedUser?.id, currentUserId]);
  useEffect(() => {
    if (!openDialogMenuId && !openMessageMenuId) {
      return;
    }
    const closeMenus = () => {
      setOpenDialogMenuId(null);
      setOpenMessageMenuId(null);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, [openDialogMenuId, openMessageMenuId]);
  const favoriteUser = useMemo<ChatUser | null>(() => {
    if (!currentUserId) {
      return null;
    }
    return {
      id: currentUserId,
      fullName: "Избранное",
      email: "Сообщения самому себе",
      avatarUrl: currentUser?.avatarUrl
    };
  }, [currentUser?.avatarUrl, currentUserId]);
  const favoriteDialog = dialogs.find(
    (dialog) => dialog.userId === currentUserId
  );
  const dialogUsers: ChatUser[] = dialogs
    .filter((dialog) => dialog.userId !== currentUserId)
    .map((dialog) => ({
      id: dialog.userId,
      fullName: dialog.userFullName,
      email: dialog.userEmail,
      avatarUrl: dialog.userAvatarUrl,
      lastSeenAt: dialog.userLastSeenAt,
      isOnline: dialog.userIsOnline
    }));
  const searchResults = searchState.data ?? [];
  const isSearching = search.trim().length >= MIN_SEARCH_LENGTH;
  const searchResultUsers = searchResults.filter(
    (user) => !dialogs.some((dialog) => dialog.userId === user.id)
  );
  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
    setError(null);
  };
  const submitMessage = async () => {
    if (!selectedUser || !messageText.trim()) {
      return;
    }
    setError(null);
    try {
      await sendMessage({
        recipientId: selectedUser.id,
        text: messageText
      }).unwrap();
      setMessageText("");
      setSearch("");
    } catch (requestError) {
      const apiError = requestError as {
        data?: {
          error?: string;
        };
      };
      setError(apiError.data?.error ?? "Не удалось отправить сообщение.");
    }
  };
  const startEditing = (messageId: string, text: string) => {
    setEditingMessageId(messageId);
    setEditingText(text);
    setOpenMessageMenuId(null);
    setError(null);
  };
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };
  const submitEdit = async () => {
    if (!editingMessageId || !editingText.trim()) {
      return;
    }
    setError(null);
    try {
      await updateMessage({
        messageId: editingMessageId,
        text: editingText
      }).unwrap();
      cancelEditing();
    } catch (requestError) {
      const apiError = requestError as {
        data?: {
          error?: string;
        };
      };
      setError(apiError.data?.error ?? "Не удалось изменить сообщение.");
    }
  };
  const handleDeleteMessage = async (messageId: string) => {
    const confirmed = await confirm({
      title: "Удалить сообщение",
      message: "Удалить сообщение?",
      variant: "danger"
    });
    if (!confirmed) {
      return;
    }
    setError(null);
    try {
      await deleteMessage(messageId).unwrap();
      if (editingMessageId === messageId) {
        cancelEditing();
      }
      setOpenMessageMenuId(null);
    } catch (requestError) {
      const apiError = requestError as {
        data?: {
          error?: string;
        };
      };
      setError(apiError.data?.error ?? "Не удалось удалить сообщение.");
    }
  };
  const handleDeleteDialog = async (user: ChatUser) => {
    const confirmed = await confirm({
      title: "Удалить чат",
      message: `Удалить чат «${getDialogTitle(user, currentUserId)}»? Переписка будет удалена без возможности восстановления.`,
      variant: "danger"
    });
    if (!confirmed) {
      return;
    }
    setError(null);
    try {
      await deleteDialog(user.id).unwrap();
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        cancelEditing();
      }
      setOpenDialogMenuId(null);
    } catch (requestError) {
      const apiError = requestError as {
        data?: {
          error?: string;
        };
      };
      setError(apiError.data?.error ?? "Не удалось удалить чат.");
    }
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitMessage();
  };
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h1 className={styles.title}>Мессенджер</h1>

        <input
          className={styles.searchInput}
          type="search"
          placeholder="Найти пользователя"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className={styles.dialogList}>
          <p className={styles.listTitle}>Диалоги</p>

          {isDialogsLoading && (
            <p className={styles.hint}>Загрузка диалогов...</p>
          )}

          {favoriteUser && (
            <div
              role="button"
              tabIndex={0}
              className={`${styles.dialogItem} ${selectedUser?.id === favoriteUser.id ? styles.activeDialog : ""}`}
              onClick={() => handleSelectUser(favoriteUser)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelectUser(favoriteUser);
                }
              }}
            >
              <UserAvatar
                className={styles.avatar}
                name="Избранное"
                avatarUrl={currentUser?.avatarUrl}
                fallback="★"
              />
              <span className={styles.dialogText}>
                <span className={styles.dialogName}>Избранное</span>
                <span className={styles.dialogPreview}>
                  {favoriteDialog?.lastMessage.text ?? "Сообщения самому себе"}
                </span>
              </span>
            </div>
          )}

          {!isDialogsLoading && dialogUsers.length === 0 && !favoriteUser && (
            <p className={styles.hint}>Диалогов пока нет.</p>
          )}

          {dialogUsers.map((user) => {
            const dialog = dialogs.find((item) => item.userId === user.id);
            const isActive = selectedUser?.id === user.id;
            const presenceLabel = getPresenceLabel(
              user.id,
              currentUserId,
              dialog,
              user
            );
            const presenceOnline = getPresenceOnline(
              user.id,
              currentUserId,
              dialog,
              user
            );
            return (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                className={`${styles.dialogItem} ${isActive ? styles.activeDialog : ""} ${openDialogMenuId === user.id ? styles.dialogItemMenuOpen : ""}`}
                onClick={() => handleSelectUser(user)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelectUser(user);
                  }
                }}
              >
                <UserAvatar
                  className={styles.avatar}
                  name={getDialogTitle(user, currentUserId)}
                  avatarUrl={user.avatarUrl}
                />
                <span className={styles.dialogText}>
                  <span className={styles.dialogName}>
                    {getDialogTitle(user, currentUserId)}
                  </span>
                  {presenceLabel && (
                    <span
                      className={
                        presenceOnline
                          ? styles.presenceOnline
                          : styles.dialogPresence
                      }
                    >
                      {presenceLabel}
                    </span>
                  )}
                  <span className={styles.dialogPreview}>
                    {dialog?.lastMessage.text ?? user.email}
                  </span>
                </span>
                {dialog && dialog.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>
                    {dialog.unreadCount}
                  </span>
                )}
                <span
                  className={styles.dialogActions}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.dialogActionsButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenDialogMenuId((currentId) =>
                        currentId === user.id ? null : user.id
                      );
                    }}
                    title="Действия"
                  >
                    ...
                  </button>
                  {openDialogMenuId === user.id && (
                    <span className={styles.dialogActionsMenu}>
                      <button
                        type="button"
                        onClick={() => void handleDeleteDialog(user)}
                      >
                        Удалить чат
                      </button>
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {isSearching && (
            <>
              <p className={styles.listTitle}>Найденные пользователи</p>

              {searchState.isFetching && (
                <p className={styles.hint}>Поиск...</p>
              )}

              {!searchState.isFetching && searchResultUsers.length === 0 && (
                <p className={styles.hint}>Пользователи не найдены.</p>
              )}

              {searchResultUsers.map((user) => {
                const isActive = selectedUser?.id === user.id;
                const presenceLabel = getPresenceLabel(
                  user.id,
                  currentUserId,
                  undefined,
                  user
                );
                const presenceOnline = getPresenceOnline(
                  user.id,
                  currentUserId,
                  undefined,
                  user
                );
                return (
                  <button
                    key={user.id}
                    type="button"
                    className={`${styles.dialogItem} ${isActive ? styles.activeDialog : ""}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <UserAvatar
                      className={styles.avatar}
                      name={getUserTitle(user)}
                      avatarUrl={user.avatarUrl}
                    />
                    <span className={styles.dialogText}>
                      <span className={styles.dialogName}>
                        {getUserTitle(user)}
                      </span>
                      {presenceLabel ? (
                        <span
                          className={
                            presenceOnline
                              ? styles.presenceOnline
                              : styles.dialogPresence
                          }
                        >
                          {presenceLabel}
                        </span>
                      ) : (
                        <span className={styles.dialogPreview}>
                          {user.email}
                        </span>
                      )}
                    </span>
                    <span className={styles.newChatLabel}>Новый</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </aside>

      <section className={styles.chatPanel}>
        {!selectedUser ? (
          <div className={styles.emptyState}>
            Выберите диалог или найдите пользователя, чтобы написать сообщение.
          </div>
        ) : (
          <>
            <header className={styles.chatHeader}>
              <UserAvatar
                className={styles.avatar}
                name={getDialogTitle(selectedUser, currentUserId)}
                avatarUrl={selectedUser.avatarUrl}
                fallback={
                  selectedUser.id === currentUserId
                    ? "★"
                    : getUserTitle(selectedUser).slice(0, 1).toUpperCase()
                }
              />
              <div>
                <h2>{getDialogTitle(selectedUser, currentUserId)}</h2>
                {selectedUser.id === currentUserId
                  ? selectedUser.email && <p>{selectedUser.email}</p>
                  : (() => {
                      const activeDialog = dialogs.find(
                        (dialog) => dialog.userId === selectedUser.id
                      );
                      const presenceLabel = getPresenceLabel(
                        selectedUser.id,
                        currentUserId,
                        activeDialog,
                        selectedUser,
                        selectedUserPresence
                      );
                      const presenceOnline = getPresenceOnline(
                        selectedUser.id,
                        currentUserId,
                        activeDialog,
                        selectedUser,
                        selectedUserPresence
                      );
                      return presenceLabel ? (
                        <p
                          className={
                            presenceOnline
                              ? styles.presenceOnline
                              : styles.presenceStatus
                          }
                        >
                          {presenceLabel}
                        </p>
                      ) : (
                        selectedUser.email && <p>{selectedUser.email}</p>
                      );
                    })()}
              </div>
            </header>

            <div className={styles.messages}>
              {isMessagesFetching && messages.length === 0 && (
                <p className={styles.hint}>Загрузка сообщений...</p>
              )}

              {!isMessagesFetching && messages.length === 0 && (
                <p className={styles.hint}>Напишите первое сообщение.</p>
              )}

              {messages.map((message) => {
                const isOwn = message.senderId === currentUserId;
                const isFavoriteDialog = selectedUser.id === currentUserId;
                const isEditing = editingMessageId === message.id;
                const readState = getReadState(
                  isOwn,
                  isFavoriteDialog,
                  message.readAt
                );
                return (
                  <div
                    key={message.id}
                    className={`${styles.messageRow} ${isOwn ? styles.ownMessageRow : ""}`}
                  >
                    <div
                      className={`${styles.messageBubble} ${isOwn ? styles.ownMessage : ""}`}
                    >
                      {isEditing ? (
                        <div className={styles.editMessageForm}>
                          <textarea
                            className={styles.editMessageInput}
                            value={editingText}
                            maxLength={4000}
                            autoFocus
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void submitEdit();
                              }
                              if (event.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                          />
                          <div className={styles.editActions}>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={isUpdating}
                            >
                              Отмена
                            </button>
                            <button
                              type="button"
                              onClick={() => void submitEdit()}
                              disabled={isUpdating || !editingText.trim()}
                            >
                              Сохранить
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{message.text}</p>
                      )}
                      <span className={styles.messageMeta}>
                        <span>{formatTime(message.createdAt)}</span>
                        {readState && (
                          <span
                            className={`${styles.readChecks} ${
                              readState === "read" || readState === "saved"
                                ? styles.readChecksRead
                                : ""
                            }`}
                            title={
                              readState === "saved"
                                ? "Сохранено"
                                : readState === "read"
                                  ? "Прочитано"
                                  : "Не прочитано"
                            }
                          >
                            <span />
                            {(readState === "read" ||
                              readState === "saved") && <span />}
                          </span>
                        )}
                        {isOwn && !isEditing && (
                          <span
                            className={styles.messageActions}
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className={styles.messageActionsButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMessageMenuId((currentId) =>
                                  currentId === message.id ? null : message.id
                                );
                              }}
                              title="Действия"
                            >
                              ...
                            </button>
                            {openMessageMenuId === message.id && (
                              <span className={styles.messageActionsMenu}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditing(message.id, message.text)
                                  }
                                >
                                  Редактировать
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteMessage(message.id)
                                  }
                                >
                                  Удалить
                                </button>
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <form className={styles.messageForm} onSubmit={handleSubmit}>
              <textarea
                className={styles.messageInput}
                placeholder="Введите сообщение"
                value={messageText}
                maxLength={4000}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitMessage();
                  }
                }}
              />
              <button
                className={styles.sendButton}
                type="submit"
                disabled={isSending || !messageText.trim()}
              >
                {isSending ? "..." : "Отправить"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
