import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./event-modal.module.scss";
import {
  useLazySearchUsersByNameQuery,
  type UserFullName
} from "@/services/user.api";
import { useGetGroupsQuery } from "@/pages/groups/group.api";
import type { CalendarEventInvitedUser } from "@/services/calendar.api";
import { useGetEventTypesQuery } from "@/services/calendarEventType.api";
import { EventAttendanceReport } from "./event-attendance-report.component";
import { selectToken } from "@/stores/auth.store";
import {
  getRoleStringFromAccessToken,
  roleCanViewEventAttendance
} from "@/shared/lib/jwt-claims";
const MIN_QUERY_LEN = 2;
interface Props {
  event?: {
    id?: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    eventTypeId?: string | null;
    eventTypeName?: string | null;
    isCreator?: boolean;
    isAccepted?: boolean;
    invitedUsers: CalendarEventInvitedUser[];
  } | null;
  slot?: {
    start: Date;
    end: Date;
  } | null;
  canInviteParticipants: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    users: CalendarEventInvitedUser[],
    groupIds: string[],
    start: Date,
    end: Date,
    eventTypeId?: string | null
  ) => void;
  onDelete: (id: string) => void;
  onAccept: (id: string) => void;
  isAccepting?: boolean;
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
  canInviteParticipants,
  onClose,
  onSave,
  onDelete,
  onAccept,
  isAccepting = false
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
  const [eventTypeId, setEventTypeId] = useState(event?.eventTypeId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [inviteQuery, setInviteQuery] = useState("");
  const [debouncedInviteQuery, setDebouncedInviteQuery] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState<
    CalendarEventInvitedUser[]
  >(event?.invitedUsers ?? []);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [searchUsers, searchState] = useLazySearchUsersByNameQuery();
  const { data: groups = [] } = useGetGroupsQuery();
  const { data: eventTypes = [] } = useGetEventTypesQuery();
  const token = useSelector(selectToken);
  const canViewAttendance = roleCanViewEventAttendance(
    getRoleStringFromAccessToken(token)
  );
  const canEditParticipants =
    canInviteParticipants && (!event || Boolean(event.isCreator));
  const canAcceptInvitation =
    Boolean(event?.id) && !event?.isCreator && !event?.isAccepted;
  const invitationAccepted =
    Boolean(event?.id) && !event?.isCreator && Boolean(event?.isAccepted);
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedInviteQuery(inviteQuery.trim()),
      350
    );
    return () => window.clearTimeout(timeout);
  }, [inviteQuery]);
  useEffect(() => {
    if (!canEditParticipants || debouncedInviteQuery.length < MIN_QUERY_LEN)
      return;
    void searchUsers(debouncedInviteQuery, true);
  }, [canEditParticipants, debouncedInviteQuery, searchUsers]);
  const selectedUserIds = useMemo(
    () => new Set(selectedInvitees.map((user) => user.id)),
    [selectedInvitees]
  );
  const suggestedInvitees = (searchState.data ?? []).filter(
    (user) => user.email && !selectedUserIds.has(user.id)
  );
  const showSuggestions =
    canEditParticipants &&
    debouncedInviteQuery.length >= MIN_QUERY_LEN &&
    !searchState.isFetching;
  const handleAddInvitee = (user: UserFullName) => {
    if (!user.email || selectedUserIds.has(user.id)) return;
    const email = user.email;
    setSelectedInvitees((current) => [
      ...current,
      {
        id: user.id,
        fullName: user.fullName ?? "",
        email
      }
    ]);
    setInviteQuery("");
    setDebouncedInviteQuery("");
  };
  const handleRemoveInvitee = (id: string) => {
    setSelectedInvitees((current) => current.filter((user) => user.id !== id));
  };
  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId]
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
    onSave(
      title,
      description,
      selectedInvitees,
      selectedGroupIds,
      start,
      end,
      eventTypeId || null
    );
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

        <label className={styles.fieldLabel}>
          Тип события
          <select
            className={styles.input}
            value={eventTypeId}
            onChange={(e) => setEventTypeId(e.target.value)}
          >
            <option value="">Без типа</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

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

        {canEditParticipants && (
          <div className={styles.inviteBlock}>
            <label className={styles.inviteLabel} htmlFor="event-invite-search">
              Участники
            </label>

            {selectedInvitees.length > 0 && (
              <div className={styles.inviteChips}>
                {selectedInvitees.map((user) => (
                  <div key={user.id} className={styles.inviteChip}>
                    <div>
                      {user.fullName?.trim() || user.email}
                      <span>
                        {user.email}
                        {event?.isCreator && (
                          <>
                            {" "}
                            · {user.isAccepted ? "принял(а)" : "ожидает ответа"}
                          </>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.inviteChipRemove}
                      aria-label="Удалить участника"
                      onClick={() => handleRemoveInvitee(user.id)}
                    >
                      ×
                    </button>
                  </div>
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

            {groups.length > 0 && (
              <div className={styles.groupInviteBlock}>
                <p className={styles.groupInviteTitle}>Пригласить группу</p>
                <div className={styles.groupInviteList}>
                  {groups.map((group) => (
                    <label key={group.id} className={styles.groupInviteOption}>
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(group.id)}
                        onChange={() => handleToggleGroup(group.id)}
                      />
                      <span>
                        {group.name}
                        <small>{group.faculty}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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

        {canAcceptInvitation && (
          <div className={styles.invitationActions}>
            <p className={styles.hint}>
              Вас пригласили на это событие. Примите приглашение, чтобы
              подтвердить участие.
            </p>
            <button
              type="button"
              className={styles.acceptButton}
              disabled={isAccepting}
              onClick={() => event?.id && onAccept(event.id)}
            >
              {isAccepting ? "Принимаем…" : "Принять приглашение"}
            </button>
          </div>
        )}

        {invitationAccepted && (
          <p className={styles.acceptedBadge}>
            Вы приняли приглашение на это событие.
          </p>
        )}

        {event?.id && canViewAttendance && (
          <EventAttendanceReport eventId={event.id} />
        )}

        {event &&
          !event.isCreator &&
          !canAcceptInvitation &&
          !invitationAccepted && (
            <p className={styles.hint}>
              Вы приглашены на это событие. Редактирование доступно только
              автору.
            </p>
          )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            {canAcceptInvitation || invitationAccepted ? "Закрыть" : "Отмена"}
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
