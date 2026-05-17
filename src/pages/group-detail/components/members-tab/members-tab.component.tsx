import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./members-tab.module.scss";
import {
  useAddStudentsToGroupMutation,
  useRemoveStudentsFromGroupMutation,
  type GroupMember
} from "@/pages/groups/group.api";
import { useLazySearchUsersByNameQuery } from "@/services/user.api";

const MIN_QUERY_LEN = 2;

interface Props {
  groupId: string;
  members: GroupMember[];
  onRefetch: () => void;
  canManage: boolean;
}

export const MembersTab = ({
  groupId,
  members,
  onRefetch,
  canManage
}: Props) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchUsers, searchState] = useLazySearchUsersByNameQuery();
  const [addStudents, { isLoading: isAdding }] =
    useAddStudentsToGroupMutation();
  const [removeStudents] = useRemoveStudentsFromGroupMutation();
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const memberIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LEN) {
      return;
    }
    void searchUsers(debouncedQuery, true);
  }, [debouncedQuery, searchUsers]);

  const handleAdd = useCallback(
    async (studentId: string) => {
      setError(null);
      try {
        await addStudents({
          groupId,
          studentIds: [studentId]
        }).unwrap();
        await onRefetch();
      } catch {
        setError("Не удалось добавить участника. Проверьте права и данные.");
      }
    },
    [addStudents, groupId, onRefetch]
  );

  const handleRemove = useCallback(
    async (studentId: string) => {
      setError(null);
      setPendingRemoveId(studentId);
      try {
        await removeStudents({
          groupId,
          studentIds: [studentId]
        }).unwrap();
        await onRefetch();
      } catch {
        setError("Не удалось исключить участника из группы.");
      } finally {
        setPendingRemoveId(null);
      }
    },
    [groupId, onRefetch, removeStudents]
  );

  const searchResults = searchState.data ?? [];
  const showResults =
    debouncedQuery.length >= MIN_QUERY_LEN && !searchState.isFetching;
  const filteredResults = searchResults.filter((u) => !memberIds.has(u.id));

  return (
    <div className={styles.membersTab}>
      <h2 className={styles.sectionTitle}>Участники группы</h2>
      {members.length === 0 ? (
        <p className={styles.emptyHint}>Пока никого нет в списке.</p>
      ) : (
        <ul className={styles.memberList}>
          {members.map((m) => (
            <li key={m.id} className={styles.memberCard}>
              <div className={styles.memberMain}>
                <p className={styles.memberName}>
                  {m.fullName?.trim() || "Без имени"}
                </p>
                {m.email && <p className={styles.memberEmail}>{m.email}</p>}
              </div>
              {canManage && (
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={pendingRemoveId !== null || isAdding}
                  onClick={() => void handleRemove(m.id)}
                >
                  {pendingRemoveId === m.id ? "…" : "Исключить"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <>
          <h2 className={styles.sectionTitle}>Добавить участника</h2>
          <div className={styles.searchBlock}>
            <label className={styles.searchLabel} htmlFor="student-search">
              Поиск по имени или почте
            </label>
            <input
              id="student-search"
              className={styles.searchInput}
              type="search"
              autoComplete="off"
              placeholder="Например, Иванов или ivanov@"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <p className={styles.searchHint}>
              Введите не менее {MIN_QUERY_LEN} символов — покажем подходящих
              пользователей.
            </p>
          </div>
        </>
      )}

      {canManage &&
        searchState.isFetching &&
        debouncedQuery.length >= MIN_QUERY_LEN && (
          <p className={styles.loadingText}>Поиск…</p>
        )}

      {error && <p className={styles.errorText}>{error}</p>}

      {canManage && showResults && filteredResults.length === 0 && (
        <p className={styles.noResults}>
          Ничего не найдено или все уже в группе.
        </p>
      )}

      {canManage && showResults && filteredResults.length > 0 && (
        <div className={styles.results}>
          {filteredResults.map((u) => (
            <div key={u.id} className={styles.resultRow}>
              <div className={styles.memberMain}>
                <p className={styles.memberName}>
                  {u.fullName?.trim() || "Без имени"}
                </p>
                {u.email && <p className={styles.memberEmail}>{u.email}</p>}
              </div>
              <button
                type="button"
                className={styles.addButton}
                disabled={isAdding || pendingRemoveId !== null}
                onClick={() => void handleAdd(u.id)}
              >
                Добавить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
