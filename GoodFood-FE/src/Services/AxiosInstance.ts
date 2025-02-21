import axios from "axios";
import { refreshAccessToken } from "../Slices/LoginSlice";

let storeRef : any = null;

export const setStore = (store:any)=>{
    storeRef = store
}

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/",
    withCredentials: true, // Quan trọng: Gửi Cookie refreshToken lên server
});

// Thêm Interceptor để refresh token tự động
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = storeRef.getState().login.accessToken; // Lấy token từ sessionStorage
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gọi action refreshAccessToken để lấy token mới
                const newAccessToken = await storeRef.dispatch(refreshAccessToken()).unwrap();

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;