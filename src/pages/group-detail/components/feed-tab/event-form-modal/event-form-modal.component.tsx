import { useState } from "react";
import styles from "./event-form-modal.module.scss";

interface Props {
  onClose: () => void;
  onCreate: (item: {
    type: "message" | "poll" | "document";
    title: string;
    description?: string;
    author: string;
    pollId?: string;
    documentId?: string;
  }) => void;
}

// Плейсхолдеры — в будущем будем получать с бэка
const mockPolls = [
  { id: "poll1", title: "Опрос 1" },
  { id: "poll2", title: "Опрос 2" }
];

const mockDocuments = [
  { id: "doc1", title: "Документ 1" },
  { id: "doc2", title: "Документ 2" }
];

export const EventFormModal = ({ onClose, onCreate }: Props) => {
  const [type, setType] = useState<"message" | "poll" | "document">("message");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPoll, setSelectedPoll] = useState<string | undefined>(
    undefined
  );
  const [selectedDocument, setSelectedDocument] = useState<string | undefined>(
    undefined
  );

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (type === "poll" && !selectedPoll) return;
    if (type === "document" && !selectedDocument) return;

    onCreate({
      type,
      title,
      description,
      author: "Вы",
      pollId: selectedPoll,
      documentId: selectedDocument
    });

    // Сброс полей
    setTitle("");
    setDescription("");
    setSelectedPoll(undefined);
    setSelectedDocument(undefined);
    setType("message");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Создать запись</h2>

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as "message" | "poll" | "document")
          }
        >
          <option value="message">Сообщение</option>
          <option value="poll">Опрос</option>
          <option value="document">Документ</option>
        </select>

        {/* Заголовок и описание остаются для всех типов */}
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Выбор опроса */}
        {type === "poll" && (
          <select
            value={selectedPoll}
            onChange={(e) => setSelectedPoll(e.target.value)}
          >
            <option value="">Выберите опрос</option>
            {mockPolls.map((poll) => (
              <option key={poll.id} value={poll.id}>
                {poll.title}
              </option>
            ))}
          </select>
        )}

        {/* Выбор документа */}
        {type === "document" && (
          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
          >
            <option value="">Выберите документ</option>
            {mockDocuments.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
        )}

        <div className={styles.actions}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSubmit}>Создать</button>
        </div>
      </div>
    </div>
  );
};
