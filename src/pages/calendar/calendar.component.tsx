import { useState } from "react";
import { Calendar, momentLocalizer, type SlotInfo } from "react-big-calendar";
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

export const CalendarPage = () => {
  const { data: events = [] } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

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
    });

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

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Календарь</h1>

      <div className={styles.calendarWrapper}>
        <Calendar
          selectable
          localizer={localizer}
          events={mappedEvents}
          startAccessor="start"
          endAccessor="end"
          defaultDate={new Date()}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
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
