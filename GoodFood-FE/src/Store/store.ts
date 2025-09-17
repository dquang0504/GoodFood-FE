import { combineReducers, configureStore } from "@reduxjs/toolkit"; 
import loginReducer, { logout } from '../Slices/LoginSlice'
import cartReducer from "../Slices/CartSlice";
import chatbotReducer from "../Slices/ChatbotSlice"
import updateAccountReducer from "../Slices/UpdateAccountSlice"
import storage from 'redux-persist/lib/storage'
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { createFilter } from 'redux-persist-transform-filter';

const loginTransform = createFilter('login', ['user','isAuthenticated']);

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ["login","cart"],
    transforms: [loginTransform],
};

const rootReducer = combineReducers({
    login: loginReducer,
    cart: cartReducer,
    update: updateAccountReducer,
    chatbot: chatbotReducer,
});

const persistedReducer = persistReducer<any, any>(persistConfig, rootReducer);

// --- Middleware để xử lý forceLogout (dispatch từ interceptor)
const forceLogoutMiddleware = (storeAPI: any) => (next: any) => async (action: any) => {
    if (action.type === "auth/forceLogout") {
        // 1. clear redux login
        storeAPI.dispatch(logout());
        // 2. purge persist
        await persistor.purge();
        // 3. clear sessionStorage
        sessionStorage.clear();
        localStorage.clear();
    }
    return next(action);
};

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware)=> 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(forceLogoutMiddleware),
})

export default store;
export const persistor = persistStore(store)

// Xuất kiểu RootState và AppDispatch để sử dụng với TypeScript
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
