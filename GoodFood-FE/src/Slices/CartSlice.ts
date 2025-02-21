import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Carts } from "../Interfaces/Carts";
import axiosInstance from "../Services/AxiosInstance";
import { toast } from "react-toastify";
import { logout } from "./LoginSlice";

export interface CartState{
    cart: Carts[] | [],
    error: string | null,
    isLoading: boolean
}

const cartSession: Carts[] = JSON.parse(sessionStorage.getItem("cart") || "null");

const initialState: CartState = {
    cart: cartSession,
    error: null,
    isLoading: false,
}

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ quantity, productID, accountID }: { quantity: number, productID: number, accountID: number }, { rejectWithValue }) => {
        const payload = {
            quantity: quantity,
            productID: productID,
            accountID: accountID,
        }
        try {
            const response = await axiosInstance.post(`cart/add`, payload);
            toast.success(response.data.message);
            return response.data.data
        } catch (error: any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message)
        }
    }
)

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (accountID: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`cart/fetch?accountID=${accountID}`)
            return response.data.data
        } catch (error: any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const modifyQuantityCart = createAsyncThunk(
    "cart/modifyQuantity",
    async({cartID,quantity}:{cartID:number,quantity:number},{rejectWithValue})=>{
        try {
            const response = await axiosInstance.post(`cart/modify?cartID=${cartID}`,{quantity: quantity})
            return response.data.data
        } catch (error: any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const deleteCartItem = createAsyncThunk(
    "cart/delete",
    async(cartID:number,{rejectWithValue})=>{
        try {
            const response = await axiosInstance.delete(`cart/delete?cartID=${cartID}`)
            toast.success("Successfully deleted a cart item");
            return response.data.data
        } catch (error : any) {
            toast.error(error.response.data.message)
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const deleteAllItems = createAsyncThunk(
    "cart/deleteAll",
    async({isDelete,accountID}:{isDelete:boolean,accountID:number},{rejectWithValue})=>{
        try {
            const response = await axiosInstance.delete(`cart/deleteAll?accountID=${accountID}`);
            if(isDelete){
                return response.data
            }
            return;
        } catch (error: any) {
            toast.error(error.response.data.message);
            rejectWithValue(error.response.data.message);
        }
    }
)

const cartSlice = createSlice({
    name: "cart",
    initialState: initialState,
    reducers:{
        testAction: () => { console.log("Hello")}
    },
    extraReducers(builder) {
        builder
            //Add item to cart
            .addCase(addToCart.pending,(state)=>{
                state.isLoading = true;
                state.cart = [];
                state.error = null;
            })
            .addCase(addToCart.fulfilled,(state,action)=>{
                const newItem = action.payload
                state.cart = JSON.parse(sessionStorage.getItem("cart") || "null")
                const existingItem = state.cart.find(item=>item.cartID === newItem.cartID);
                existingItem ? existingItem.quantity = newItem.quantity : (state.cart as Carts[]).push(newItem)
                state.isLoading = false;
                state.error = null
                sessionStorage.setItem("cart",JSON.stringify(state.cart));
            })
            .addCase(addToCart.rejected, (state,action)=>{
                state.isLoading = false
                state.error = action.payload as string
            })
            //Fetch cart
            .addCase(fetchCart.pending,(state)=>{
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled,(state,action)=>{
                state.isLoading = false;
                state.cart = action.payload;
                state.error = null
                sessionStorage.setItem("cart",JSON.stringify(action.payload));
            })
            .addCase(fetchCart.rejected,(state,action)=>{
                state.isLoading = false,
                state.error = action.payload as string
            })
            //Modify quantity
            .addCase(modifyQuantityCart.pending,(state)=>{
                state.isLoading = true;
                state.error = null
            })
            .addCase(modifyQuantityCart.fulfilled,(state,action)=>{
                state.isLoading = false;
                state.error = null;
                const index = state.cart.findIndex(item => item.cartID === action.payload.cartID);
                if (index !== -1) {
                    state.cart[index].quantity = action.payload.quantity;
                }
                sessionStorage.setItem("cart",JSON.stringify(state.cart));
            })
            .addCase(modifyQuantityCart.rejected,(state,action)=>{
                state.isLoading = false
                state.error = action.payload as string
            })
            //Delete cart item
            .addCase(deleteCartItem.pending,(state)=>{
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteCartItem.fulfilled,(state,action)=>{
                state.isLoading = true
                state.error = null
                state.cart = state.cart.filter(item=>item.cartID !== action.payload.cartID)
                sessionStorage.setItem("cart",JSON.stringify(state.cart));
            })
            .addCase(deleteCartItem.rejected,(state,action)=>{
                state.isLoading = false
                state.error = action.payload as string
            })
            //Delete all cart items
            .addCase(deleteAllItems.pending,(state)=>{
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteAllItems.fulfilled,(state,action)=>{
                state.isLoading = false
                state.error = null
                if(action.payload.status === "Success"){
                    state.cart.length = 0
                    sessionStorage.setItem("cart",JSON.stringify(state.cart));
                }
            })
            .addCase(deleteAllItems.rejected,(state,action)=>{
                state.isLoading = false
                state.error = action.payload as string
            })
            .addCase(logout,(state)=>{
                return initialState
            });
    },
})


export default cartSlice.reducer;
export const { testAction } = cartSlice.actions;