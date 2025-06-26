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
    Sidebar,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import adminAvatar from '../assets/images/software-engineer.png'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { ENDPOINT } from '../App';
import { addDoc, collection, doc, getDocs, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './Firebase';
import { useNavigate } from 'react-router-dom';
import User from './Admin/User';

type Message = {
    id: number;
    sender: string;
    text: string;
    timestamp: string;
    direction: "incoming" | "outgoing";
    type?: string;
};

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
    const [isOpen, setIsOpen] = useState(false);
    const [currentChat, setCurrentChat] = useState("Chatbot");
    const [botMessages, setBotMessages] = useState<Message[]>([]);
    const [adminMessages, setAdminMessages] = useState<Message[]>([]);
    const [userMessages, setUserMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const socketRef = useRef<WebSocket | null>(null);
    const senderID = useRef(0);

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
                    id: Number(doc.id),
                    sender: data.sender,
                    text: data.text,
                    timestamp: data.timestamp?.toDate().toLocaleTimeString() ?? "",
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
                    text: "How to view my orders ?",
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
        }
        else if (chatOption === 'User') {
            const adminWelcomeMessage = {
                id: Date.now(),
                sender: "Admin",
                text: "Hello! Please feel free to reach out if you need any assistance from the admin teams!",
                timestamp: new Date().toLocaleString(),
                direction: "incoming"
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

    // Hàm thêm tin nhắn vào Firestore
    const addChatMessage = async (chatId: string, message: Message) => {
        try {
            // Đảm bảo document cha tồn tại với metadata
            const chatRef = doc(db, "chats", chatId);
            await setDoc(chatRef, { createdAt: Timestamp.now() }, { merge: true });

            // Xác thực và chuẩn hóa dữ liệu tin nhắn
            const messageData = {
                text: message.text || "",
                sender: message.sender || "unknown",
                timestamp: Timestamp.now(),
                direction: message.direction || "outgoing",
            };
            //đảm bảo khi lưu bao gồm luôn cả outgoing và incoming trong một collection
            // Lưu tin nhắn vào subcollection "messages"
            await addDoc(collection(db, "chats", chatId, "messages"), messageData);
            console.log("Tin nhắn đã được lưu vào Firestore!", messageData);
        } catch (error) {
            console.error("Lỗi khi lưu tin nhắn vào Firestore:", error);
        }
    };

    const callVertex = async () => {
        try {
            const response = await axios.post(`${ENDPOINT}/chatbot/call`, { prompt: "How do I view my orders?" })
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSendMessage = async () => {
        const trimmed = newMessage.trim();
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
            setNewMessage("");

            const botText = await getBotResponse(trimmed);
            const botMessage = {
                id: Date.now(),
                sender: user?.accountID || "Người dùng",
                text: newMessage,
                timestamp: new Date().toLocaleTimeString(),
                direction: "outgoing",
            } as Message;
            setBotMessages((prevMessages) => [...prevMessages, botMessage]);
            return;
        }
        //user or admin send messages
        const chatId = isAdmin ? `admin_${accountID}` : `user_${accountID}`;

        isAdmin
            ? setAdminMessages((prev) => [...prev, baseMessage])
            : setUserMessages((prev) => [...prev, baseMessage]);
        setNewMessage("");
        addChatMessage(chatId, baseMessage);

        //Send to websocket
        if (socketRef.current) {
            if (isAdmin) {
                socketRef.current.send(JSON.stringify({
                    from_id: user.accountID,
                    to_id: senderID.current,
                    sender: `admin_${user.accountID}`,
                    message: newMessage.trim(),
                    timestamp: Date.now()
                }))
            }
            else {
                socketRef.current.send(JSON.stringify({
                    from_id: user?.accountID,
                    sender: `user_${user?.accountID}`,
                    message: newMessage.trim(),
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
        } as Message;
        setBotMessages((prevMessages) => [...prevMessages, newMessage]);

        // Phản hồi từ bot
        const botResponse = await getBotResponse(quickReplyMessage);
        console.log(botResponse)
        const botMessage = {
            id: Date.now() + 1,
            sender: "Chat Bot",
            text: botResponse,
            timestamp: new Date().toLocaleTimeString(),
            direction: "incoming",
        } as Message;
        setBotMessages((prevMessages) => [...prevMessages, botMessage]);
    };

    // Tách response và intent
    const parseResponse = async (generatedResponse: string) => {
        try {
            const prompt = `
                Analyze the following response and extract two components:
                1. "Response" - The main content or answer.
                2. "Intent" - The identified intent for the given query.

                Response: "${generatedResponse}"

                Ensure you return a single, concise JSON object in the format:
                {
                    "response": "Main content here",
                    "intent": "Intent here"
                }
                Do not include any additional text or repetitions.
            `;

            const result = await model.generateContent(prompt);
            const responseText = await result.response?.text();

            console.log(responseText);

            // Tìm JSON đầu tiên xuất hiện trong phản hồi
            const match = responseText.match(/\{.*?\}/s);
            if (match) {
                return JSON.parse(match[0]);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            return { response: null, intent: null };
        }
    };

    // Function to extract the product name from the user's input (e.g., "Cơm gà")
    const extractProductName = async (userInput: string) => {
        const productKeywords = await axios.get(`${ENDPOINT}/chat-bot/productNames`);  // Add more keywords as needed
        console.log(userInput.toLowerCase());
        for (const keyword of productKeywords.data.data) {
            if (userInput.toLowerCase().includes(keyword.toLowerCase())) {
                return keyword;  // Return the product name found in the user input
            }
        }
        return 'unknown';  // Return 'unknown' if no product is found
    };

    //tìm cách để có thể finetune lại model vertex theo format dưới đây
    const getBotResponse = async (input: string) => {
        setIsTyping(true);
        try {
            const result = await model.generateContent(input);
            let responseMessage = result.response?.text() || "Không thể tạo phản hồi!";

            // Gọi hàm tách giữa response và intent
            const { response: botResponse, intent } = await parseResponse(responseMessage);

            if (intent === 'DYNAMIC' && (botResponse === 'CHECK_PRODUCT_AVAILABILITY' || botResponse === 'GET_PRODUCT_AVAILABILITY')) {
                const extractedVariable = await extractProductName(input);
                console.log("Đây là variable: ", extractedVariable);
                if (extractedVariable === 'unknown') {
                    return `Chúng tôi không có sản phẩm mà bạn đã yêu cầu`;
                }
                const callApi = await axios.get(`${ENDPOINT}/chat-bot/${botResponse}?keyword=${extractedVariable}`);
                // Tạo đường dẫn với sản phẩm
                const productLink = `/home/product-details/${callApi.data.data}`;

                // Trả về tin nhắn có đường dẫn
                return `Bạn đã đặt câu hỏi về <a onClick=${handleNavigate(productLink)} style="color: blue; text-decoration: underline;">${extractedVariable}</a>`;
            } else if (intent === 'DYNAMIC' && botResponse === 'GET_TOP_PRODUCT') {
                const callApi = await axios.get(`${ENDPOINT}/chat-bot/${botResponse}`);
                console.log(callApi.data.data);
                // Tạo đường dẫn với sản phẩm
                const productLink = `/home/product-details/${callApi.data.data[0]}`;

                // Trả về tin nhắn có đường dẫn
                return `Sản phẩm bán chạy nhất hiện tại là <a onClick=${handleNavigate(productLink)} style="color: blue; text-decoration: underline;">${callApi.data.data[1]}</a> với tổng ${callApi.data.data[2]} lượt bán`;
            }
            return botResponse;
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            return "ChatBot gặp sự cố!";
        } finally {
            setIsTyping(false);
        }
    };

    const handleNavigate = (productLink: string) => {
        navigate(productLink);
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
                onClick={() => setIsOpen(true)}
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
                                    setIsOpen(false);
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
                                            onClick={msg.type === 'function' ? (() => handleQuickReply(msg.text)) as React.MouseEventHandler<HTMLElement> : undefined}
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
                                                : {}
                                            }
                                            model={{
                                                message: msg.text,
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
                                        </Message>
                                    ))}
                                </MessageList>
                                <MessageInput
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(value) => setNewMessage(value)}
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