import { useState, useRef, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import styles from "./notification-dropdown.module.scss";
import {
  notificationApi,
  useGetUnreadNotificationsQuery,
  useGetAllNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} from "@/services/notification.api";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
import { useAppDispatch } from "@/app/store/store.types";

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: unreadNotifications = [] } = useGetUnreadNotificationsQuery();
  const { data: allNotifications = [] } = useGetAllNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromAccessToken(token);
    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)
      ?.replace(/\/$/, "")
      .replace(/\/api$/i, "");

    if (!token || !userId || !apiUrl) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/notificationHub`, {
        accessTokenFactory: () => localStorage.getItem("token") ?? ""
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("ReceiveNotification", () => {
      dispatch(notificationApi.util.invalidateTags(["Notification"]));
    });

    connection
      .start()
      .then(() => connection.invoke("SubscribeToUser", userId))
      .catch(() => undefined);

    return () => {
      connection.off("ReceiveNotification");
      void connection.stop();
    };
  }, [dispatch]);

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

  const handleNotificationClick = async (
    id: string,
    type?: string,
    relatedEntityId?: string | null
  ) => {
    await markAsRead(id);

    if (type === "event" && relatedEntityId) {
      setIsOpen(false);
      navigate(`/calendar?eventId=${relatedEntityId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    event.stopPropagation();
    await deleteNotification(id);
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
                onClick={() =>
                  handleNotificationClick(
                    notification.id,
                    notification.type,
                    notification.relatedEntityId
                  )
                }
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
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label="Удалить уведомление"
                  onClick={(event) =>
                    handleDeleteNotification(event, notification.id)
                  }
                >
                  ×
                </button>
                {!notification.isRead && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
