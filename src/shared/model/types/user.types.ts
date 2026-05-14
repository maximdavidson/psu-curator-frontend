export interface IUser {
  id: string;
  email: string;
  name: string;
  role: number;
}

/** Числовые значения совпадают с PsuCuratorBackend.Domain.Enums.UserRoles */
export const UserRole = {
  Student: 1,
  Headman: 2,
  Curator: 3,
  Dean: 4,
  DeputyDean: 5,
  Teacher: 6,
  Admin: 7
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabels: Record<UserRoleType, string> = {
  [UserRole.Student]: "Студент",
  [UserRole.Headman]: "Староста",
  [UserRole.Curator]: "Куратор",
  [UserRole.Dean]: "Декан",
  [UserRole.DeputyDean]: "Заместитель декана",
  [UserRole.Teacher]: "Преподаватель",
  [UserRole.Admin]: "Администратор"
};
