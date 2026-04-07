import { useState } from "react";
import styles from "./event-modal.module.scss";

interface Props {
  event?: {
    id?: string;
    title: string;
    description?: string;
  } | null;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  onDelete: (id: string) => void;
}

export const EventModal = ({ event, onClose, onSave, onDelete }: Props) => {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave(title, description);
  };

  const handleDelete = () => {
    if (!event?.id) return;

    const confirmDelete = confirm("Удалить событие?");
    if (!confirmDelete) return;

    onDelete(event.id);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{event ? "Редактировать событие" : "Создать событие"}</h2>

        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles.actions}>
          <button onClick={onClose}>Отмена</button>

          {event && (
            <button onClick={handleDelete} style={{ color: "red" }}>
              Удалить
            </button>
          )}

          <button onClick={handleSubmit}>
            {event ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};
