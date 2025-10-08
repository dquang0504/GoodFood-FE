import axios from "axios";
import { refreshAccessToken } from "../Slices/LoginSlice";
import type { RootState } from "../Store/store";
import type { Store } from "redux";

let storeRef: Store<RootState> | null = null;
export const setStore = (store: Store<RootState>) => { storeRef = store; };

// const ENDPOINT = "http://127.0.0.1:8080/api"
const ENDPOINT = "http://localhost:8080/api"

const axiosInstance = axios.create({
    baseURL: ENDPOINT,
    withCredentials: true,
});

// --- Refresh Token Queue ---
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (error: unknown) => void; config: any }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(p => {
        if (error) {
            p.reject(error);
        } else {
            if (token && p.config.headers) {
                p.config.headers["Authorization"] = `Bearer ${token}`;
            }
            p.resolve(axiosInstance(p.config));
        }
    });
    failedQueue = [];
};

// --- Request Interceptor ---
axiosInstance.interceptors.request.use((config) => {
    if (storeRef) {
        const state = storeRef.getState();
        const accessToken = state.login.accessToken;
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
    }
    return config;
});

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && storeRef) {
            if (isRefreshing) {
                // Đợi refresh xong rồi retry
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // gọi refreshAccessToken (backend sẽ đọc cookie refresh)
                const newToken = await storeRef.dispatch<any>(refreshAccessToken()).unwrap();

                processQueue(null, newToken);

                if (newToken && originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                }

                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                storeRef.dispatch({ type: "auth/forceLogout" });
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
