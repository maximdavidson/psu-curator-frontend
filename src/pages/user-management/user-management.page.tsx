/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { FormEvent } from "react";
import {
  type UserListItem,
  useCreateStaffUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery
} from "@/services/user.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import {
  getRoleStringFromAccessToken,
  getUserIdFromAccessToken
} from "@/shared/lib/jwt-claims";
import { useSelector } from "react-redux";
import { selectToken } from "@/stores/auth.store";
import { UserRole, UserRoleLabels, type UserRoleType } from "@/shared";
import { getSearchText, subscribeToSearch } from "@/app/store/searchStore";
import { FacultyPicker } from "@/shared/ui/faculty-picker/faculty-picker";
import { DepartmentPicker } from "@/shared/ui/department-picker/department-picker";
import { formatLastSeen, isUserOnline } from "@/shared/lib/format-last-seen";
import styles from "./user-management.module.scss";

const ALL_FILTER_VALUE = "";
const staffRoleOptions = [
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
export const UserManagementPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [surname, setSurname] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRoleType>(UserRole.Curator);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(getSearchText());
  const [roleFilter, setRoleFilter] = useState<string>(ALL_FILTER_VALUE);
  const [departmentFilter, setDepartmentFilter] = useState(ALL_FILTER_VALUE);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const token = useSelector(selectToken);
  const currentUserId = getUserIdFromAccessToken(token);
  const { data: users = [], isLoading } = useGetUsersQuery();
  const { data: currentUserProfile } = useGetUserByIdQuery(
    currentUserId ?? "",
    {
      skip: !currentUserId
    }
  );
  const [createStaffUser, { isLoading: isCreating }] =
    useCreateStaffUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const currentRole = getRoleStringFromAccessToken(token);
  const isAdmin = currentRole === "Admin";
  const deanFaculty = currentUserProfile?.faculty?.trim() ?? "";
  const effectiveFaculty = isAdmin ? faculty.trim() : deanFaculty;
  const roleOptions = isAdmin ? adminRoleOptions : staffRoleOptions;
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const selectedRoleLabel =
    roleOptions.find((o) => o.value === role)?.label ?? "";

  const handleRoleSelect = useCallback((value: UserRoleType) => {
    setRole(value);
    setRoleOpen(false);
  }, []);

  useEffect(() => {
    if (!roleOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!roleRef.current?.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [roleOpen]);

  const prevFacultyRef = useRef(faculty);
  useEffect(() => {
    if (prevFacultyRef.current !== faculty) {
      prevFacultyRef.current = faculty;
      setDepartment("");
    }
  }, [faculty]);
  useEffect(() => {
    const unsubscribe = subscribeToSearch(setSearch);
    return unsubscribe;
  }, []);
  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    users.forEach((user) => {
      const department = user.department?.trim();
      if (department) {
        departments.add(department);
      }
    });
    return Array.from(departments).sort((left, right) =>
      left.localeCompare(right, "ru")
    );
  }, [users]);

  const listRoleFilterOptions = useMemo(
    () =>
      Object.entries(UserRole).map(([, value]) => ({
        value: String(value),
        label: UserRoleLabels[value as UserRoleType]
      })),
    []
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && String(user.role) !== roleFilter) {
        return false;
      }

      if (
        departmentFilter &&
        (user.department?.trim() ?? "") !== departmentFilter
      ) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [
        user.email,
        user.firstName,
        user.lastName,
        user.surname ?? "",
        user.faculty ?? "",
        user.department ?? "",
        getRoleLabel(user.role),
        formatLastSeen(user.lastSeenAt, user.isOnline)
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [departmentFilter, roleFilter, search, users]);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isAdmin && !deanFaculty) {
      setError(
        "У вашей учётной записи не указан факультет. Обратитесь к администратору — без этого деканат не может создавать пользователей."
      );
      return;
    }

    if (isAdmin && !faculty.trim()) {
      setError("Выберите факультет для нового пользователя.");
      return;
    }

    try {
      await createStaffUser({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        surname: surname.trim() || undefined,
        faculty: isAdmin ? faculty.trim() : undefined,
        department: department.trim() || undefined,
        role
      }).unwrap();
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setSurname("");
      setFaculty("");
      setDepartment("");
      setRole(UserRole.Curator);
    } catch (err) {
      setError(
        readApiErrorMessage(err) ??
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
      setError(readApiErrorMessage(err) ?? "Не удалось удалить пользователя.");
    }
  };
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Управление пользователями</h1>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h2>Создать пользователя</h2>

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <span className={styles.formLabel}>Email / логин</span>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="teacher@psu.ru"
            />
          </div>

          <div className={styles.formField}>
            <span className={styles.formLabel}>Фамилия</span>
            <input
              className={styles.formInput}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Иванов"
            />
          </div>

          <div className={styles.formField}>
            <span className={styles.formLabel}>Имя</span>
            <input
              className={styles.formInput}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Иван"
            />
          </div>

          <div className={styles.formField}>
            <span className={styles.formLabel}>Отчество</span>
            <input
              className={styles.formInput}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Иванович"
            />
          </div>

          {isAdmin ? (
            <FacultyPicker
              id="staff-faculty"
              label="Факультет"
              value={faculty}
              onChange={setFaculty}
            />
          ) : (
            <div className={styles.formField}>
              <span className={styles.formLabel}>Факультет</span>
              <input
                className={styles.formInput}
                type="text"
                value={deanFaculty || "Не указан в профиле"}
                readOnly
                disabled
              />
            </div>
          )}

          <DepartmentPicker
            id="staff-department"
            label="Кафедра"
            value={department}
            faculty={effectiveFaculty}
            onChange={setDepartment}
          />

          <div className={styles.formField}>
            <span className={styles.formLabel}>Пароль</span>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Password123!"
            />
          </div>

          <div className={styles.formField} ref={roleRef}>
            <span className={styles.formLabel}>Роль</span>
            <button
              type="button"
              className={styles.selectTrigger}
              onClick={() => setRoleOpen((prev) => !prev)}
            >
              <span>{selectedRoleLabel}</span>
              <span>▾</span>
            </button>
            {roleOpen && (
              <div className={styles.selectDropdown}>
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.selectOption}${
                      option.value === role
                        ? ` ${styles.selectOptionActive}`
                        : ""
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleRoleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isCreating}
        >
          {isCreating ? "Создание..." : "Создать"}
        </button>
      </form>

      <section className={styles.card}>
        <div className={styles.listHeader}>
          <h2>Пользователи</h2>
          <div className={styles.filters}>
            <label className={styles.filterField}>
              <span>Роль</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value={ALL_FILTER_VALUE}>Все роли</option>
                {listRoleFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.filterField}>
              <span>Кафедра</span>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option value={ALL_FILTER_VALUE}>Все кафедры</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

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
                  <th>Последний раз в сети</th>
                  <th>Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyRow}>
                      Пользователи не найдены
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const presenceLabel = formatLastSeen(
                      user.lastSeenAt,
                      user.isOnline
                    );
                    const presenceOnline = isUserOnline(
                      user.lastSeenAt,
                      user.isOnline
                    );
                    return (
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
                        <td
                          className={
                            presenceOnline
                              ? styles.presenceOnline
                              : styles.presenceOffline
                          }
                        >
                          {presenceLabel}
                        </td>
                        <td>
                          {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                      </tr>
                    );
                  })
                )}
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
              <dt>Последний раз в сети</dt>
              <dd
                className={
                  isUserOnline(selectedUser.lastSeenAt, selectedUser.isOnline)
                    ? styles.presenceOnline
                    : styles.presenceOffline
                }
              >
                {formatLastSeen(selectedUser.lastSeenAt, selectedUser.isOnline)}
              </dd>
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
