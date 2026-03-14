import { authApi } from "@/services/auth.api";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { persistedReducer } from "./persist";

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"]
      }
    }).concat(authApi.middleware)
});

export const persistor = persistStore(store);
