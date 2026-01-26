import { apiInstance, type TAuthDto } from "@/shared";
// TODO: add types
export const login = async (dto: TAuthDto) => {
  const response = await apiInstance.post("/auth/login", dto);
  return response.data;
};
