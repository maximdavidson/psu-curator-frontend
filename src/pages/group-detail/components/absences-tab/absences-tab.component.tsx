import { useMemo, useState } from "react";
import styles from "./absences-tab.module.scss";
import {
  useDownloadGroupAbsencesExcelMutation,
  useGetGroupAbsencesQuery
} from "../../groupAbsences.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";

interface Props {
  groupId: string;
  groupName: string;
}

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const formatHours = (value: number) => {
  return Number(value).toLocaleString("ru-RU", {
    maximumFractionDigits: 1
  });
};

const toApiDate = (value: string) => `${value}T00:00:00.000Z`;

const sanitizeFileName = (value: string) => {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "group";
};

const formatPeriodLabel = (
  dateFrom?: string | null,
  dateTo?: string | null
): string => {
  if (!dateFrom && !dateTo) {
    return "за всё время";
  }

  if (dateFrom && dateTo) {
    return `с ${formatDate(dateFrom)} по ${formatDate(dateTo)}`;
  }

  if (dateFrom) {
    return `с ${formatDate(dateFrom)}`;
  }

  return `по ${formatDate(dateTo!)}`;
};

export const AbsencesTab = ({ groupId, groupName }: Props) => {
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState<string | undefined>();
  const [appliedDateTo, setAppliedDateTo] = useState<string | undefined>();
  const [error, setError] = useState("");

  const queryArgs = useMemo(
    () => ({
      groupId,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo
    }),
    [groupId, appliedDateFrom, appliedDateTo]
  );

  const { data, isLoading, isFetching, isError } =
    useGetGroupAbsencesQuery(queryArgs);
  const [downloadExcel, { isLoading: isDownloading }] =
    useDownloadGroupAbsencesExcelMutation();

  const handleApplyFilters = () => {
    if (draftDateFrom && draftDateTo && draftDateFrom > draftDateTo) {
      setError("Дата окончания не может быть раньше даты начала.");
      return;
    }

    setError("");
    setAppliedDateFrom(draftDateFrom ? toApiDate(draftDateFrom) : undefined);
    setAppliedDateTo(draftDateTo ? toApiDate(draftDateTo) : undefined);
  };

  const handleResetFilters = () => {
    setDraftDateFrom("");
    setDraftDateTo("");
    setAppliedDateFrom(undefined);
    setAppliedDateTo(undefined);
    setError("");
  };

  const handleDownloadExcel = async () => {
    setError("");

    try {
      const blob = await downloadExcel(queryArgs).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFileName(groupName)}-absences.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        readApiErrorMessage(downloadError) ?? "Не удалось скачать Excel-файл."
      );
    }
  };

  if (isLoading) {
    return <p className={styles.status}>Загрузка статистики пропусков…</p>;
  }

  if (isError || !data) {
    return (
      <p className={styles.error}>
        Не удалось загрузить статистику пропусков. Попробуйте обновить страницу.
      </p>
    );
  }

  return (
    <div className={styles.absencesTab}>
      <div className={styles.headerRow}>
        <div>
          <h2>Пропуска</h2>
          <p>
            {groupName} · {formatPeriodLabel(data.dateFrom, data.dateTo)}
          </p>
          <p className={styles.hint}>
            Учитываются только часы отсутствия из журналов посещаемости.
            Уважительные пропуски («у») в статистику не входят.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleDownloadExcel}
            disabled={isDownloading}
          >
            {isDownloading ? "Скачивание…" : "Скачать Excel"}
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span>С даты</span>
          <input
            type="date"
            value={draftDateFrom}
            onChange={(event) => setDraftDateFrom(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>По дату</span>
          <input
            type="date"
            value={draftDateTo}
            onChange={(event) => setDraftDateTo(event.target.value)}
          />
        </label>

        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleApplyFilters}
            disabled={isFetching}
          >
            {isFetching ? "Применение…" : "Применить"}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleResetFilters}
            disabled={isFetching && !draftDateFrom && !draftDateTo}
          >
            Сбросить
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.summaryCard}>
        <div className={styles.summaryValue}>
          {formatHours(data.totalMissedHours)} ч
        </div>
        <div className={styles.summaryLabel}>
          Всего пропущено по группе за выбранный период
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Сводка по студентам</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ФИО студента</th>
              <th>Всего пропущено (ч)</th>
              <th>Дней с пропусками</th>
            </tr>
          </thead>
          <tbody>
            {data.studentTotals.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  В группе пока нет студентов.
                </td>
              </tr>
            ) : (
              data.studentTotals.map((student) => (
                <tr key={student.userId}>
                  <td>
                    {student.fullName}
                    {student.isHeadman && (
                      <span className={styles.headmanBadge}>(староста)</span>
                    )}
                  </td>
                  <td className={styles.numericCell}>
                    {formatHours(student.totalMissedHours)}
                  </td>
                  <td className={styles.numericCell}>
                    {student.absenceDaysCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Детализация</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ФИО студента</th>
              <th>Дата</th>
              <th>Журнал</th>
              <th>Пропущено (ч)</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  За выбранный период пропусков не найдено.
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr key={`${item.userId}-${item.date}-${item.journalId}`}>
                  <td>{item.fullName}</td>
                  <td className={styles.numericCell}>
                    {formatDate(item.date)}
                  </td>
                  <td>{item.journalTitle}</td>
                  <td className={styles.numericCell}>
                    {formatHours(item.missedHours)}
                  </td>
                  <td>{item.comment?.trim() ? item.comment : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
