import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import sortOrderReducer from './slices/sortOrderSlice';

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  sortOrder: sortOrderReducer,
  
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
export default store;
