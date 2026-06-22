import { useDispatch, useSelector } from "react-redux";
import type { ChangeEvent } from "react";
import {
  selectIsDarkTheme,
  setTheme,
  type ThemeMode
} from "@/stores/theme.store";
import { ThemeToggle } from "./components/theme-toggle.component";
import { ChangePasswordForm } from "./components/change-password-form.component";
import {
  useGetUserByIdQuery,
  useDeleteCurrentUserAvatarMutation,
  useUploadCurrentUserAvatarMutation,
  useGetCurrentUserAttendanceSummaryQuery
} from "@/services/user.api";
import { selectToken } from "@/stores/auth.store";
import {
  getUserIdFromAccessToken,
  getRoleStringFromAccessToken,
  roleIsStudentOrHeadman
} from "@/shared/lib/jwt-claims";
import { UserAvatar } from "@/shared/ui/user-avatar/user-avatar";
import styles from "./settings.module.scss";

const getAttendanceLevel = (
  hours: number | null
): "normal" | "warning" | "danger" => {
  if (hours == null) return "normal";
  if (hours >= 10) return "danger";
  if (hours > 6) return "warning";
  return "normal";
};

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDarkTheme);
  const token = useSelector(selectToken);
  const currentUserId = getUserIdFromAccessToken(token);
  const role = getRoleStringFromAccessToken(token);
  const isStudentOrHeadman = roleIsStudentOrHeadman(role);
  const { data: currentUser } = useGetUserByIdQuery(currentUserId ?? "", {
    skip: !currentUserId
  });
  const { data: attendanceSummary } = useGetCurrentUserAttendanceSummaryQuery(
    undefined,
    { skip: !isStudentOrHeadman }
  );
  const showAttendance =
    isStudentOrHeadman && attendanceSummary?.isInGroup === true;
  const missedHours =
    attendanceSummary?.totalMissedHours != null
      ? Number(attendanceSummary.totalMissedHours)
      : null;
  const attendanceLevel = getAttendanceLevel(missedHours);
  const attendanceValueClass =
    attendanceLevel === "danger"
      ? styles.attendanceValueDanger
      : attendanceLevel === "warning"
        ? styles.attendanceValueWarning
        : styles.attendanceValue;
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.email ||
    "?";
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadCurrentUserAvatarMutation();
  const [deleteAvatar, { isLoading: isDeletingAvatar }] =
    useDeleteCurrentUserAvatarMutation();
  const isAvatarBusy = isUploadingAvatar || isDeletingAvatar;
  const handleThemeChange = (dark: boolean) => {
    const mode: ThemeMode = dark ? "dark" : "light";
    dispatch(setTheme(mode));
  };
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await uploadAvatar(file).unwrap();
    event.target.value = "";
  };
  const handleAvatarDelete = async () => {
    if (!currentUser?.avatarUrl) {
      return;
    }
    await deleteAvatar().unwrap();
  };
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>

      <section className={styles.section} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className={styles.sectionTitle}>
          Профиль
        </h2>
        <p className={styles.sectionHint}>
          Настройте аватарку, которая будет отображаться в интерфейсе.
        </p>

        <div className={styles.avatarRow}>
          <div className={styles.avatarPreview}>
            <UserAvatar
              name={displayName}
              avatarUrl={currentUser?.avatarUrl}
              className={styles.avatarPreviewImage}
            />
          </div>

          <div className={styles.avatarInfo}>
            <span className={styles.rowLabel}>Аватарка пользователя</span>
            <span className={styles.rowDescription}>
              Поддерживаются JPG, PNG и WEBP до 5 МБ.
            </span>
            <div className={styles.avatarActions}>
              <label className={styles.avatarUploadButton}>
                {isUploadingAvatar ? "Загрузка..." : "Выбрать изображение"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isAvatarBusy}
                  onChange={handleAvatarChange}
                />
              </label>
              {currentUser?.avatarUrl && (
                <button
                  type="button"
                  className={styles.avatarDeleteButton}
                  disabled={isAvatarBusy}
                  onClick={() => void handleAvatarDelete()}
                >
                  {isDeletingAvatar ? "Удаление..." : "Удалить аватар"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {showAttendance && (
        <section
          className={styles.section}
          aria-labelledby="attendance-heading"
        >
          <h2 id="attendance-heading" className={styles.sectionTitle}>
            Посещаемость
          </h2>
          <p className={styles.sectionHint}>
            Накопленные часы пропуска по всем журналам вашей группы.
          </p>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Часы пропуска</span>
              <span className={styles.rowDescription}>
                Сумма пропусков, отмеченных в журналах посещаемости
              </span>
            </div>
            <span className={attendanceValueClass}>
              {attendanceSummary != null
                ? `${Number(attendanceSummary.totalMissedHours).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ч`
                : "—"}
            </span>
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="security-heading">
        <h2 id="security-heading" className={styles.sectionTitle}>
          Безопасность
        </h2>
        <p className={styles.sectionHint}>
          Измените пароль для входа в систему. Новый пароль должен быть не
          короче 8 символов, содержать заглавную букву и спецсимвол.
        </p>
        <ChangePasswordForm />
      </section>

      <section className={styles.section} aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className={styles.sectionTitle}>
          Внешний вид
        </h2>
        <p className={styles.sectionHint}>
          Настройки интерфейса сохраняются в этом браузере.
        </p>

        <div className={styles.row}>
          <div className={styles.rowText}>
            <span className={styles.rowLabel}>Тёмная тема</span>
            <span className={styles.rowDescription}>
              Комфортный режим при слабом освещении
            </span>
          </div>
          <ThemeToggle checked={isDark} onChange={handleThemeChange} />
        </div>
      </section>
    </div>
  );
};
