import { useState } from "react";
import { Calendar, momentLocalizer, type SlotInfo } from "react-big-calendar";
import moment from "moment";
import styles from "./calendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { EventModal } from "./components/event-modal/event-modal.component";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start: Date;
  end: Date;
}

export const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlot(slotInfo);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (title: string, description: string) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id
            ? { ...event, title, description }
            : event
        )
      );

      setEditingEvent(null);
      setIsModalOpen(false);
      return;
    }

    if (!slot) return;

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title,
      description,
      start: slot.start,
      end: slot.end
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Календарь</h1>

      <div className={styles.calendarWrapper}>
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultDate={new Date()}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {isModalOpen && (
        <EventModal
          event={editingEvent}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};
