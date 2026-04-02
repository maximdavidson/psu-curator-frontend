import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "@/services/auth.api";
import { authSlice } from "@/stores/auth.store";
import { STORE_NAMESPACE } from "@/shared";
import { surveyApi } from "@/pages/surveys/survey.api";
import { groupApi } from "@/pages/groups/group.api";

export const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [STORE_NAMESPACE.AUTH]: authSlice.reducer,
  [surveyApi.reducerPath]: surveyApi.reducer,
  [groupApi.reducerPath]: groupApi.reducer
});

export type RootState = ReturnType<typeof rootReducer>;
