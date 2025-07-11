import React, { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import {
    Avatar,
    ChatContainer,
    Conversation,
    ConversationList,
    Message,
    MessageInput,
    MessageList,
    MessagePayload,
    MessageType,
    Sidebar,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import adminAvatar from '../assets/images/software-engineer.png'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { ENDPOINT } from '../App';
import { addDoc, collection, doc, getDocs, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './Firebase';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Services/AxiosInstance';
import { Carts } from '../Interfaces/Carts';
import { addMessage, closeChatbot, openChatbot } from '../Slices/ChatbotSlice';

export type Message = {
    id: number;
    sender: string;
    text: string;
    timestamp: string;
    direction: "incoming" | "outgoing";
    type?: string;
    payload: MessagePayload
};

type function_place_order = {
    carts: Carts[],
    address: string,
    paymentMethod: boolean
}

const ChatBot = () => {
    const navigate = useNavigate();
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: 'tunedModels/fivefoodchatbotmodelnew-ggnlz4us0srt',
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50
        }
    });
    const { user } = useSelector((state: RootState) => state.login);
    const {isOpen, message} = useSelector((state:RootState)=>state.chatbot);
    const dispatch = useDispatch();
    const [currentChat, setCurrentChat] = useState("Chatbot");
    const [botMessages, setBotMessages] = useState<Message[]>([]);
    const [adminMessages, setAdminMessages] = useState<Message[]>([]);
    const [userMessages, setUserMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const senderID = useRef(0);
    const navigateID = useRef(0);
    const [placeOrderState,setPlaceOrderState] = useState<function_place_order>({
        carts: [],
        address: "",
        paymentMethod: false,
    })

    useEffect(() => {
        if (!user?.accountID) return;

        const role = user.role ? "admin" : "user";
        const ws = new WebSocket(`ws://localhost:8080/ws/${role}/${user.accountID}`);
        socketRef.current = ws

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received:", message);
            senderID.current = message.from_id

            const received = {
                id: Date.now(),
                sender: message.fromAdmin ?? message.sender ?? "Unknown",
                text: message.message ?? message.text,
                timestamp: new Date().toLocaleTimeString(),
                direction: "incoming",
            } as Message;
            //user or admin send messages
            const chatId = user.role ? `admin_${user.accountID}` : `user_${user.accountID}`;
            addChatMessage(chatId, received);

            if (user.role) {
                setAdminMessages((prev) => [...prev, received]);
            } else {
                setUserMessages((prev) => [...prev, received]);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket closed");
        };

        return () => {
            ws.close();
        };
    }, [user?.accountID]);

    //đây là lý do
    const loadChatMessages = async () => {
        try {
            let chatId;

            if (user?.role) { // Admin
                chatId = `admin_${user.accountID}`;
            } else { // User
                chatId = `user_${user?.accountID}`;
            }

            // Truy vấn các tin nhắn từ Firestore
            const messagesRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesRef, orderBy("timestamp", "asc"));
            const querySnapshot = await getDocs(q);

            const messages = querySnapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: data.id,
                    sender: data.sender,
                    text: data.text,
                    timestamp: data.timestamp,
                    direction: data.direction,
                } as Message;
            });

            return messages;
        } catch (error) {
            console.error("Lỗi khi tải tin nhắn từ Firestore:", error);
            return [];
        }
    };

    // Gọi hàm để lấy tin nhắn khi tải lại trang
    useEffect(() => {
        const fetchMessages = async () => {
            const messages = await loadChatMessages();
            if (user?.role) {
                setAdminMessages(messages);
            } else {
                setUserMessages(messages);
            }
        };

        fetchMessages();
        console.log(adminMessages);
        console.log(userMessages);
    }, []); // Khi maTaiKhoan thay đổi thì load lại tin nhắn

    const handleChatSelection = (chatOption: string) => {
        setCurrentChat(chatOption);
        if (chatOption === 'Chatbot') {
            //Welcome messages for Chat Bot
            const botWelcomeMessages = [
                {
                    id: Date.now(),
                    sender: "Chat Bot",
                    text: "Hey! I'm your AI assistant. Let me know if you need any help with the website!",
                    timestamp: new Date().toLocaleTimeString(),
                    direction: "incoming",
                    type: "text",
                },
                {
                    id: Date.now() + 1, // Đảm bảo id duy nhất
                    sender: "Function",
                    type: 'function',
                    text: "Which product is the top seller ?",
                    timestamp: new Date().toLocaleTimeString(),
                    direction: "incoming",
                },
                {
                    id: Date.now() + 2,
                    sender: "Function",
                    type: 'function',
                    text: "Does the website has a section to view my orders ?",
                    timestamp: new Date().toLocaleTimeString(),
                    direction: "incoming",
                },
            ] as Message[];
            setBotMessages((prevMessages) => {
                // Lọc ra các tin nhắn chưa có trong danh sách tin nhắn hiện tại
                const newMessages = botWelcomeMessages.filter(
                    (newMessages) => !prevMessages.some((message) => message.text === newMessages.text && message.sender === newMessages.sender)
                );
                return [...prevMessages, ...newMessages]
            })
            console.log(botWelcomeMessages)
        }
        else if (chatOption === 'User') {
            const adminWelcomeMessage = {
                id: Date.now(),
                sender: "Admin",
                text: "Hello! Please feel free to reach out if you need any assistance from the admin teams!",
                timestamp: new Date().toLocaleString(),
                direction: "incoming",
                type: "text",
            } as Message
            setUserMessages((prevMessages) => {
                //Checking if there's already been welcome messages
                const hasWelcomeMessage = prevMessages.some(
                    (message) => message.text === adminWelcomeMessage.text && message.sender === adminWelcomeMessage.sender
                );
                //add in welcome messages if there are none atp
                return hasWelcomeMessage ? prevMessages : [...prevMessages, adminWelcomeMessage];
            })
        }
    }

    useEffect(()=>{
        handleChatSelection(currentChat);
    },[currentChat])

    // Hàm thêm tin nhắn vào Firestore
    const addChatMessage = async (chatId: string, message: Message) => {
        try {
            // Đảm bảo document cha tồn tại với metadata
            const chatRef = doc(db, "chats", chatId);
            await setDoc(chatRef, { createdAt: Timestamp.now() }, { merge: true });

            // Xác thực và chuẩn hóa dữ liệu tin nhắn
            const messageData = {
                id: message.id,
                text: message.text || "",
                sender: message.sender || "unknown",
                timestamp: message.timestamp,
                direction: message.direction || "outgoing",
                type: message.type || "text",
            } as Message;
            //đảm bảo khi lưu bao gồm luôn cả outgoing và incoming trong một collection
            // Lưu tin nhắn vào subcollection "messages"
            await addDoc(collection(db, "chats", chatId, "messages"), messageData);
            console.log("Tin nhắn đã được lưu vào Firestore!", messageData);
        } catch (error) {
            console.error("Lỗi khi lưu tin nhắn vào Firestore:", error);
        }
    };

    const callVertex = async (message: string) => {
        try {
            let response;
            if (user == null){
                response = await axios.post(`${ENDPOINT}/chatbot/call`, { prompt: message })
            }
            response = await axiosInstance.post(`${ENDPOINT}/chatbot/call`, { prompt: message })
            console.log(response);
            return response.data
        } catch (error) {
            console.log(error);
        }
    }

    const handleSendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed) return;

        const isAdmin = !!user?.role;
        const isChatbot = currentChat === 'Chatbot';
        const accountID = user?.accountID || 'Người dùng';
        const timestamp = new Date().toLocaleTimeString();
        let baseMessage = {
            id: Date.now(),
            sender: accountID,
            text: trimmed,
            timestamp: timestamp,
            direction: "outgoing"
        } as Message

        // Nếu đang trò chuyện với ChatBot
        if (isChatbot) {
            setBotMessages((prevMessages) => [...prevMessages, baseMessage]);
            dispatch(addMessage(""));

            const { responseMessage, responseImage, responseCart } = await getBotResponse(trimmed);
            const botMessage = {
                id: Date.now(),
                sender: "Chat Bot",
                text: responseMessage,
                timestamp: new Date().toLocaleTimeString(),
                direction: "incoming",
                type: responseCart ? "navigatePlaceOrder" : "text",
            } as Message;
            const botImageMessage: Message | null = responseImage
                ? {
                    id: Date.now() + 1,
                    sender: "Chat Bot",
                    text: responseImage,
                    timestamp: new Date().toLocaleTimeString(),
                    direction: "incoming",
                    type: "image",
                    payload: responseImage
                }
                : null;

            setBotMessages((prevMessages) => [
                ...prevMessages,
                botMessage,
                ...(botImageMessage ? [botImageMessage] : [])
            ]);

            return;
        }
        //user or admin send messages
        const chatId = isAdmin ? `admin_${accountID}` : `user_${accountID}`;

        isAdmin
            ? setAdminMessages((prev) => [...prev, baseMessage])
            : setUserMessages((prev) => [...prev, baseMessage]);
        dispatch(addMessage(""));
        addChatMessage(chatId, baseMessage);

        //Send to websocket
        if (socketRef.current) {
            if (isAdmin) {
                socketRef.current.send(JSON.stringify({
                    from_id: user.accountID,
                    to_id: senderID.current,
                    sender: `admin_${user.accountID}`,
                    message: message.trim(),
                    timestamp: Date.now()
                }))
            }
            else {
                socketRef.current.send(JSON.stringify({
                    from_id: user?.accountID,
                    sender: `user_${user?.accountID}`,
                    message: message.trim(),
                    timestamp: Date.now()
                }))
            }

        }
    };

    const handleQuickReply = async (quickReplyMessage: string) => {
        const newMessage = {
            id: Date.now(),
            sender: user?.accountID || "Người dùng",
            text: quickReplyMessage,
            timestamp: new Date().toLocaleTimeString(),
            direction: "outgoing",
            type: "text"
        } as Message;
        setBotMessages((prevMessages) => [...prevMessages, newMessage]);

        // Phản hồi từ bot
        const { responseMessage, responseImage } = await getBotResponse(quickReplyMessage);
        const botMessage = {
            id: Date.now() + 1,
            sender: "Chat Bot",
            text: responseMessage,
            timestamp: new Date().toLocaleTimeString(),
            direction: "incoming",
            type: responseImage ? "navigate" : 'text',
        } as Message;
        //tiếp tục append vào cái image cho botMessages
        const botImageMessage: Message | null = responseImage
            ? {
                id: Date.now() + 2,
                sender: "Chat Bot",
                text: '',
                timestamp: new Date().toLocaleTimeString(),
                direction: "incoming",
                type: "image",
                payload: responseImage
            }
            : null;

        setBotMessages((prev) => [
            ...prev,
            botMessage,
            ...(botImageMessage ? [botImageMessage] : [])
        ]);
    };

    //tìm cách để có thể finetune lại model vertex theo format dưới đây
    const getBotResponse = async (input: string) => {
        setIsTyping(true);
        try {
            const result = await callVertex(input);
            let responseMessage = result.data || "Không thể tạo phản hồi!";
            let responseImage = "";
            navigateID.current = result.productID
            const responseCart = result.carts;
            setPlaceOrderState({...placeOrderState,carts: result.carts,paymentMethod: result.paymentMethod == "COD" ? true : false})

            if (result.image !== "") {
                responseImage = result.image;
            }

            return { responseMessage: responseMessage , responseImage, responseCart };
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            return { responseMessage: "ChatBot gặp sự cố!", responseImage: "" };
        } finally {
            setIsTyping(false);
        }
    };

    const handleNavigate = (id: number) => {
        navigate(`/home/product-details/${id}`,{state:{productID:id}});
    }

    const handleNavigateToOrder = () => {
        navigate("/home/payment-details",{state:{listChosenItems: placeOrderState.carts,paymentMethod: placeOrderState.paymentMethod, orderWay: true}});
    }


    return (
        <motion.div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 1000,
            }}
            initial={{ width: "60px", height: "60px", borderRadius: "50%" }}
            animate={{
                width: isOpen ? "600px" : "60px",
                height: isOpen ? "500px" : "60px",
                borderRadius: isOpen ? "16px" : "50%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: isOpen ? "#fff" : "#D95D39",
                    overflow: "hidden",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    position: "relative",
                }}
                onClick={() => dispatch(openChatbot())}
            >
                {!isOpen && (
                    <motion.div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#fff",
                            fontSize: "24px",
                            cursor: "pointer",
                        }}
                    >
                        💬
                    </motion.div>
                )}
                {isOpen && (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#D95D39",
                                color: "#fff",
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                        >
                            <span>Chat Bot</span>
                            <button
                                style={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(closeChatbot());
                                }}
                            >
                                ➖
                            </button>
                        </div>
                        <div style={{ flex: 1, display: "flex" }}>
                            <Sidebar position='left' style={{ width: "200px", borderRight: "1px solid #ddd" }}>
                                <ConversationList>
                                    <Conversation
                                        name="Chat Bot"
                                        info="AI Assistant"
                                        onClick={() => handleChatSelection("Chatbot")}
                                    >
                                        <Avatar src="https://www.svgrepo.com/show/353774/geekbot.svg" name="Chat Bot" />
                                    </Conversation>
                                    {user?.role ? (
                                        <Conversation
                                            name="User"
                                            info="Message from user"
                                            onClick={() => handleChatSelection("Admin")}
                                        >
                                            <Avatar src={adminAvatar} name="User" />
                                        </Conversation>
                                    ) : (
                                        <Conversation
                                            name="Admin"
                                            info="Message from admin"
                                            onClick={() => handleChatSelection("User")}
                                        >
                                            <Avatar src={adminAvatar} name="User" />
                                        </Conversation>
                                    )}
                                </ConversationList>
                            </Sidebar>
                            <ChatContainer style={{ width: "400px", overflowY: "auto", maxHeight: "460px" }}>
                                <MessageList typingIndicator={isTyping && currentChat === "Chatbot" && <TypingIndicator content="Chatbot đang gõ..." />}>
                                    {(currentChat === 'Chatbot' ? botMessages : (user?.role ? adminMessages : userMessages)).map(msg => (
                                        <Message
                                            onClick={msg.type === 'function' ? (() => handleQuickReply(msg.text)) as React.MouseEventHandler<HTMLElement> : msg.type==="navigate" ? (()=>handleNavigate(navigateID.current)) : msg.type==='navigatePlaceOrder' ? (()=>handleNavigateToOrder()) : undefined}
                                            key={msg.id}
                                            style={msg.type === 'function'
                                                ? {
                                                    cursor: 'pointer',
                                                    backgroundColor: '#f0f8ff',  // Màu nền nhẹ để dễ nhận diện
                                                    border: '1px solid #007bff',  // Viền màu xanh để làm nổi bật
                                                    borderRadius: '10px',  // Góc bo tròn
                                                    padding: '5px 10px',  // Thêm khoảng cách bên trong
                                                    fontWeight: 'bold'  // In đậm để dễ nhận diện
                                                }
                                                : msg.type === 'navigate'
                                                ? {
                                                    cursor: 'pointer',
                                                    backgroundColor: '#f0f8ff',  // Màu nền nhẹ để dễ nhận diện
                                                    border: '1px solid #007bff',  // Viền màu xanh để làm nổi bật
                                                    borderRadius: '10px',  // Góc bo tròn
                                                    padding: '5px 10px',  // Thêm khoảng cách bên trong
                                                    fontWeight: 'bold'  // In đậm để dễ nhận diện
                                                } : {}
                                            }
                                            model={{
                                                message: msg.text || (msg.payload ? "Xem chi tiết sản phẩm:" : ""),
                                                sentTime: msg.timestamp,
                                                sender: msg.sender,
                                                direction: msg.direction,
                                                position: "normal",
                                            }}
                                        >
                                            <Avatar
                                                src={
                                                    msg.sender === "Chat Bot"
                                                        ? "https://www.svgrepo.com/show/353774/geekbot.svg"
                                                        : msg.sender === "Admin"
                                                            ? adminAvatar
                                                            : msg.sender === "Function"
                                                                ? "https://www.svgrepo.com/show/188245/pointing-right-finger.svg"
                                                                : "https://www.svgrepo.com/show/341256/user-avatar-filled.svg"
                                                }
                                                name={msg.sender}
                                            />
                                            {/* Nếu là ảnh, render ImageContent */}
                                            {msg.type === "image" && (
                                                <Message.ImageContent
                                                    src={msg.payload as string}
                                                    alt="Ảnh món ăn"
                                                    width={200}
                                                />
                                            )}
                                        </Message>
                                    ))}
                                </MessageList>
                                <MessageInput
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(value) => dispatch(addMessage(value))}
                                    onSend={handleSendMessage}
                                    attachButton={false}
                                />
                            </ChatContainer>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatBot;