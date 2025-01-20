import { configureStore } from "@reduxjs/toolkit";
import loginReducer from '../Slices/LoginSlice'
import storage from 'redux-persist/lib/storage'
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist";

const persistConfig = {
    key: 'root', //key dùng để lưu trữ
    storage,
}

const persistedReducer = persistReducer(persistConfig,loginReducer);

const store = configureStore({
    reducer: {
        login: persistedReducer,
    },
    middleware: (getDefaultMiddleware)=> 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export default store;
export const persistor = persistStore(store)

//Xuất kiểu RootState và AppDispatch để sử dụng với TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch