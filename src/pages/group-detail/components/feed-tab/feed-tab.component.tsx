import styles from "./feed-tab.module.scss";
import { EventFormModal } from "./event-form-modal/event-form-modal.component";
import { useState } from "react";
import {
  useCreateFeedItemMutation,
  useDeleteFeedItemMutation,
  useUpdateFeedItemMutation,
  FeedItemType
} from "../../groupFeed.api";
import { useLazyDownloadFileQuery } from "@/pages/documents/documents.api";
import { useGetUserFilesQuery } from "@/pages/documents/documents.api";
import type { FeedItem } from "@/pages/groups/group.api";
import { SurveyViewModal } from "./survey-view-modal/survey-view-modal.component";

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

const getFeedKind = (item: FeedItem): { kind: FeedKind; label: string } => {
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
  const [downloadFile] = useLazyDownloadFileQuery();
  const { data: userFiles = [] } = useGetUserFilesQuery();

  const [feedActionError, setFeedActionError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedItem | null>(null);

  // Для просмотра опроса
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
    if (!confirm("Удалить запись?")) return;

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
