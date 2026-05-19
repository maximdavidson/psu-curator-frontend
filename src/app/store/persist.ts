import { STORE_NAMESPACE } from "@/shared";
import storage from "redux-persist/lib/storage";
import { persistReducer, type PersistConfig } from "redux-persist";
import { rootReducer, type RootState } from "./rootReducers";
const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  whitelist: [STORE_NAMESPACE.AUTH]
};
export const persistedReducer = persistReducer(persistConfig, rootReducer);
