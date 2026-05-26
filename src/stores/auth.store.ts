import { STORE_NAMESPACE } from "@/shared/model/constants/store.namespace";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ParsedAuthTokens } from "@/shared/lib/parse-auth-response";
interface IAuthState {
  token: string | null;
  mustChangePassword: boolean;
}
const initialState: IAuthState = {
  token: localStorage.getItem("token"),
  mustChangePassword: false
};
export const authSlice = createSlice({
  name: STORE_NAMESPACE.AUTH,
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setTokens: (state, action: PayloadAction<ParsedAuthTokens>) => {
      state.token = action.payload.accessToken;
      state.mustChangePassword = action.payload.mustChangePassword === true;
      localStorage.setItem("token", action.payload.accessToken);
      if (
        action.payload.refreshToken != null &&
        action.payload.refreshToken !== ""
      ) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
    clearMustChangePassword: (state) => {
      state.mustChangePassword = false;
    },
    removeToken: (state) => {
      state.token = null;
      state.mustChangePassword = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }
});
export const selectToken = (state: { [STORE_NAMESPACE.AUTH]?: IAuthState }) =>
  state[STORE_NAMESPACE.AUTH]?.token ?? null;
export const selectMustChangePassword = (state: {
  [STORE_NAMESPACE.AUTH]?: IAuthState;
}) => state[STORE_NAMESPACE.AUTH]?.mustChangePassword ?? false;
export const { setToken, setTokens, clearMustChangePassword, removeToken } =
  authSlice.actions;
