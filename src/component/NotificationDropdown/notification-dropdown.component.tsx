import { useState, useRef, useEffect } from "react";
import styles from "./notification-dropdown.module.scss";
import {
  useGetUnreadNotificationsQuery,
  useGetAllNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} from "@/services/notification.api";

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadNotifications = [] } = useGetUnreadNotificationsQuery();
  const { data: allNotifications = [] } = useGetAllNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Только что";
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short"
    });
  };

  const notificationsToShow = isOpen ? allNotifications : unreadNotifications;

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.bellIcon}>🔔</span>
        {unreadNotifications.length > 0 && (
          <span className={styles.badge}>
            {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Уведомления</h3>
            {unreadNotifications.length > 0 && (
              <button
                className={styles.markAllButton}
                onClick={handleMarkAllRead}
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notificationsToShow.length === 0 && (
              <div className={styles.empty}>
                <p>Нет уведомлений</p>
              </div>
            )}

            {notificationsToShow.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notification} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className={styles.notificationIcon}>
                  {notification.type === "event" && "📅"}
                  {notification.type === "feed" && "📝"}
                  {notification.type === "survey" && "📊"}
                  {notification.type === "document" && "📄"}
                  {!notification.type && "📌"}
                </div>
                <div className={styles.notificationContent}>
                  <p className={styles.notificationTitle}>
                    {notification.title}
                  </p>
                  <p className={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  <span className={styles.notificationDate}>
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                {!notification.isRead && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
