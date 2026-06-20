import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  useCreateEventTypeMutation,
  useDeleteEventTypeMutation,
  useGetEventTypesQuery,
  useUpdateEventTypeMutation,
  type CalendarEventType
} from "@/services/calendarEventType.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import {
  getRoleStringFromAccessToken,
  roleCanManageEventTypes
} from "@/shared/lib/jwt-claims";
import { selectToken } from "@/stores/auth.store";
import { useSelector } from "react-redux";
import styles from "./event-types.module.scss";

const ALL_TYPES = "";

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));

export const EventTypesPage = () => {
  const token = useSelector(selectToken);
  const currentRole = getRoleStringFromAccessToken(token);
  const canManageTypes = roleCanManageEventTypes(currentRole);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filterTypeId, setFilterTypeId] = useState(ALL_TYPES);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<CalendarEventType | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const { data: types = [], isLoading } = useGetEventTypesQuery();
  const [createEventType, { isLoading: isCreating }] =
    useCreateEventTypeMutation();
  const [updateEventType, { isLoading: isUpdating }] =
    useUpdateEventTypeMutation();
  const [deleteEventType, { isLoading: isDeleting }] =
    useDeleteEventTypeMutation();

  const filteredTypes = useMemo(() => {
    if (!filterTypeId) {
      return types;
    }

    return types.filter((type) => type.id === filterTypeId);
  }, [filterTypeId, types]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Укажите название типа события.");
      return;
    }

    try {
      await createEventType({
        name: trimmedName,
        description: description.trim() || null
      }).unwrap();
      setName("");
      setDescription("");
    } catch (err) {
      setFormError(
        readApiErrorMessage(err) ?? "Не удалось создать тип события."
      );
    }
  };

  const openEdit = (type: CalendarEventType) => {
    setEditingType(type);
    setEditName(type.name);
    setEditDescription(type.description ?? "");
    setEditError(null);
  };

  const closeEdit = () => {
    setEditingType(null);
    setEditName("");
    setEditDescription("");
    setEditError(null);
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingType) {
      return;
    }

    setEditError(null);
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError("Укажите название типа события.");
      return;
    }

    try {
      await updateEventType({
        id: editingType.id,
        body: {
          name: trimmedName,
          description: editDescription.trim() || null
        }
      }).unwrap();
      closeEdit();
    } catch (err) {
      setEditError(
        readApiErrorMessage(err) ?? "Не удалось сохранить тип события."
      );
    }
  };

  const handleDelete = async (type: CalendarEventType) => {
    const confirmed = window.confirm(
      type.eventsCount > 0
        ? `Удалить тип «${type.name}»? У ${type.eventsCount} событий в календаре тип будет сброшен.`
        : `Удалить тип «${type.name}»?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteEventType(type.id).unwrap();
      if (filterTypeId === type.id) {
        setFilterTypeId(ALL_TYPES);
      }
      if (editingType?.id === type.id) {
        closeEdit();
      }
    } catch (err) {
      window.alert(
        readApiErrorMessage(err) ?? "Не удалось удалить тип события."
      );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Типы событий</h1>
          <p>
            Справочник категорий для календаря. Название события задаётся
            отдельно при создании мероприятия.
          </p>
        </div>
      </header>

      {canManageTypes && (
        <section className={styles.card}>
          <h2>Создать тип события</h2>
          <form className={styles.form} onSubmit={handleCreate}>
            <label className={styles.field}>
              Название типа
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: собрание, практика, экзамен"
              />
            </label>
            <label className={styles.field}>
              Описание типа
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое пояснение категории"
              />
            </label>
            {formError && <p className={styles.error}>{formError}</p>}
            <button type="submit" disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать тип"}
            </button>
          </form>
        </section>
      )}

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2>Справочник типов</h2>
          <select
            value={filterTypeId}
            onChange={(e) => setFilterTypeId(e.target.value)}
          >
            <option value={ALL_TYPES}>Все типы</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className={styles.empty}>Загрузка...</p>
        ) : filteredTypes.length === 0 ? (
          <p className={styles.empty}>Типы событий пока не созданы.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Описание</th>
                  <th>Событий в календаре</th>
                  <th>Создан</th>
                  {canManageTypes && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>{type.description || "—"}</td>
                    <td>{type.eventsCount}</td>
                    <td>{formatDate(type.createdAt)}</td>
                    {canManageTypes && (
                      <td className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openEdit(type)}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(type)}
                          disabled={isDeleting}
                        >
                          Удалить
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingType && (
        <div className={styles.overlay}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h2>Редактировать тип</h2>
            <form className={styles.form} onSubmit={handleUpdate}>
              <label className={styles.field}>
                Название типа
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                Описание типа
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </label>
              {editError && <p className={styles.error}>{editError}</p>}
              <div className={styles.modalActions}>
                <button type="button" onClick={closeEdit} disabled={isUpdating}>
                  Отмена
                </button>
                <button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
