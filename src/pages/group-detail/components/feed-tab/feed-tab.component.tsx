import styles from "./feed-tab.module.scss";
import { EventFormModal } from "./event-form-modal/event-form-modal.component";
import { useState } from "react";
import {
  useDeleteFeedItemMutation,
  useUpdateFeedItemMutation,
  FeedItemType
} from "../../groupFeed.api";
import { useLazyDownloadFileQuery } from "@/pages/documents/documents.api";
import type { FeedItem } from "@/pages/groups/group.api";
import { SurveyViewModal } from "./survey-view-modal/survey-view-modal.component";

interface Props {
  groupId: string;
  feed: FeedItem[];
  onRefetch: () => void;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
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

export const FeedTab = ({ groupId, feed, onRefetch }: Props) => {
  const [updateFeedItem] = useUpdateFeedItemMutation();
  const [deleteFeedItem] = useDeleteFeedItemMutation();
  const [downloadFile] = useLazyDownloadFileQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedItem | null>(null);

  // Для просмотра опроса
  const [viewingSurveyId, setViewingSurveyId] = useState<string | null>(null);

  const handleCreate = async (item: {
    title: string;
    description?: string;
    contentType: "message" | "poll" | "file";
    selectedFileIds?: string[];
    selectedSurveyId?: string;
  }) => {
    try {
      let feedType: FeedItemType = FeedItemType.Message;
      if (item.contentType === "file") feedType = FeedItemType.Document;
      if (item.contentType === "poll") feedType = FeedItemType.Poll;

      const formData = new FormData();
      formData.append("Title", item.title);
      formData.append("Description", item.description || "");
      formData.append("Type", feedType.toString());
      formData.append("GroupId", groupId);
      formData.append("SurveyId", item.selectedSurveyId || "");
      formData.append("DocumentId", item.selectedFileIds?.[0] || "");
      formData.append("Attachments", "");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/GroupFeedItem`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка создания записи");
      }

      onRefetch();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Ошибка создания:", err);
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

    try {
      let feedType: FeedItemType = FeedItemType.Message;
      if (item.contentType === "file") feedType = FeedItemType.Document;
      if (item.contentType === "poll") feedType = FeedItemType.Poll;

      await updateFeedItem({
        id: editingItem.id,
        body: {
          title: item.title,
          description: item.description || "",
          type: feedType,
          groupId,
          surveyId: item.selectedSurveyId || ""
        }
      }).unwrap();

      onRefetch();
      setEditingItem(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Ошибка обновления:", err);
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
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
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

  const getItemTypeLabel = (item: FeedItem): string => {
    if (item.attachments && item.attachments.length > 0) return "📎";
    return "";
  };

  return (
    <div className={styles.feedTab}>
      <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
        + Добавить запись
      </button>

      <div className={styles.feedList}>
        {feed.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Лента пока пуста</p>
            <p className={styles.emptySubtext}>
              Создайте первую запись, чтобы начать общение
            </p>
          </div>
        )}

        {feed.map((item) => (
          <div key={item.id} className={styles.feedItem}>
            <div className={styles.feedItemHeader}>
              <div className={styles.avatar}>
                {getInitials(item.authorName)}
              </div>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>
                  {getItemTypeLabel(item)} {item.authorName}
                </div>
                <div className={styles.date}>{formatDate(item.createdAt)}</div>
              </div>
            </div>

            <div className={styles.feedItemContent}>
              <h3 className={styles.title}>{item.title}</h3>
              {item.description && (
                <p className={styles.description}>{item.description}</p>
              )}

              {item.attachments && item.attachments.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.attachmentsLabel}>
                    Прикреплённые файлы:
                  </div>
                  {item.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={styles.attachmentBadge}
                      onClick={() => handleFileDownload(attachment)}
                      title={`Скачать ${attachment.fileName}`}
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

            <div className={styles.feedItemActions}>
              <button
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={() => handleEditClick(item)}
              >
                Редактировать
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => handleDelete(item.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
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
                  description: editingItem.description || ""
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
