export interface IUser {
  id: string;
  email: string;
  name: string;
  role: TRoles;
}

export type TRoles = "admin" | "user"; // in the future, we will add more roles
