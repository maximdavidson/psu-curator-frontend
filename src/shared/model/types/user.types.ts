export interface IUser {
  id: string;
  email: string;
  name: string;
  role: TRole;
}

export type TRole = "admin" | "user"; // in the future, we will add more roles
