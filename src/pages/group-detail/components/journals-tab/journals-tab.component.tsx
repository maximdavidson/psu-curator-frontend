import { useMemo, useState } from "react";
import styles from "./journals-tab.module.scss";
import {
  type AttendanceStatus,
  type GroupJournalDetail,
  type GroupJournalListItem,
  useCreateGroupJournalMutation,
  useDeleteGroupJournalMutation,
  useDownloadGroupJournalExcelMutation,
  useGetGroupJournalQuery,
  useGetGroupJournalsQuery,
  useSaveGroupJournalEntriesMutation,
  useUpdateGroupJournalMutation
} from "../../groupJournals.api";
import { JournalFormModal } from "./journal-form-modal.component";
interface Props {
  groupId: string;
  canManage: boolean;
}
const STATUS_LABELS: Record<AttendanceStatus, string> = {
  1: "Присутствовал",
  2: "Отсутствовал",
  3: "Опоздал",
  4: "Уважительная"
};
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
const toApiDate = (value: string) => `${value}T00:00:00.000Z`;
const sanitizeFileName = (value: string) => {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "journal";
};
const cellKey = (userId: string, date: string) =>
  `${userId}:${date.slice(0, 10)}`;
const buildInitialCells = (journal?: GroupJournalDetail) => {
  const result: Record<string, AttendanceStatus | ""> = {};
  if (!journal) return result;
  for (const participant of journal.participants) {
    for (const entry of participant.entries) {
      result[cellKey(participant.userId, entry.date)] = entry.status ?? "";
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
  const { data, isLoading, isError } = useGetGroupJournalQuery(journalId);
  const [saveEntries, { isLoading: isSaving }] =
    useSaveGroupJournalEntriesMutation();
  const [downloadExcel, { isLoading: isDownloading }] =
    useDownloadGroupJournalExcelMutation();
  const [cells, setCells] = useState<Record<string, AttendanceStatus | "">>({});
  const [dirtyJournalId, setDirtyJournalId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const effectiveCells = useMemo(() => {
    if (!data) return cells;
    if (dirtyJournalId !== data.id) {
      return buildInitialCells(data);
    }
    return cells;
  }, [cells, data, dirtyJournalId]);
  const handleCellChange = (
    userId: string,
    date: string,
    status: AttendanceStatus | ""
  ) => {
    if (!data) return;
    const initial =
      dirtyJournalId === data.id ? cells : buildInitialCells(data);
    setDirtyJournalId(data.id);
    setCells({
      ...initial,
      [cellKey(userId, date)]: status
    });
  };
  const handleSave = async () => {
    if (!data) return;
    setError("");
    const entries = data.participants.flatMap((participant) =>
      data.dates
        .map((date) => ({
          userId: participant.userId,
          date,
          status: effectiveCells[cellKey(participant.userId, date)]
        }))
        .filter(
          (
            entry
          ): entry is {
            userId: string;
            date: string;
            status: AttendanceStatus;
          } => entry.status !== ""
        )
    );
    try {
      await saveEntries({ journalId: data.id, entries }).unwrap();
      setDirtyJournalId(null);
      setCells({});
    } catch {
      setError("Не удалось сохранить посещаемость.");
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
          </thead>
          <tbody>
            {data.participants.map((participant) => (
              <tr key={participant.userId}>
                <td className={styles.participantCell}>
                  <span>{participant.fullName || "Без имени"}</span>
                  {participant.isHeadman && <small>Староста</small>}
                </td>
                {data.dates.map((date) => {
                  const key = cellKey(participant.userId, date);
                  const value = effectiveCells[key] ?? "";
                  return (
                    <td key={key}>
                      <select
                        value={value}
                        disabled={!data.canEditEntries}
                        onChange={(e) =>
                          handleCellChange(
                            participant.userId,
                            date,
                            e.target.value
                              ? (Number(e.target.value) as AttendanceStatus)
                              : ""
                          )
                        }
                      >
                        <option value="">-</option>
                        {Object.entries(STATUS_LABELS).map(
                          ([status, label]) => (
                            <option key={status} value={status}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
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
          <p>Журналы посещаемости по студентам группы.</p>
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
