import { STORE_NAMESPACE } from "@/shared/model/constants/store.namespace";
import { createSlice } from "@reduxjs/toolkit";

interface IAuthState {
  token: string | null;
}

const initialState: IAuthState = {
  token: null
};

export const authSlice = createSlice({
  name: STORE_NAMESPACE.AUTH,
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    removeToken: (state) => {
      state.token = null;
    }
  }
});

export const { setToken, removeToken } = authSlice.actions;
