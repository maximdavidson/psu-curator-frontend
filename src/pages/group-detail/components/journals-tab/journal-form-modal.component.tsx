/* eslint-disable */
import { useEffect, useState } from "react";
import styles from "./journals-tab.module.scss";
import type { GroupJournalListItem } from "../../groupJournals.api";

interface JournalFormValues {
  title: string;
  startDate: string;
  endDate: string;
}

interface Props {
  journal?: GroupJournalListItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: JournalFormValues) => Promise<void>;
}

const toDateInput = (value?: string): string => {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
};

const defaultEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 6);
  return date.toISOString().slice(0, 10);
};

export const JournalFormModal = ({
  journal,
  isSubmitting,
  onClose,
  onSubmit
}: Props) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(toDateInput());
  const [endDate, setEndDate] = useState(defaultEndDate());
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(journal?.title ?? "");
    setStartDate(toDateInput(journal?.startDate));
    setEndDate(
      journal?.endDate ? toDateInput(journal.endDate) : defaultEndDate()
    );
    setError("");
  }, [journal]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Введите название журнала.");
      return;
    }

    if (endDate < startDate) {
      setError("Дата окончания не может быть раньше даты начала.");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        startDate,
        endDate
      });
    } catch {
      setError("Не удалось сохранить журнал.");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.modalHeader}>
          <h3>
            {journal ? "Редактировать журнал" : "Новый журнал посещаемости"}
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <label className={styles.field}>
          <span>Название</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Посещаемость за май"
          />
        </label>

        <div className={styles.dateGrid}>
          <label className={styles.field}>
            <span>Начало</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Окончание</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
};
