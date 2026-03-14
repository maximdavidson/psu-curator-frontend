import { useState } from "react";
import styles from "./event-modal.module.scss";

interface EventData {
  title: string;
  description: string;
}

interface Props {
  event?: EventData | null;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export const EventModal = ({ event, onClose, onSave }: Props) => {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave(title, description);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{event ? "Редактировать событие" : "Создать событие"}</h2>

        <input
          className={styles.input}
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={styles.textarea}
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles.actions}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSubmit}>
            {event ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};
