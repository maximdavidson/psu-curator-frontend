import { useMemo, useState } from "react";
import styles from "./journals-tab.module.scss";
import { useAppDispatch } from "@/app/store/store.types";
import { userApi } from "@/services/user.api";
import {
  type GroupJournalDetail,
  type GroupJournalListItem,
  type SaveGroupJournalEntryRequest,
  useCreateGroupJournalMutation,
  useDeleteGroupJournalMutation,
  useDownloadGroupJournalExcelMutation,
  useGetGroupJournalQuery,
  useGetGroupJournalsQuery,
  useRemoveFormerJournalParticipantMutation,
  useSaveGroupJournalEntriesMutation,
  useUpdateGroupJournalMutation
} from "../../groupJournals.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import { JournalFormModal } from "./journal-form-modal.component";
interface Props {
  groupId: string;
  canManage: boolean;
}
const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit"
  });
};
const formatFullDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};
const formatHours = (value: number) => {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};
const toApiDate = (value: string) => `${value}T00:00:00.000Z`;
const sanitizeFileName = (value: string) => {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "journal";
};
const dateKey = (date: string) => date.slice(0, 10);
const cellKey = (userId: string, date: string) => `${userId}:${dateKey(date)}`;
const parseHoursInput = (value: string): number | "" => {
  if (value.trim() === "") return "";
  const parsed = Number(value.replace(",", "."));
  if (Number.isNaN(parsed) || parsed < 0) return "";
  return Math.round(parsed * 10) / 10;
};
const buildInitialDaySchedules = (journal?: GroupJournalDetail) => {
  const result: Record<string, number | ""> = {};
  if (!journal) return result;
  for (const day of journal.daySchedules) {
    result[dateKey(day.date)] = day.requiredHours > 0 ? day.requiredHours : "";
  }
  return result;
};
const buildInitialMissedCells = (journal?: GroupJournalDetail) => {
  const result: Record<string, number | ""> = {};
  if (!journal) return result;

  for (const participant of journal.participants) {
    for (const entry of participant.entries) {
      const missed = entry.missedHours ?? 0;
      if (missed > 0) {
        result[cellKey(participant.userId, entry.date)] = missed;
      }
    }
  }

  return result;
};
const JournalDetail = ({
  journalId,
  onBack
}: {
  journalId: string;
  onBack: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetGroupJournalQuery(journalId);
  const [saveEntries, { isLoading: isSaving }] =
    useSaveGroupJournalEntriesMutation();
  const [downloadExcel, { isLoading: isDownloading }] =
    useDownloadGroupJournalExcelMutation();
  const [removeFormerParticipant, { isLoading: isRemovingParticipant }] =
    useRemoveFormerJournalParticipantMutation();
  const [daySchedules, setDaySchedules] = useState<Record<string, number | "">>(
    {}
  );
  const [missedCells, setMissedCells] = useState<Record<string, number | "">>(
    {}
  );
  const [dirtyJournalId, setDirtyJournalId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const effectiveDaySchedules = useMemo(() => {
    if (!data) return daySchedules;
    if (dirtyJournalId !== data.id) {
      return buildInitialDaySchedules(data);
    }
    return daySchedules;
  }, [daySchedules, data, dirtyJournalId]);
  const effectiveMissedCells = useMemo(() => {
    if (!data) return missedCells;
    if (dirtyJournalId !== data.id) {
      return buildInitialMissedCells(data);
    }
    return missedCells;
  }, [missedCells, data, dirtyJournalId]);
  const getRequiredHours = (date: string) => {
    const value = effectiveDaySchedules[dateKey(date)];
    return value === "" || value === undefined ? 0 : value;
  };
  const handleDayScheduleChange = (date: string, rawValue: string) => {
    if (!data) return;
    const initialDays =
      dirtyJournalId === data.id
        ? daySchedules
        : buildInitialDaySchedules(data);
    const initialMissed =
      dirtyJournalId === data.id ? missedCells : buildInitialMissedCells(data);
    setDirtyJournalId(data.id);
    setDaySchedules({
      ...initialDays,
      [dateKey(date)]: parseHoursInput(rawValue)
    });
    setMissedCells(initialMissed);
  };
  const handleMissedChange = (
    userId: string,
    date: string,
    rawValue: string
  ) => {
    if (!data) return;
    const initialMissed =
      dirtyJournalId === data.id ? missedCells : buildInitialMissedCells(data);
    const initialDays =
      dirtyJournalId === data.id
        ? daySchedules
        : buildInitialDaySchedules(data);
    setDirtyJournalId(data.id);
    setMissedCells({
      ...initialMissed,
      [cellKey(userId, date)]: parseHoursInput(rawValue)
    });
    setDaySchedules(initialDays);
  };
  const handleSave = async () => {
    if (!data) return;
    setError("");
    const daySchedulePayload = data.dates.map((date) => ({
      date: toApiDate(dateKey(date)),
      requiredHours: getRequiredHours(date)
    }));

    if (!daySchedulePayload.some((day) => day.requiredHours > 0)) {
      setError("Сначала укажите длительность занятий хотя бы для одного дня.");
      return;
    }

    let hasInvalidMissedHours = false;
    const validEntries: SaveGroupJournalEntryRequest[] = [];
    for (const participant of data.participants) {
      if (participant.isFormerMember) {
        continue;
      }
      for (const date of data.dates) {
        const required = getRequiredHours(date);
        if (required <= 0) {
          continue;
        }

        const missed = effectiveMissedCells[cellKey(participant.userId, date)];

        if (missed === "" || missed === undefined) {
          continue;
        }

        if (missed > required) {
          hasInvalidMissedHours = true;
          continue;
        }

        validEntries.push({
          userId: participant.userId,
          date: toApiDate(dateKey(date)),
          attendedHours: Math.round((required - missed) * 10) / 10
        });
      }
    }
    if (hasInvalidMissedHours) {
      setError(
        "Часов отсутствия не может быть больше длительности занятий в этот день."
      );
      return;
    }
    try {
      await saveEntries({
        journalId: data.id,
        body: {
          daySchedules: daySchedulePayload,
          entries: validEntries
        }
      }).unwrap();
      dispatch(
        userApi.util.invalidateTags([
          { type: "User", id: "attendance-summary" }
        ])
      );
      setDirtyJournalId(null);
      setDaySchedules({});
      setMissedCells({});
    } catch (err) {
      setError(
        readApiErrorMessage(err) ?? "Не удалось сохранить посещаемость."
      );
    }
  };
  const handleRemoveFormerParticipant = async (
    participant: GroupJournalDetail["participants"][number]
  ) => {
    if (!data) return;
    const name = participant.fullName || "студента";
    if (
      !confirm(
        `Удалить ${name} из журнала? Все записи посещаемости по этому студенту будут удалены без возможности восстановления.`
      )
    ) {
      return;
    }
    setError("");
    try {
      await removeFormerParticipant({
        journalId: data.id,
        userId: participant.userId
      }).unwrap();
      dispatch(
        userApi.util.invalidateTags([
          { type: "User", id: "attendance-summary" }
        ])
      );
    } catch {
      setError("Не удалось удалить участника из журнала.");
    }
  };
  const handleDownloadExcel = async () => {
    if (!data) return;
    setError("");
    try {
      const blob = await downloadExcel(data.id).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFileName(data.groupName)}-${sanitizeFileName(data.title)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Не удалось скачать Excel-файл.");
    }
  };
  if (isLoading) {
    return <p className={styles.status}>Загрузка журнала...</p>;
  }
  if (isError || !data) {
    return <p className={styles.status}>Не удалось загрузить журнал.</p>;
  }
  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <div>
          <button type="button" className={styles.backButton} onClick={onBack}>
            Назад к журналам
          </button>
          <h2>{data.title}</h2>
          <p>
            {data.groupName} · {formatFullDate(data.startDate)} -{" "}
            {formatFullDate(data.endDate)}
          </p>
          <p className={styles.hint}>
            В строке «Длительность занятий» — сколько часов длились пары в день.
            В ячейках студентов — сколько часов отсутствовал (пусто — был на
            всех занятиях).
          </p>
        </div>
        <div className={styles.detailActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={isDownloading}
            onClick={handleDownloadExcel}
          >
            {isDownloading ? "Скачивание..." : "Скачать Excel"}
          </button>
          {data.canEditEntries && (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </button>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.journalTable}>
          <thead>
            <tr>
              <th>Студент</th>
              {data.dates.map((date) => (
                <th key={date}>{formatDate(date)}</th>
              ))}
            </tr>
            <tr className={styles.scheduleRow}>
              <th>
                <span className={styles.rowLabel}>Длительность занятий</span>
              </th>
              {data.dates.map((date) => {
                const key = dateKey(date);
                const value = effectiveDaySchedules[key] ?? "";
                return (
                  <th key={`schedule-${date}`}>
                    {data.canEditEntries ? (
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        className={styles.hoursInput}
                        value={value}
                        disabled={!data.canEditEntries}
                        onChange={(e) =>
                          handleDayScheduleChange(date, e.target.value)
                        }
                        placeholder="0"
                      />
                    ) : (
                      <span>
                        {value === "" ? "—" : formatHours(Number(value))}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.participants.map((participant) => (
              <tr
                key={participant.userId}
                className={
                  participant.isFormerMember
                    ? styles.formerMemberRow
                    : undefined
                }
              >
                <td className={styles.participantCell}>
                  <span>{participant.fullName || "Без имени"}</span>
                  {participant.isHeadman && <small>Староста</small>}
                  {participant.isFormerMember && (
                    <small className={styles.formerMemberLabel}>
                      Исключён из группы
                    </small>
                  )}
                  {participant.canRemoveFromJournal && (
                    <button
                      type="button"
                      className={styles.removeParticipantButton}
                      disabled={isRemovingParticipant}
                      onClick={() =>
                        void handleRemoveFormerParticipant(participant)
                      }
                    >
                      Удалить из журнала
                    </button>
                  )}
                </td>
                {data.dates.map((date) => {
                  const key = cellKey(participant.userId, date);
                  const value = effectiveMissedCells[key] ?? "";
                  const required = getRequiredHours(date);
                  const entryMeta = participant.entries.find(
                    (entry) => entry.date.slice(0, 10) === date.slice(0, 10)
                  );
                  const savedMissed = entryMeta?.missedHours ?? 0;
                  const cellEditable =
                    !participant.isFormerMember &&
                    data.canEditEntries &&
                    required > 0 &&
                    (entryMeta?.canEdit ?? true);
                  const displayMissed =
                    value !== "" && value !== undefined
                      ? Number(value)
                      : savedMissed > 0
                        ? savedMissed
                        : null;
                  return (
                    <td key={key}>
                      {required <= 0 ? (
                        <span className={styles.emptyCell}>—</span>
                      ) : cellEditable ? (
                        <div className={styles.attendanceCell}>
                          <input
                            type="number"
                            min={0}
                            max={required}
                            step={0.5}
                            className={styles.hoursInput}
                            value={value}
                            disabled={!cellEditable}
                            title={`Сколько часов отсутствовал (макс. ${formatHours(required)} ч)`}
                            placeholder="ч"
                            aria-label={`Отсутствие, ${formatDate(date)}`}
                            onChange={(e) =>
                              handleMissedChange(
                                participant.userId,
                                date,
                                e.target.value
                              )
                            }
                          />
                          {displayMissed != null && displayMissed > 0 && (
                            <span className={styles.missedTag}>
                              отсутствовал {formatHours(displayMissed)} ч
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.readOnlyHours}>
                          {displayMissed != null && displayMissed > 0
                            ? `отсутствовал ${formatHours(displayMissed)} ч`
                            : "—"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export const JournalsTab = ({ groupId, canManage }: Props) => {
  const {
    data: journals = [],
    isLoading,
    isError
  } = useGetGroupJournalsQuery(groupId);
  const [createJournal, { isLoading: isCreating }] =
    useCreateGroupJournalMutation();
  const [updateJournal, { isLoading: isUpdating }] =
    useUpdateGroupJournalMutation();
  const [deleteJournal] = useDeleteGroupJournalMutation();
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] =
    useState<GroupJournalListItem | null>(null);
  const [error, setError] = useState("");
  const handleCreateClick = () => {
    setError("");
    setEditingJournal(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (journal: GroupJournalListItem) => {
    setError("");
    setEditingJournal(journal);
    setIsFormOpen(true);
  };
  const handleDelete = async (journal: GroupJournalListItem) => {
    if (!confirm("Удалить журнал посещаемости?")) return;
    setError("");
    try {
      await deleteJournal({ journalId: journal.id, groupId }).unwrap();
      if (selectedJournalId === journal.id) {
        setSelectedJournalId(null);
      }
    } catch {
      setError("Не удалось удалить журнал.");
    }
  };
  const handleSubmit = async (values: {
    title: string;
    startDate: string;
    endDate: string;
  }) => {
    if (editingJournal) {
      await updateJournal({
        journalId: editingJournal.id,
        groupId,
        body: {
          title: values.title,
          startDate: toApiDate(values.startDate),
          endDate: toApiDate(values.endDate)
        }
      }).unwrap();
    } else {
      await createJournal({
        groupId,
        body: {
          title: values.title,
          startDate: toApiDate(values.startDate),
          endDate: toApiDate(values.endDate)
        }
      }).unwrap();
    }
    setIsFormOpen(false);
    setEditingJournal(null);
  };
  if (selectedJournalId) {
    return (
      <JournalDetail
        journalId={selectedJournalId}
        onBack={() => setSelectedJournalId(null)}
      />
    );
  }
  return (
    <div className={styles.journalsTab}>
      <div className={styles.headerRow}>
        <div>
          <h2>Журналы</h2>
          <p>Учёт часов посещаемости по дням и студентам группы.</p>
        </div>
        {canManage && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleCreateClick}
          >
            Добавить журнал
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.status}>Загрузка журналов...</p>}
      {isError && (
        <p className={styles.status}>Не удалось загрузить журналы.</p>
      )}

      {!isLoading && !isError && journals.length === 0 && (
        <p className={styles.empty}>Пока нет журналов посещаемости.</p>
      )}

      <div className={styles.journalList}>
        {journals.map((journal) => (
          <article key={journal.id} className={styles.journalCard}>
            <button
              type="button"
              className={styles.cardMain}
              onClick={() => setSelectedJournalId(journal.id)}
            >
              <h3>{journal.title}</h3>
              <p>
                {formatFullDate(journal.startDate)} -{" "}
                {formatFullDate(journal.endDate)}
              </p>
              <span>Записей: {journal.entriesCount}</span>
            </button>
            {canManage && (
              <div className={styles.cardActions}>
                <button type="button" onClick={() => handleEditClick(journal)}>
                  Редактировать
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => void handleDelete(journal)}
                >
                  Удалить
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {isFormOpen && (
        <JournalFormModal
          key={editingJournal?.id ?? "create"}
          journal={editingJournal}
          isSubmitting={isCreating || isUpdating}
          onClose={() => {
            setIsFormOpen(false);
            setEditingJournal(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
