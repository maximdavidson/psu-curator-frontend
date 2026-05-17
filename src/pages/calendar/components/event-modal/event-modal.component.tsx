import { useEffect, useMemo, useState } from "react";
import styles from "./event-modal.module.scss";
import {
  useLazySearchUsersByNameQuery,
  type UserFullName
} from "@/services/user.api";

const MIN_QUERY_LEN = 2;

interface Props {
  event?: {
    id?: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    isCreator?: boolean;
  } | null;
  slot?: {
    start: Date;
    end: Date;
  } | null;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    emails: string[],
    start: Date,
    end: Date
  ) => void;
  onDelete: (id: string) => void;
}

const toDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInput = (date: Date): string => date.toTimeString().slice(0, 5);

const buildDateTime = (date: string, time: string): Date =>
  new Date(`${date}T${time || "00:00"}`);

export const EventModal = ({
  event,
  slot,
  onClose,
  onSave,
  onDelete
}: Props) => {
  const initialStart = event?.start ?? slot?.start ?? new Date();
  const initialEnd =
    event?.end ??
    slot?.end ??
    new Date(initialStart.getTime() + 60 * 60 * 1000);
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState(toDateInput(initialStart));
  const [startTime, setStartTime] = useState(toTimeInput(initialStart));
  const [endTime, setEndTime] = useState(toTimeInput(initialEnd));
  const [error, setError] = useState<string | null>(null);
  const [inviteQuery, setInviteQuery] = useState("");
  const [debouncedInviteQuery, setDebouncedInviteQuery] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState<UserFullName[]>([]);
  const [searchUsers, searchState] = useLazySearchUsersByNameQuery();

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedInviteQuery(inviteQuery.trim()),
      350
    );
    return () => window.clearTimeout(timeout);
  }, [inviteQuery]);

  useEffect(() => {
    if (event || debouncedInviteQuery.length < MIN_QUERY_LEN) return;
    void searchUsers(debouncedInviteQuery, true);
  }, [debouncedInviteQuery, event, searchUsers]);

  const selectedEmails = useMemo(
    () => new Set(selectedInvitees.map((user) => user.email).filter(Boolean)),
    [selectedInvitees]
  );

  const suggestedInvitees = (searchState.data ?? []).filter(
    (user) => user.email && !selectedEmails.has(user.email)
  );

  const showSuggestions =
    !event &&
    debouncedInviteQuery.length >= MIN_QUERY_LEN &&
    !searchState.isFetching;

  const handleAddInvitee = (user: UserFullName) => {
    if (!user.email || selectedEmails.has(user.email)) return;
    setSelectedInvitees((current) => [...current, user]);
    setInviteQuery("");
    setDebouncedInviteQuery("");
  };

  const handleRemoveInvitee = (email: string | null) => {
    if (!email) return;
    setSelectedInvitees((current) =>
      current.filter((user) => user.email !== email)
    );
  };

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) return;

    const start = buildDateTime(date, startTime);
    const end = buildDateTime(date, endTime);

    if (end <= start) {
      setError("Время окончания должно быть позже времени начала.");
      return;
    }

    const parsedEmails = selectedInvitees
      .map((user) => user.email)
      .filter((email): email is string => Boolean(email));

    onSave(title, description, parsedEmails, start, end);
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

        <div className={styles.timeGrid}>
          <label>
            Дата
            <input
              className={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Начало
            <input
              className={styles.input}
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label>
            Окончание
            <input
              className={styles.input}
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
        </div>

        {!event && (
          <div className={styles.inviteBlock}>
            <label className={styles.inviteLabel} htmlFor="event-invite-search">
              Участники
            </label>

            {selectedInvitees.length > 0 && (
              <div className={styles.inviteChips}>
                {selectedInvitees.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={styles.inviteChip}
                    onClick={() => handleRemoveInvitee(user.email)}
                  >
                    {user.fullName?.trim() || user.email}
                    <span>{user.email}</span>
                  </button>
                ))}
              </div>
            )}

            <input
              id="event-invite-search"
              className={styles.input}
              type="search"
              autoComplete="off"
              placeholder="Начните вводить имя или email"
              value={inviteQuery}
              onChange={(e) => setInviteQuery(e.target.value)}
            />

            {searchState.isFetching &&
              debouncedInviteQuery.length >= MIN_QUERY_LEN && (
                <p className={styles.loadingText}>Поиск…</p>
              )}

            {showSuggestions && suggestedInvitees.length === 0 && (
              <p className={styles.noResults}>Пользователи не найдены.</p>
            )}

            {showSuggestions && suggestedInvitees.length > 0 && (
              <div className={styles.suggestions}>
                {suggestedInvitees.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={styles.suggestionRow}
                    onClick={() => handleAddInvitee(user)}
                  >
                    <span>{user.fullName?.trim() || "Без имени"}</span>
                    <small>{user.email}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {event && !event.isCreator && (
          <p className={styles.hint}>
            Вы приглашены на это событие. Редактирование доступно только автору.
          </p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>

          {event?.id && event.isCreator && (
            <button onClick={handleDelete} className={styles.deleteButton}>
              Удалить
            </button>
          )}

          <button
            onClick={handleSubmit}
            className={styles.submitButton}
            disabled={Boolean(event && !event.isCreator)}
          >
            {event ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};
