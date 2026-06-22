import styles from "./feed-tab.module.scss";
import { EventFormModal } from "./event-form-modal/event-form-modal.component";
import { useState } from "react";
import {
  useCreateFeedItemMutation,
  useDeleteFeedItemMutation,
  useUpdateFeedItemMutation,
  useAddFeedItemCommentMutation,
  useUpdateFeedItemCommentMutation,
  useDeleteFeedItemCommentMutation,
  FeedItemType
} from "../../groupFeed.api";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
import type { FeedItemComment } from "@/pages/groups/group.api";
import { useLazyDownloadFileQuery } from "@/pages/documents/documents.api";
import { useGetUserFilesQuery } from "@/pages/documents/documents.api";
import type { FeedItem } from "@/pages/groups/group.api";
import { SurveyViewModal } from "./survey-view-modal/survey-view-modal.component";
import { useConfirm } from "@/shared/ui/confirm-dialog";
interface Props {
  groupId: string;
  feed: FeedItem[];
  onRefetch: () => void;
  canCreate: boolean;
}
const getInitials = (name: string): string => {
  const n = name?.trim() || "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const getFileIcon = (contentType: string): string => {
  if (contentType.startsWith("image/")) return "🖼️";
  if (contentType === "application/pdf") return "📕";
  if (contentType.includes("word") || contentType.includes("document"))
    return "📝";
  if (contentType.includes("text/")) return "📃";
  return "📄";
};
type FeedKind = "message" | "poll" | "document";
const getFeedKind = (
  item: FeedItem
): {
  kind: FeedKind;
  label: string;
} => {
  const t = item.type;
  if ((item.attachments?.length ?? 0) > 0 || t === FeedItemType.Document) {
    return { kind: "document", label: "Документ" };
  }
  if (t === FeedItemType.Poll || item.surveyId) {
    return { kind: "poll", label: "Опрос" };
  }
  return { kind: "message", label: "Сообщение" };
};
const editContentTypeFromItem = (
  item: FeedItem
): "message" | "poll" | "file" => {
  const k = getFeedKind(item).kind;
  if (k === "document") return "file";
  if (k === "poll") return "poll";
  return "message";
};
export const FeedTab = ({ groupId, feed, onRefetch, canCreate }: Props) => {
  const [createFeedItem] = useCreateFeedItemMutation();
  const [updateFeedItem] = useUpdateFeedItemMutation();
  const [deleteFeedItem] = useDeleteFeedItemMutation();
  const [addFeedItemComment] = useAddFeedItemCommentMutation();
  const [updateFeedItemComment] = useUpdateFeedItemCommentMutation();
  const [deleteFeedItemComment] = useDeleteFeedItemCommentMutation();
  const { confirm } = useConfirm();
  const currentUserId =
    getUserIdFromAccessToken(localStorage.getItem("token")) ?? "";
  const [downloadFile] = useLazyDownloadFileQuery();
  const { data: userFilesData } = useGetUserFilesQuery();
  const userFiles = userFilesData?.files ?? [];
  const [feedActionError, setFeedActionError] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>(
    {}
  );
  const [postingCommentForId, setPostingCommentForId] = useState<string | null>(
    null
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedItem | null>(null);
  const [viewingSurveyId, setViewingSurveyId] = useState<string | null>(null);
  const buildAttachmentFilesFromLibrary = async (
    fileIds: string[]
  ): Promise<File[]> => {
    const token = localStorage.getItem("token");
    const files: File[] = [];
    for (const fileId of fileIds) {
      const meta = userFiles.find((f) => f.id === fileId);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/Files/download/${fileId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      if (!res.ok) {
        throw new Error(`download ${fileId}`);
      }
      const blob = await res.blob();
      const name = meta?.fileName ?? "вложение";
      const ctype =
        meta?.contentType || blob.type || "application/octet-stream";
      files.push(new File([blob], name, { type: ctype }));
    }
    return files;
  };
  const handleCreate = async (item: {
    title: string;
    description?: string;
    contentType: "message" | "poll" | "file";
    selectedFileIds?: string[];
    selectedSurveyId?: string;
  }) => {
    setFeedActionError(null);
    try {
      let feedType: FeedItemType = FeedItemType.Message;
      if (item.contentType === "file") feedType = FeedItemType.Document;
      if (item.contentType === "poll") feedType = FeedItemType.Poll;
      let attachmentFiles: File[] | undefined;
      if (item.contentType === "file" && item.selectedFileIds?.length) {
        attachmentFiles = await buildAttachmentFilesFromLibrary(
          item.selectedFileIds
        );
      }
      await createFeedItem({
        title: item.title,
        description: item.description ?? "",
        type: feedType,
        groupId,
        surveyId:
          item.contentType === "poll" ? item.selectedSurveyId : undefined,
        attachmentFiles
      }).unwrap();
      await onRefetch();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Ошибка создания:", err);
      setFeedActionError(
        "Не удалось создать запись. Проверьте вложения и доступ к файлам."
      );
      throw err;
    }
  };
  const handleUpdate = async (item: {
    title: string;
    description?: string;
    contentType: "message" | "poll" | "file";
    selectedFileIds?: string[];
    selectedSurveyId?: string;
  }) => {
    if (!editingItem) return;
    setFeedActionError(null);
    try {
      let feedType: FeedItemType = FeedItemType.Message;
      if (item.contentType === "file") feedType = FeedItemType.Document;
      if (item.contentType === "poll") feedType = FeedItemType.Poll;
      const surveyId =
        item.contentType === "poll" ? (item.selectedSurveyId ?? null) : null;
      const documentId =
        item.contentType === "file"
          ? (item.selectedFileIds?.[0] ??
            editingItem.attachments?.[0]?.id ??
            null)
          : null;
      await updateFeedItem({
        id: editingItem.id,
        body: {
          title: item.title,
          description: item.description ?? "",
          type: feedType,
          groupId,
          surveyId,
          documentId
        }
      }).unwrap();
      await onRefetch();
      setEditingItem(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Ошибка обновления:", err);
      setFeedActionError("Не удалось сохранить изменения.");
      throw err;
    }
  };
  const handleDelete = async (feedItemId: string) => {
    const confirmed = await confirm({
      title: "Удалить запись",
      message: "Удалить запись из ленты группы?",
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await deleteFeedItem({
        id: feedItemId,
        groupId
      }).unwrap();
      onRefetch();
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };
  const handleEditClick = (item: FeedItem) => {
    setFeedActionError(null);
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleSubmitComment = async (feedItemId: string) => {
    const text = (commentTexts[feedItemId] ?? "").trim();
    if (!text) return;
    setCommentErrors((prev) => {
      const next = { ...prev };
      delete next[feedItemId];
      return next;
    });
    setPostingCommentForId(feedItemId);
    try {
      await addFeedItemComment({ feedItemId, groupId, text }).unwrap();
      setCommentTexts((prev) => ({ ...prev, [feedItemId]: "" }));
      await onRefetch();
    } catch {
      setCommentErrors((prev) => ({
        ...prev,
        [feedItemId]: "Не удалось отправить комментарий."
      }));
    } finally {
      setPostingCommentForId(null);
    }
  };
  const startEditingComment = (comment: FeedItemComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };
  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };
  const handleSaveComment = async (commentId: string) => {
    const text = editingCommentText.trim();
    if (!text) {
      return;
    }
    setSavingCommentId(commentId);
    try {
      await updateFeedItemComment({ commentId, groupId, text }).unwrap();
      cancelEditingComment();
      await onRefetch();
    } catch {
      setFeedActionError("Не удалось сохранить комментарий.");
    } finally {
      setSavingCommentId(null);
    }
  };
  const handleDeleteComment = async (commentId: string) => {
    const confirmed = await confirm({
      title: "Удалить комментарий",
      message: "Удалить комментарий?",
      variant: "danger"
    });
    if (!confirmed) {
      return;
    }
    setDeletingCommentId(commentId);
    try {
      await deleteFeedItemComment({ commentId, groupId }).unwrap();
      if (editingCommentId === commentId) {
        cancelEditingComment();
      }
      await onRefetch();
    } catch {
      setFeedActionError("Не удалось удалить комментарий.");
    } finally {
      setDeletingCommentId(null);
    }
  };
  const handleModalClose = () => {
    setFeedActionError(null);
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleOpenCreateModal = () => {
    setFeedActionError(null);
    setEditingItem(null);
    setIsModalOpen(true);
  };
  const handleFileDownload = async (file: {
    id: string;
    fileName: string;
    contentType: string;
  }) => {
    try {
      const result = await downloadFile(file.id).unwrap();
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Ошибка скачивания:", err);
    }
  };
  return (
    <div className={styles.feedTab}>
      {canCreate && (
        <button className={styles.addButton} onClick={handleOpenCreateModal}>
          + Добавить запись
        </button>
      )}

      {feedActionError && (
        <div className={styles.feedActionError} role="alert">
          {feedActionError}
        </div>
      )}

      <div className={styles.feedList}>
        {feed.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Лента пока пуста</p>
            <p className={styles.emptySubtext}>
              Создайте первую запись, чтобы начать общение
            </p>
          </div>
        )}

        {feed.map((item) => {
          const { kind, label } = getFeedKind(item);
          return (
            <div key={item.id} className={styles.feedItem}>
              <div className={styles.feedItemHeader}>
                <div className={styles.avatar}>
                  {getInitials(item.authorName)}
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{item.authorName}</div>
                  <div className={styles.date}>
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>

              <div className={styles.feedItemMeta}>
                <span className={styles.kindBadge} data-kind={kind}>
                  {label}
                </span>
              </div>

              <div className={styles.feedItemContent}>
                <h3 className={styles.title}>{item.title}</h3>
                {item.description?.trim() ? (
                  <p className={styles.description}>{item.description}</p>
                ) : null}

                {item.surveyId && (
                  <div className={styles.pollActions}>
                    {item.surveyTitle && (
                      <p className={styles.pollSurveyTitle}>
                        {item.surveyTitle}
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.pollLinkButton}
                      onClick={() => setViewingSurveyId(item.surveyId!)}
                    >
                      Пройти опрос
                    </button>
                  </div>
                )}

                {item.attachments && item.attachments.length > 0 && (
                  <div className={styles.attachments}>
                    <div className={styles.attachmentsLabel}>Файлы</div>
                    {item.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={styles.attachmentBadge}
                        onClick={() => handleFileDownload(attachment)}
                        title={`Скачать ${attachment.fileName}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            void handleFileDownload(attachment);
                          }
                        }}
                      >
                        <span className={styles.attachmentIcon}>
                          {getFileIcon(attachment.contentType)}
                        </span>
                        <span className={styles.attachmentName}>
                          {attachment.fileName}
                        </span>
                        <span className={styles.attachmentSize}>
                          {formatFileSize(attachment.fileSize)}
                        </span>
                        <span className={styles.downloadIcon}>↓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.commentsSection}>
                <h4 className={styles.commentsTitle}>Комментарии</h4>
                {(item.comments?.length ?? 0) === 0 ? (
                  <p className={styles.emptyComments}>
                    Пока нет комментариев — ответьте куратору или группе.
                  </p>
                ) : (
                  <div className={styles.commentList}>
                    {item.comments!.map((c) => {
                      const isOwnComment = c.authorId === currentUserId;
                      const isEditing = editingCommentId === c.id;
                      return (
                        <div key={c.id} className={styles.commentRow}>
                          <div className={styles.commentMeta}>
                            <span className={styles.commentAuthor}>
                              {c.authorName}
                            </span>
                            <span className={styles.commentDate}>
                              {formatDate(c.createdAt)}
                            </span>
                            {isOwnComment && !isEditing && (
                              <span className={styles.commentActions}>
                                <button
                                  type="button"
                                  className={styles.commentActionButton}
                                  onClick={() => startEditingComment(c)}
                                  disabled={
                                    deletingCommentId === c.id ||
                                    savingCommentId === c.id
                                  }
                                >
                                  Изменить
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.commentActionButton} ${styles.commentDeleteButton}`}
                                  onClick={() => void handleDeleteComment(c.id)}
                                  disabled={
                                    deletingCommentId === c.id ||
                                    savingCommentId === c.id
                                  }
                                >
                                  {deletingCommentId === c.id
                                    ? "Удаление…"
                                    : "Удалить"}
                                </button>
                              </span>
                            )}
                          </div>
                          {isEditing ? (
                            <div className={styles.commentEditForm}>
                              <textarea
                                className={styles.commentTextarea}
                                value={editingCommentText}
                                maxLength={2000}
                                aria-label="Редактирование комментария"
                                onChange={(e) =>
                                  setEditingCommentText(e.target.value)
                                }
                              />
                              <div className={styles.commentEditActions}>
                                <button
                                  type="button"
                                  className={styles.commentCancelButton}
                                  onClick={cancelEditingComment}
                                  disabled={savingCommentId === c.id}
                                >
                                  Отмена
                                </button>
                                <button
                                  type="button"
                                  className={styles.commentSubmit}
                                  disabled={
                                    savingCommentId === c.id ||
                                    !editingCommentText.trim()
                                  }
                                  onClick={() => void handleSaveComment(c.id)}
                                >
                                  {savingCommentId === c.id
                                    ? "Сохранение…"
                                    : "Сохранить"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className={styles.commentText}>{c.text}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className={styles.commentForm}>
                  {commentErrors[item.id] && (
                    <p className={styles.commentError} role="alert">
                      {commentErrors[item.id]}
                    </p>
                  )}
                  <textarea
                    className={styles.commentTextarea}
                    placeholder="Написать комментарий…"
                    value={commentTexts[item.id] ?? ""}
                    maxLength={2000}
                    aria-label="Текст комментария"
                    onChange={(e) => {
                      const v = e.target.value;
                      setCommentTexts((prev) => ({ ...prev, [item.id]: v }));
                      if (commentErrors[item.id]) {
                        setCommentErrors((prev) => {
                          const next = { ...prev };
                          delete next[item.id];
                          return next;
                        });
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.commentSubmit}
                    disabled={
                      postingCommentForId === item.id ||
                      !(commentTexts[item.id] ?? "").trim()
                    }
                    onClick={() => void handleSubmitComment(item.id)}
                  >
                    {postingCommentForId === item.id
                      ? "Отправка…"
                      : "Отправить"}
                  </button>
                </div>
              </div>

              {canCreate && (
                <div className={styles.feedItemActions}>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleEditClick(item)}
                  >
                    Редактировать
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => void handleDelete(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <EventFormModal
          key={editingItem ? editingItem.id : "create"}
          onClose={handleModalClose}
          onCreate={editingItem ? handleUpdate : handleCreate}
          initialData={
            editingItem
              ? {
                  title: editingItem.title,
                  description: editingItem.description || "",
                  contentType: editContentTypeFromItem(editingItem),
                  selectedSurveyId: editingItem.surveyId ?? null,
                  selectedFileId: editingItem.attachments?.[0]?.id ?? null
                }
              : undefined
          }
          mode={editingItem ? "edit" : "create"}
        />
      )}

      {viewingSurveyId && (
        <SurveyViewModal
          isOpen={!!viewingSurveyId}
          surveyId={viewingSurveyId}
          onClose={() => setViewingSurveyId(null)}
        />
      )}
    </div>
  );
};
