import {
  startTransition,
  useState,
  useCallback,
  useEffect,
  useMemo
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  momentLocalizer,
  Views,
  type SlotInfo,
  type ToolbarProps,
  type View
} from "react-big-calendar";
import moment from "moment";
import styles from "./calendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { EventModal } from "./components/event-modal/event-modal.component";
import {
  type CalendarEventInvitedUser,
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useUpdateEventMutation,
  useAcceptEventMutation
} from "@/services/calendar.api";
import { useGetEventTypesQuery } from "@/services/calendarEventType.api";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
const localizer = momentLocalizer(moment);
interface CalendarEventUI {
  id: string;
  title: string;
  description?: string;
  isCreator?: boolean;
  isAccepted?: boolean;
  eventTypeId?: string | null;
  eventTypeName?: string | null;
  invitedUsers: CalendarEventInvitedUser[];
  start: Date;
  end: Date;
}
const ALL_EVENT_TYPES = "";
const NO_EVENT_TYPE = "__none__";

const CustomToolbar = ({
  date,
  onNavigate,
  onView,
  view
}: ToolbarProps<CalendarEventUI>) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <button onClick={() => onNavigate("TODAY")}>Сегодня</button>
        <button onClick={() => onNavigate("PREV")}>Назад</button>
        <button onClick={() => onNavigate("NEXT")}>Вперед</button>
        <span className={styles.currentDate}>
          {moment(date).format("MMMM YYYY")}
        </span>
      </div>

      <div className={styles.toolbarRight}>
        <button
          className={view === Views.MONTH ? styles.active : ""}
          onClick={() => onView(Views.MONTH)}
        >
          Месяц
        </button>
        <button
          className={view === Views.WEEK ? styles.active : ""}
          onClick={() => onView(Views.WEEK)}
        >
          Неделя
        </button>
        <button
          className={view === Views.DAY ? styles.active : ""}
          onClick={() => onView(Views.DAY)}
        >
          День
        </button>
        <button
          className={view === Views.AGENDA ? styles.active : ""}
          onClick={() => onView(Views.AGENDA)}
        >
          Повестка
        </button>
      </div>
    </div>
  );
};
export const CalendarPage = () => {
  const { data: events = [] } = useGetEventsQuery();
  const { data: eventTypes = [] } = useGetEventTypesQuery();
  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [acceptEvent, { isLoading: isAccepting }] = useAcceptEventMutation();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEventUI | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(ALL_EVENT_TYPES);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRole = getRoleStringFromAccessToken(
    localStorage.getItem("token")
  );
  const canInviteParticipants =
    currentRole !== "Student" && currentRole !== "Headman";
  const mappedEvents: CalendarEventUI[] = useMemo(
    () =>
      events
        .filter((event) => {
          if (!selectedTypeId) {
            return true;
          }
          if (selectedTypeId === NO_EVENT_TYPE) {
            return !event.eventTypeId;
          }
          return event.eventTypeId === selectedTypeId;
        })
        .map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          eventTypeId: e.eventTypeId,
          eventTypeName: e.eventTypeName,
          isCreator: e.isCreator,
          isAccepted: e.isAccepted,
          invitedUsers: e.invitedUsers ?? [],
          start: new Date(e.dateOfEvent),
          end: e.endDateOfEvent
            ? new Date(e.endDateOfEvent)
            : moment(e.dateOfEvent).add(1, "hour").toDate()
        })),
    [events, selectedTypeId]
  );
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlot(slotInfo);
    setEditingEvent(null);
    setIsModalOpen(true);
  };
  const handleSelectEvent = (event: CalendarEventUI) => {
    setEditingEvent(event);
    setSlot(null);
    setIsModalOpen(true);
  };
  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (!eventId || events.length === 0) return;
    const source = events.find((item) => item.id === eventId);
    if (!source) return;
    const event: CalendarEventUI = {
      id: source.id,
      title: source.title,
      description: source.description,
      eventTypeId: source.eventTypeId,
      eventTypeName: source.eventTypeName,
      isCreator: source.isCreator,
      isAccepted: source.isAccepted,
      invitedUsers: source.invitedUsers ?? [],
      start: new Date(source.dateOfEvent),
      end: source.endDateOfEvent
        ? new Date(source.endDateOfEvent)
        : moment(source.dateOfEvent).add(1, "hour").toDate()
    };
    startTransition(() => {
      setDate(event.start);
      setEditingEvent(event);
      setSlot(null);
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    });
  }, [events, searchParams, setSearchParams]);
  const handleSaveEvent = async (
    title: string,
    description: string,
    invitedUsers: CalendarEventInvitedUser[],
    invitedGroupIds: string[],
    start: Date,
    end: Date,
    eventTypeId?: string | null
  ) => {
    if (editingEvent?.id) {
      const currentUserIds = new Set(
        editingEvent.invitedUsers.map((user) => user.id)
      );
      const nextUserIds = new Set(invitedUsers.map((user) => user.id));
      const userForDelete = [...currentUserIds].filter(
        (id) => !nextUserIds.has(id)
      );
      const newUsers = [...nextUserIds].filter((id) => !currentUserIds.has(id));
      await updateEvent({
        id: editingEvent.id,
        body: {
          newTitle: title,
          newDescription: description,
          newDateOfEvent: start.toISOString(),
          newEndDateOfEvent: end.toISOString(),
          newEventTypeId: eventTypeId,
          userForDelete,
          newUsers,
          newGroupIds: invitedGroupIds
        }
      }).unwrap();
      setIsModalOpen(false);
      setEditingEvent(null);
      return;
    }
    await createEvent({
      title,
      description,
      dateOfEvent: start.toISOString(),
      endDateOfEvent: end.toISOString(),
      eventTypeId,
      invitedUsersIds: invitedUsers.map((user) => user.id),
      invitedUserEmails: [],
      invitedGroupIds
    }).unwrap();
    setIsModalOpen(false);
    setSlot(null);
  };
  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    setIsModalOpen(false);
    setEditingEvent(null);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setSlot(null);
  };
  const handleAcceptEvent = async (id: string) => {
    await acceptEvent(id).unwrap();
    setEditingEvent((current) =>
      current?.id === id ? { ...current, isAccepted: true } : current
    );
  };
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);
  const handleView = useCallback((newView: View) => {
    setView(newView);
  }, []);
  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <label className={styles.filterLabel} htmlFor="calendar-type-filter">
          Тип события
        </label>
        <select
          id="calendar-type-filter"
          className={styles.typeFilter}
          value={selectedTypeId}
          onChange={(e) => setSelectedTypeId(e.target.value)}
        >
          <option value={ALL_EVENT_TYPES}>Все типы</option>
          <option value={NO_EVENT_TYPE}>Без типа</option>
          {eventTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.calendarWrapper}>
        <Calendar
          selectable
          localizer={localizer}
          events={mappedEvents}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          onNavigate={handleNavigate}
          onView={handleView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{
            toolbar: CustomToolbar
          }}
          popup
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        />
      </div>

      {isModalOpen && (
        <EventModal
          key={editingEvent?.id ?? "create"}
          event={editingEvent}
          slot={slot}
          canInviteParticipants={canInviteParticipants}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onAccept={handleAcceptEvent}
          isAccepting={isAccepting}
        />
      )}
    </div>
  );
};
