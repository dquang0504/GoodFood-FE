import { combineReducers, configureStore } from "@reduxjs/toolkit";
import loginReducer from '../Slices/LoginSlice'
import cartReducer from "../Slices/CartSlice";
import storage from 'redux-persist/lib/storage'
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { setStore } from "../Services/AxiosInstance";

const persistConfig = {
    key: 'root', //key dùng để lưu trữ
    storage,
    whitelist: ["login"],
}

const rootReducer = combineReducers({
    login: loginReducer,
    cart: cartReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware)=> 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

setStore(store);

export default store;
export const persistor = persistStore(store)

//Xuất kiểu RootState và AppDispatch để sử dụng với TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch