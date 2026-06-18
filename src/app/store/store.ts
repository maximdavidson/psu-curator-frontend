import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authSlice } from "@/stores/auth.store";
import { themeSlice } from "@/stores/theme.store";
import { authApi } from "@/services/auth.api";
import { surveyApi } from "@/pages/surveys/survey.api";
import { groupApi } from "@/pages/groups/group.api";
import { combineReducers } from "@reduxjs/toolkit";
import { calendarApi } from "@/services/calendar.api";
import { groupFeedApi } from "@/pages/group-detail/groupFeed.api";
import { groupJournalsApi } from "@/pages/group-detail/groupJournals.api";
import { groupAbsencesApi } from "@/pages/group-detail/groupAbsences.api";
import { documentsApi } from "@/pages/documents/documents.api";
import { notificationApi } from "@/services/notification.api";
import { userApi } from "@/services/user.api";
import { chatApi } from "@/services/chat.api";
import { calendarEventTypeApi } from "@/services/calendarEventType.api";
import { authCacheListener } from "./auth-cache-listener.middleware";
const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [themeSlice.name]: themeSlice.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [surveyApi.reducerPath]: surveyApi.reducer,
  [groupApi.reducerPath]: groupApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [groupFeedApi.reducerPath]: groupFeedApi.reducer,
  [groupJournalsApi.reducerPath]: groupJournalsApi.reducer,
  [groupAbsencesApi.reducerPath]: groupAbsencesApi.reducer,
  [documentsApi.reducerPath]: documentsApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [calendarEventTypeApi.reducerPath]: calendarEventTypeApi.reducer
});
const persistConfig = {
  key: "root",
  storage,
  whitelist: [authSlice.name, themeSlice.name]
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
      groupJournalsApi.middleware,
      groupAbsencesApi.middleware,
      documentsApi.middleware,
      notificationApi.middleware,
      userApi.middleware,
      chatApi.middleware,
      calendarEventTypeApi.middleware,
      authCacheListener.middleware
    )
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
