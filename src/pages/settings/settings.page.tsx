import { useDispatch, useSelector } from "react-redux";
import type { ChangeEvent } from "react";
import {
  selectIsDarkTheme,
  setTheme,
  type ThemeMode
} from "@/stores/theme.store";
import { ThemeToggle } from "./components/theme-toggle.component";
import {
  useGetUserByIdQuery,
  useDeleteCurrentUserAvatarMutation,
  useUploadCurrentUserAvatarMutation
} from "@/services/user.api";
import { selectToken } from "@/stores/auth.store";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
import { resolveAvatarUrl } from "@/shared/lib/resolve-avatar-url";
import styles from "./settings.module.scss";
export const SettingsPage = () => {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDarkTheme);
  const token = useSelector(selectToken);
  const currentUserId = getUserIdFromAccessToken(token);
  const { data: currentUser } = useGetUserByIdQuery(currentUserId ?? "", {
    skip: !currentUserId
  });
  const avatarUrl = resolveAvatarUrl(currentUser?.avatarUrl);
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
    if (!avatarUrl) {
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
            {avatarUrl ? (
              <img src={avatarUrl} alt="Аватар пользователя" />
            ) : (
              <span>
                {(
                  currentUser?.firstName?.[0] ??
                  currentUser?.email?.[0] ??
                  "?"
                ).toUpperCase()}
              </span>
            )}
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
              {avatarUrl && (
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
