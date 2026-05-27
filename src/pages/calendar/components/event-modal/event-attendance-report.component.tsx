import { useMemo, useState } from "react";
import styles from "./event-modal.module.scss";
import {
  useGetAttendanceReportQuery,
  useSaveAttendanceMutation,
  type CalendarEventAttendanceParticipant
} from "@/services/calendar.api";

interface Props {
  eventId: string;
}

const buildPresenceState = (
  participants: CalendarEventAttendanceParticipant[]
): Record<string, boolean> =>
  Object.fromEntries(
    participants.map((participant) => [
      participant.userId,
      participant.wasPresent === true
    ])
  );

export const EventAttendanceReport = ({ eventId }: Props) => {
  const { data, isLoading, isError } = useGetAttendanceReportQuery(eventId);
  const [saveAttendance, { isLoading: isSaving }] = useSaveAttendanceMutation();
  const [editedPresence, setEditedPresence] = useState<Record<
    string,
    boolean
  > | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const serverPresence = useMemo(
    () => (data ? buildPresenceState(data.participants) : {}),
    [data]
  );

  const presence = editedPresence ?? serverPresence;

  const summary = useMemo(() => {
    if (!data) return null;
    return {
      invited: data.invitedCount,
      accepted: data.acceptedCount,
      attended: data.attendedCount
    };
  }, [data]);

  if (isLoading) {
    return <p className={styles.hint}>Загрузка отчёта посещаемости…</p>;
  }

  if (isError || !data) {
    return null;
  }

  if (data.participants.length === 0) {
    return (
      <div className={styles.attendanceBlock}>
        <h3 className={styles.attendanceTitle}>Посещаемость</h3>
        <p className={styles.hint}>
          Добавьте участников в событие, чтобы вести отчёт по приглашениям и
          посещению.
        </p>
      </div>
    );
  }

  const handleToggle = (userId: string, checked: boolean) => {
    if (!data.canManage) return;
    setEditedPresence((current) => ({
      ...(current ?? serverPresence),
      [userId]: checked
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await saveAttendance({
        eventId,
        body: {
          entries: data.participants.map((participant) => ({
            userId: participant.userId,
            wasPresent: presence[participant.userId] === true
          }))
        }
      }).unwrap();
      setEditedPresence(null);
    } catch {
      setSaveError("Не удалось сохранить отметки посещаемости.");
    }
  };

  return (
    <div className={styles.attendanceBlock}>
      <div className={styles.attendanceHeader}>
        <h3 className={styles.attendanceTitle}>Посещаемость</h3>
        {summary && (
          <p className={styles.attendanceSummary}>
            Приглашено: {summary.invited} · Приняли: {summary.accepted} ·
            Присутствовали: {summary.attended}
          </p>
        )}
      </div>

      <div className={styles.attendanceTableWrap}>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>Участник</th>
              <th>Приглашение</th>
              <th>На мероприятии</th>
            </tr>
          </thead>
          <tbody>
            {data.participants.map((participant) => (
              <tr key={participant.userId}>
                <td>
                  <span className={styles.attendanceName}>
                    {participant.fullName?.trim() || participant.email}
                  </span>
                  <span className={styles.attendanceEmail}>
                    {participant.email}
                  </span>
                </td>
                <td>
                  {participant.isAccepted ? (
                    <span className={styles.statusAccepted}>Принял(а)</span>
                  ) : (
                    <span className={styles.statusPending}>Ожидает</span>
                  )}
                </td>
                <td>
                  {data.canManage ? (
                    <label className={styles.attendanceCheck}>
                      <input
                        type="checkbox"
                        checked={presence[participant.userId] === true}
                        onChange={(e) =>
                          handleToggle(participant.userId, e.target.checked)
                        }
                      />
                      <span>Присутствовал(а)</span>
                    </label>
                  ) : participant.wasPresent === true ? (
                    <span className={styles.statusAccepted}>Да</span>
                  ) : participant.wasPresent === false ? (
                    <span className={styles.statusAbsent}>Нет</span>
                  ) : (
                    <span className={styles.statusPending}>Не отмечено</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.canManage && (
        <div className={styles.attendanceActions}>
          <button
            type="button"
            className={styles.attendanceSaveButton}
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? "Сохранение…" : "Сохранить посещаемость"}
          </button>
        </div>
      )}

      {!data.canManage && (
        <p className={styles.hint}>
          Отметки посещаемости выставляет организатор мероприятия.
        </p>
      )}

      {saveError && <p className={styles.error}>{saveError}</p>}
    </div>
  );
};
