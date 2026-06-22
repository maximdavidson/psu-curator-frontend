/* eslint-disable react-hooks/set-state-in-effect */
import { startTransition, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./header.module.scss";
import { setSearchText } from "@/app/store/searchStore";
import { NotificationDropdown } from "../NotificationDropdown/notification-dropdown.component";
import { selectToken } from "@/stores/auth.store";
import {
  getRoleStringFromAccessToken,
  getUserIdFromAccessToken,
  roleIsStudentOrHeadman
} from "@/shared/lib/jwt-claims";
import { UserAvatar } from "@/shared/ui/user-avatar/user-avatar";
import {
  useGetCurrentUserAttendanceSummaryQuery,
  useGetUserByIdQuery
} from "@/services/user.api";

const getUserEmail = (): string => {
  return localStorage.getItem("email") || "";
};

const getInitialsFromEmail = (email: string): string => {
  if (!email) return "??";
  const namePart = email.split("@")[0];
  const parts = namePart.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
};

const getPlaceholderByPath = (path: string): string => {
  if (path === "/groups") {
    return "Поиск по группам...";
  }
  if (path === "/surveys") {
    return "Поиск по опросам...";
  }
  if (path === "/users") {
    return "Поиск по пользователям...";
  }
  return "Поиск...";
};

const shouldShowSearch = (path: string): boolean => {
  return path === "/groups" || path === "/surveys" || path === "/users";
};

export const Header = () => {
  const [text, setText] = useState<string>("");
  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const location = useLocation();
  const token = useSelector(selectToken);
  const currentUserId = getUserIdFromAccessToken(token);
  const role = getRoleStringFromAccessToken(token);
  const isStudentAccount = roleIsStudentOrHeadman(role);
  const { data: currentUser } = useGetUserByIdQuery(currentUserId ?? "", {
    skip: !currentUserId
  });
  const { data: attendanceSummary } = useGetCurrentUserAttendanceSummaryQuery(
    undefined,
    { skip: !isStudentAccount }
  );
  const email = getUserEmail();
  const initials = getInitialsFromEmail(email);
  const placeholder = getPlaceholderByPath(location.pathname);
  const showSearch = shouldShowSearch(location.pathname);
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    email;

  useEffect(() => {
    startTransition(() => {
      setText("");
      setSearchText("");
    });
  }, [location.pathname]);

  useEffect(() => {
    if (
      !isStudentAccount ||
      !currentUserId ||
      attendanceSummary?.isInGroup !== true
    ) {
      setShowAttendanceAlert(false);
      return;
    }

    const missedHours = Number(attendanceSummary?.totalMissedHours ?? 0);
    if (missedHours <= 10) {
      setShowAttendanceAlert(false);
      return;
    }

    const alertKey = `attendance-warning-shown:${currentUserId}:${missedHours.toFixed(1)}`;
    if (sessionStorage.getItem(alertKey) === "1") {
      setShowAttendanceAlert(false);
      return;
    }

    sessionStorage.setItem(alertKey, "1");
    setShowAttendanceAlert(true);
  }, [
    attendanceSummary?.isInGroup,
    attendanceSummary?.totalMissedHours,
    currentUserId,
    isStudentAccount
  ]);

  const handleSearch = (value: string) => {
    setText(value);
    setSearchText(value);
  };

  return (
    <>
      {showAttendanceAlert && (
        <div className={styles.attendanceAlert} role="alert">
          Превышен установленный лимит часов пропусков. Рекомендуем
          проанализировать посещаемость и принять меры для стабилизации учебного
          графика.
          <button
            type="button"
            className={styles.alertClose}
            onClick={() => setShowAttendanceAlert(false)}
          >
            Понятно
          </button>
        </div>
      )}
      <header className={styles.header}>
        <div className={styles.left}>
          <img className={styles.PSU_icon} src="./icons/Psu-icon.svg" alt="" />
          <h2 className={styles.PSU_text}>PSU Curator</h2>
        </div>

        {showSearch && (
          <div className={styles.center}>
            <div className={styles.search}>
              <span className={styles.searchIconWrap} aria-hidden>
                <img src="./icons/Search-icon.svg" alt="" />
              </span>
              <input
                className={styles.search_input}
                type="text"
                role="search"
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                value={text}
              />
            </div>
          </div>
        )}

        <div className={styles.right}>
          <NotificationDropdown />
          <div className={styles.user_icon}>
            <UserAvatar
              name={displayName}
              avatarUrl={currentUser?.avatarUrl}
              fallback={initials}
              className={styles.userAvatar}
            />
          </div>
        </div>
      </header>
    </>
  );
};
