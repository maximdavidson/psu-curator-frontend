import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authSlice } from "@/stores/auth.store";
import { authApi } from "@/services/auth.api";
import { surveyApi } from "@/pages/surveys/survey.api";
import { groupApi } from "@/pages/groups/group.api";
import { combineReducers } from "@reduxjs/toolkit";
import { calendarApi } from "@/services/calendar.api";
import { groupFeedApi } from "@/pages/group-detail/groupFeed.api";
import { documentsApi } from "@/pages/documents/documents.api";
import { notificationApi } from "@/services/notification.api";

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [surveyApi.reducerPath]: surveyApi.reducer,
  [groupApi.reducerPath]: groupApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [groupFeedApi.reducerPath]: groupFeedApi.reducer,
  [documentsApi.reducerPath]: documentsApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: [authSlice.name]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"]
      }
    }).concat(
      authApi.middleware,
      surveyApi.middleware,
      groupApi.middleware,
      calendarApi.middleware,
      groupFeedApi.middleware,
      documentsApi.middleware,
      notificationApi.middleware
    )
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
