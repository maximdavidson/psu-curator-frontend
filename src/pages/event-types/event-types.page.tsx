import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetEventsQuery } from "@/services/calendar.api";
import {
  useCreateEventTypeMutation,
  useGetEventTypesQuery
} from "@/services/calendarEventType.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import {
  getRoleStringFromAccessToken,
  roleCanManageEventTypes
} from "@/shared/lib/jwt-claims";
import { selectToken } from "@/stores/auth.store";
import styles from "./event-types.module.scss";

const ALL_TYPES = "";

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export const EventTypesPage = () => {
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const currentRole = getRoleStringFromAccessToken(token);
  const canManageTypes = roleCanManageEventTypes(currentRole);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState(ALL_TYPES);
  const [error, setError] = useState<string | null>(null);
  const { data: types = [], isLoading: isTypesLoading } =
    useGetEventTypesQuery();
  const { data: events = [], isLoading: isEventsLoading } = useGetEventsQuery();
  const [createEventType, { isLoading: isCreating }] =
    useCreateEventTypeMutation();

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) =>
        selectedTypeId ? event.eventTypeId === selectedTypeId : true
      )
      .sort(
        (a, b) =>
          new Date(a.dateOfEvent).getTime() - new Date(b.dateOfEvent).getTime()
      );
  }, [events, selectedTypeId]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Укажите название типа события.");
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
      setError(readApiErrorMessage(err) ?? "Не удалось создать тип события.");
    }
  };

  const openEvent = (eventId: string) => {
    navigate(`/calendar?eventId=${eventId}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Типы событий</h1>
          <p>
            Создавайте теги для событий календаря и быстро находите мероприятия
            по выбранному типу.
          </p>
        </div>
      </header>

      {canManageTypes && (
        <section className={styles.card}>
          <h2>Создать тип события</h2>
          <form className={styles.form} onSubmit={handleCreate}>
            <label className={styles.field}>
              Название
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: собрание, практика, экзамен"
              />
            </label>
            <label className={styles.field}>
              Описание
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое пояснение для этого типа"
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать тип"}
            </button>
          </form>
        </section>
      )}

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2>События по типам</h2>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
          >
            <option value={ALL_TYPES}>Все типы</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {isTypesLoading || isEventsLoading ? (
          <p className={styles.empty}>Загрузка...</p>
        ) : filteredEvents.length === 0 ? (
          <p className={styles.empty}>Событий по выбранному типу пока нет.</p>
        ) : (
          <div className={styles.eventsList}>
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className={styles.eventCard}
                onClick={() => openEvent(event.id)}
              >
                <div>
                  <strong>{event.title}</strong>
                  <span>
                    {event.eventTypeName || "Без типа"} ·{" "}
                    {formatDateTime(event.dateOfEvent)}
                  </span>
                </div>
                {event.description && <p>{event.description}</p>}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
