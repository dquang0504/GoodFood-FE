import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINT } from '../App';
import { toast } from 'react-toastify';
import { Users } from '../Interfaces/Users';

export interface LoginState{
    isAuthenticated: boolean,
    user: Users | null,
    accessToken: string | null
    error: string | null,
    isLoading: boolean
}

const initialState: LoginState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    error: null,
    isLoading: false,

}

const loginSlice = createSlice({
    name: 'login',
    initialState: initialState,
    reducers: {
        logout(state){
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null
        },
    },
    extraReducers(builder) {
        builder
            .addCase(login.pending, (state)=>{
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action)=>{
                state.error = null;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken
            })
            .addCase(login.rejected, (state,action)=>{
                state.error = action.payload as string;
                state.isLoading = false
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.accessToken = action.payload;
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
            })
    },
})

export const login = createAsyncThunk(
    "login/login",
    async({username,password}: {username: string, password: string}, {rejectWithValue})=>{
        try {
            const response = await axios.get(`${ENDPOINT}/user/login?username=${username}&password=${password}`,{withCredentials: true});
            toast.success("Successfully logged in!")
            // sessionStorage.setItem("user",JSON.stringify(response.data.data.user));
            // sessionStorage.setItem("token",response.data.data.token);
            // console.log(response.data.data);
            return response.data.data;
        } catch (error : any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const refreshAccessToken = createAsyncThunk(
    "login/refreshAccessToken",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${ENDPOINT}/user/refresh-token`, {
                withCredentials: true, // Gửi refreshToken từ Cookie
            });

            return response.data.accessToken;
        } catch (error: any) {
            return rejectWithValue("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        }
    }
);

export default loginSlice.reducer;
export const {logout} = loginSlice.actions