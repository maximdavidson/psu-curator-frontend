import { authApi } from "@/services/auth.api";
import { authSlice } from "@/stores/auth.store";
import { combineReducers } from "@reduxjs/toolkit";
import { STORE_NAMESPACE } from "@/shared";

export const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [STORE_NAMESPACE.AUTH]: authSlice.reducer
});

export type RootState = ReturnType<typeof rootReducer>;
