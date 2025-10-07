import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINT } from '../App';
import { toast } from 'react-toastify';
import { clearCart } from './CartSlice';

interface SelectedUserFields {
    accountID: number,
    role: boolean,
    username: string
    avatar: string,
    fullName: string,
    email: string,
    phoneNumber: string,
}

export interface LoginState {
    isAuthenticated: boolean,
    user: SelectedUserFields | null,
    accessToken: string | null
    error: string | null,
    isLoading: boolean,
    resetToken: string | null,
}

const initialState: LoginState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    error: null,
    isLoading: false,
    resetToken: null,
}

const loginSlice = createSlice({
    name: 'login',
    initialState: initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        setResetToken(state, action) {
            state.resetToken = action.payload;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.error = null;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false
            })
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, () => {
                return initialState
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.accessToken = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(refreshAccessToken.rejected, () => {
                return initialState
            })
            .addCase(loginGoogle.pending, (state) => {
                state.isLoading = true
                state.error = null;
            })
            .addCase(loginGoogle.fulfilled, (state, action) => {
                state.error = null;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
            })
            .addCase(loginGoogle.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false
            })
            .addCase(loginFacebook.pending, (state) => {
                state.isLoading = true
                state.error = null;
            })
            .addCase(loginFacebook.fulfilled, (state, action) => {
                state.error = null;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
            })
            .addCase(loginFacebook.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false
            })
    },
})

export const login = createAsyncThunk(
    "login/login",
    async ({ username, password }: { username: string, password: string }, { rejectWithValue }) => {
        const payload = {
            username,
            password
        }
        try {
            const response = await axios.post(`${ENDPOINT}/user/login`, payload, { withCredentials: true });
            toast.success("Successfully logged in!");
            return response.data.data;
        } catch (error: any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const logout = createAsyncThunk(
    "login/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${ENDPOINT}/user/logout`, { withCredentials: true });
            return response.data.data;
        } catch (error: any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const refreshAccessToken = createAsyncThunk(
    "login/refreshAccessToken",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${ENDPOINT}/user/refresh-token`, {}, { withCredentials: true });
            return response.data.accessToken;
        } catch (error: any) {
            console.error("refreshAccessToken failed: ", error);
            sessionStorage.clear();
            clearCart();
            return rejectWithValue("Your session has run out. Please login again!");
        }
    }
);

export const loginGoogle = createAsyncThunk(
    "login/google",
    async (accessToken: string, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${ENDPOINT}/user/login/google`, { accessToken: accessToken }, { withCredentials: true });
            return response.data.data
        } catch (error: any) {
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const loginFacebook = createAsyncThunk(
    "login/facebook",
    async (accessToken: string, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${ENDPOINT}/user/login/facebook`, { accessToken: accessToken }, { withCredentials: true });
            return response.data.data
        } catch (error: any) {
            console.log(error.response.data.message);
            return rejectWithValue(error.response.data.message);
        }
    }
)

export default loginSlice.reducer;
export const { setUser } = loginSlice.actions
export const { setResetToken } = loginSlice.actions