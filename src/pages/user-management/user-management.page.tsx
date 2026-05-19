import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  type UserListItem,
  useCreateStaffUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery
} from "@/services/user.api";
import { UserRole, UserRoleLabels, type UserRoleType } from "@/shared";
import { getSearchText, subscribeToSearch } from "@/app/store/searchStore";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
import styles from "./user-management.module.scss";
const staffRoleOptions = [
  { value: UserRole.Teacher, label: UserRoleLabels[UserRole.Teacher] },
  { value: UserRole.Curator, label: UserRoleLabels[UserRole.Curator] }
];
const adminRoleOptions = [
  ...staffRoleOptions,
  { value: UserRole.Dean, label: UserRoleLabels[UserRole.Dean] },
  { value: UserRole.DeputyDean, label: UserRoleLabels[UserRole.DeputyDean] }
];
const getRoleLabel = (role: UserRoleType | string | number): string => {
  if (typeof role === "string") {
    const found = Object.entries(UserRole).find(
      ([, value]) => String(value) === role
    );
    if (found) return UserRoleLabels[found[1] as UserRoleType];
    return role;
  }
  return UserRoleLabels[role as UserRoleType] ?? `Роль ${role}`;
};
const getApiErrorMessage = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null) return null;
  const data =
    "data" in error
      ? (
          error as {
            data?: unknown;
          }
        ).data
      : null;
  if (typeof data === "string") return data;
  if (typeof data !== "object" || data === null) return null;
  const payload = data as {
    error?: unknown;
    message?: unknown;
  };
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return null;
};
export const UserManagementPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [surname, setSurname] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRoleType>(UserRole.Teacher);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(getSearchText());
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [createStaffUser, { isLoading: isCreating }] =
    useCreateStaffUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const currentRole = getRoleStringFromAccessToken(
    localStorage.getItem("token")
  );
  const isAdmin = currentRole === "Admin";
  const roleOptions = isAdmin ? adminRoleOptions : staffRoleOptions;
  useEffect(() => {
    const unsubscribe = subscribeToSearch(setSearch);
    return unsubscribe;
  }, []);
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [
        user.email,
        user.firstName,
        user.lastName,
        user.surname ?? "",
        user.faculty ?? "",
        user.department ?? "",
        getRoleLabel(user.role)
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, users]);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createStaffUser({
        email,
        password,
        firstName,
        lastName,
        surname,
        faculty: isAdmin ? faculty : undefined,
        department,
        role
      }).unwrap();
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setSurname("");
      setFaculty("");
      setDepartment("");
      setRole(UserRole.Teacher);
    } catch (err) {
      setError(
        getApiErrorMessage(err) ??
          "Не удалось создать пользователя. Проверьте данные и права доступа."
      );
    }
  };
  const handleDeleteSelectedUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Удалить пользователя ${selectedUser.email}?`)) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      setSelectedUser(null);
    } catch (err) {
      setError(getApiErrorMessage(err) ?? "Не удалось удалить пользователя.");
    }
  };
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Управление пользователями</h1>
          <p>
            Деканат создаёт преподавателей и кураторов только в своём
            факультете. Администратор создаёт деканов и замдеканов и видит все
            факультеты.
          </p>
        </div>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h2>Создать пользователя</h2>

        <div className={styles.formGrid}>
          <label>
            Email / логин
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="teacher@psu.ru"
            />
          </label>

          <label>
            Фамилия
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Иванов"
            />
          </label>

          <label>
            Имя
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Иван"
            />
          </label>

          <label>
            Отчество
            <input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Иванович"
            />
          </label>

          {isAdmin && (
            <label>
              Факультет
              <input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                required
                placeholder="Факультет информационных технологий"
              />
            </label>
          )}

          <label>
            Кафедра
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Кафедра прикладной информатики"
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Password123!"
            />
          </label>

          <label>
            Роль
            <select
              value={role}
              onChange={(e) => setRole(Number(e.target.value) as UserRoleType)}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={isCreating}>
          {isCreating ? "Создание..." : "Создать"}
        </button>
      </form>

      <section className={styles.card}>
        <h2>Пользователи</h2>

        {isLoading ? (
          <p className={styles.muted}>Загрузка...</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Факультет</th>
                  <th>Кафедра</th>
                  <th>Роль</th>
                  <th>Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={styles.clickableRow}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td>{user.email}</td>
                    <td>
                      {[user.lastName, user.firstName, user.surname]
                        .filter(Boolean)
                        .join(" ") || "Не указано"}
                    </td>
                    <td>{user.faculty || "Не указан"}</td>
                    <td>{user.department || "Не указана"}</td>
                    <td>{getRoleLabel(user.role)}</td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedUser && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedUser(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Информация о пользователе</h2>
              <button type="button" onClick={() => setSelectedUser(null)}>
                ×
              </button>
            </div>

            <dl className={styles.details}>
              <dt>Email</dt>
              <dd>{selectedUser.email}</dd>
              <dt>ФИО</dt>
              <dd>
                {[
                  selectedUser.lastName,
                  selectedUser.firstName,
                  selectedUser.surname
                ]
                  .filter(Boolean)
                  .join(" ") || "Не указано"}
              </dd>
              <dt>Роль</dt>
              <dd>{getRoleLabel(selectedUser.role)}</dd>
              <dt>Факультет</dt>
              <dd>{selectedUser.faculty || "Не указан"}</dd>
              <dt>Кафедра</dt>
              <dd>{selectedUser.department || "Не указана"}</dd>
              <dt>Дата создания</dt>
              <dd>
                {new Date(selectedUser.createdAt).toLocaleString("ru-RU")}
              </dd>
            </dl>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={isDeleting}
                onClick={handleDeleteSelectedUser}
              >
                {isDeleting ? "Удаление..." : "Удалить пользователя"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
