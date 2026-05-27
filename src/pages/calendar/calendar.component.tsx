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
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
const localizer = momentLocalizer(moment);
interface CalendarEventUI {
  id: string;
  title: string;
  description?: string;
  isCreator?: boolean;
  isAccepted?: boolean;
  invitedUsers: CalendarEventInvitedUser[];
  start: Date;
  end: Date;
}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRole = getRoleStringFromAccessToken(
    localStorage.getItem("token")
  );
  const canInviteParticipants =
    currentRole !== "Student" && currentRole !== "Headman";
  const mappedEvents: CalendarEventUI[] = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        isCreator: e.isCreator,
        isAccepted: e.isAccepted,
        invitedUsers: e.invitedUsers ?? [],
        start: new Date(e.dateOfEvent),
        end: e.endDateOfEvent
          ? new Date(e.endDateOfEvent)
          : moment(e.dateOfEvent).add(1, "hour").toDate()
      })),
    [events]
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
    const event = mappedEvents.find((item) => item.id === eventId);
    if (!event) return;
    startTransition(() => {
      setDate(event.start);
      setEditingEvent(event);
      setSlot(null);
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    });
  }, [events.length, mappedEvents, searchParams, setSearchParams]);
  const handleSaveEvent = async (
    title: string,
    description: string,
    invitedUsers: CalendarEventInvitedUser[],
    invitedGroupIds: string[],
    start: Date,
    end: Date
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
