import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../Components/ChatBot";

export interface ChatbotState{
    isOpen: boolean,
    message: string;
    error: string | null;
}

const initialState: ChatbotState = {
    isOpen: false,
    error: null,
    message: ""
}

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        openChatbot(state){
            state.isOpen = true;
        },
        closeChatbot(state){
            state.isOpen = false;
        },
        toggleChatbot(state){
            state.isOpen = !state.isOpen;
        },
        addMessage(state, action){
            state.message = action.payload;
        }
    },
    extraReducers: (builder) => {
        // builder.addCase(fetchChatbotStuff.pending, (state) => {...})
    },
})

export const {
  openChatbot,
  closeChatbot,
  toggleChatbot,
  addMessage,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;