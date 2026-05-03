/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  type SlotInfo
} from "react-big-calendar";
import moment from "moment";
import styles from "./calendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { EventModal } from "./components/event-modal/event-modal.component";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery
} from "@/services/calendar.api";

const localizer = momentLocalizer(moment);

interface CalendarEventUI {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
}

const CustomToolbar = ({ date, onNavigate, onView, view }: any) => {
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

  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEventUI | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mappedEvents: CalendarEventUI[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    start: new Date(e.dateOfEvent),
    end: new Date(e.dateOfEvent)
  }));

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

  const handleSaveEvent = async (
    title: string,
    description: string,
    invitedEmails: string[]
  ) => {
    if (!slot) return;

    await createEvent({
      title,
      description,
      dateOfEvent: slot.start.toISOString(),
      invitedUserEmails: invitedEmails
    }).unwrap();

    // Если invitedEmails не пустой — показываем уведомление
    if (invitedEmails.length > 0) {
      // Уведомление создастся на бэкенде автоматически
      // или можно инвалидировать тег Notification
    }

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

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleView = useCallback((newView: any) => {
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
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};
