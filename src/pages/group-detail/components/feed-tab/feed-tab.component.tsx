import { useState } from "react";
import styles from "./feed-tab.module.scss";
import { EventFormModal } from "./event-form-modal/event-form-modal.component";

interface FeedItem {
  id: string;
  type: "message" | "poll" | "document";
  title: string;
  description?: string;
  author: string;
  createdAt: Date;
  pollId?: string;
  documentId?: string;
}

export const FeedTab = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddFeedItem = (item: Omit<FeedItem, "id" | "createdAt">) => {
    const newItem: FeedItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setFeed([newItem, ...feed]);
    setIsModalOpen(false);
  };

  return (
    <div className={styles.feedTab}>
      <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
        Добавить запись
      </button>

      <div className={styles.feedList}>
        {feed.length === 0 && <p>Лента пока пуста</p>}

        {feed.map((item) => (
          <div key={item.id} className={styles.feedItem}>
            <div className={styles.header}>
              <b>{item.title}</b>
              <span>{item.author}</span>
              <span>{item.createdAt.toLocaleString()}</span>
            </div>

            {/* Описание для сообщений и произвольного текста */}
            {item.description && (
              <div className={styles.description}>{item.description}</div>
            )}

            {/* Дополнительная информация для опросов */}
            {item.type === "poll" && (
              <div className={styles.meta}>
                📊 Выбран опрос: {item.pollId || "не указан"}
              </div>
            )}

            {/* Дополнительная информация для документов */}
            {item.type === "document" && (
              <div className={styles.meta}>
                📄 Выбран документ: {item.documentId || "не указан"}
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <EventFormModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleAddFeedItem}
        />
      )}
    </div>
  );
};
