import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginState } from "./LoginSlice";
import { Users } from "../Interfaces/Users";
import axiosInstance from "../Services/AxiosInstance";
import { toast } from "react-toastify";

const initialState: LoginState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    error: null,
    isLoading: false,
    resetToken: null,
}

const updateAccountSlice = createSlice({
    name: 'updateAccount',
    initialState: initialState,
    reducers: {

    },
    extraReducers(builder){
        builder
            .addCase(updateAccontInfo.pending,(state)=>{
                state.isLoading = true
                state.error = null
            })
            .addCase(updateAccontInfo.fulfilled, (state,action)=>{
                state.error = null
                state.isAuthenticated = true
                state.isLoading = false
                if (state.user){
                    state.user.avatar = action.payload.avatar;
                }
            })
            .addCase(updateAccontInfo.rejected, (state,action)=>{
                state.error = action.payload as string;
                state.isLoading = false
            })
    },
})

export const updateAccontInfo = createAsyncThunk(
    "updateAccountInfo",
    async({accountID, accountInfo}: {accountID: number, accountInfo: Users},{rejectWithValue})=>{
        try {
            const response = await axiosInstance.put(`user/update?accountID=${accountID}`,accountInfo,{withCredentials: true})
            console.log(response.data.data);
            return response.data.data;
        } catch (error: any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export default updateAccountSlice.reducer;