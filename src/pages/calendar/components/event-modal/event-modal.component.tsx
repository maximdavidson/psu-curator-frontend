import { useState } from "react";
import styles from "./event-modal.module.scss";

interface Props {
  event?: {
    id?: string;
    title: string;
    description?: string;
  } | null;
  onClose: () => void;
  onSave: (title: string, description: string, emails: string[]) => void;
  onDelete: (id: string) => void;
}

export const EventModal = ({ event, onClose, onSave, onDelete }: Props) => {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [emails, setEmails] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const parsedEmails = emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    onSave(title, description, parsedEmails);
  };

  const handleDelete = () => {
    if (!event?.id) return;

    const confirmDelete = confirm("Удалить событие?");
    if (!confirmDelete) return;

    onDelete(event.id);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {event ? "Редактирование события" : "Создание события"}
        </h2>

        <input
          className={styles.input}
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={styles.textarea}
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {!event && (
          <input
            className={styles.input}
            placeholder="Emails через запятую"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
        )}

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>

          {event && (
            <button onClick={handleDelete} className={styles.deleteButton}>
              Удалить
            </button>
          )}

          <button onClick={handleSubmit} className={styles.submitButton}>
            {event ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};
