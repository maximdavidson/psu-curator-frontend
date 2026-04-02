import type { RootState } from "@/app/store/rootReducers";
import { STORE_NAMESPACE } from "@/shared/model/constants/store.namespace";
import { createSlice } from "@reduxjs/toolkit";

interface IAuthState {
  token: string | null;
}

const initialState: IAuthState = {
  token: localStorage.getItem("token")
};

export const authSlice = createSlice({
  name: STORE_NAMESPACE.AUTH,
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    removeToken: (state) => {
      state.token = null;
      localStorage.removeItem("token");
    }
  }
});

export const selectToken = (state: RootState) =>
  state[STORE_NAMESPACE.AUTH].token;

export const { setToken, removeToken } = authSlice.actions;
