// import { apiInstance, type IUser } from "@/shared";

import type { IUser } from "@/shared";

export const findMe = async (): Promise<IUser> => {
  // return (await apiInstance.get("/user/me")) as IUser;
  return new Promise((resolve) => {
    resolve({
      id: "123",
      email: "test@example.com",
      name: "John Doe",
      role: "admin"
    });
  });
};
