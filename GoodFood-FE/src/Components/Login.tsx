import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { login, loginFacebook, loginGoogle } from "../Slices/LoginSlice";
import "../assets/css/Login.css";
import bgLogin from "../assets/images/GoodFood24h_logo.png";
import Navbar from "./Navbar";
import { Users } from "../Interfaces/Users";
import axios from "axios";
import { ENDPOINT } from "../App";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google"
import FacebookLogin from "./FacebookLogin";

const Login = () => {
    const {state} = useLocation();
    console.log(state?.isLogin)
    const [isLoginTab, setIsLoginTab] = useState(state ? state.isLogin : true);

    // Login state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const toUrl = location.state?.from?.pathname || "/home";
    const { isAuthenticated} = useSelector((state: RootState) => state.login);
    const googleID = import.meta.env.VITE_GOOGLE_CLIENT_ID

    useEffect(() => {
        if (isAuthenticated) {
            navigate(toUrl);
        }
    }, [isAuthenticated, navigate, toUrl]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            dispatch(login({ username, password }));
        }
    };

    // Register state
    const initialRegister: Users = {
        accountID: 0,
        avatar: "",
        email: "",
        fullName: "",
        gender: false,
        password: "",
        phoneNumber: "",
        role: false,
        status: true,
        username: "",
    };
    const [register, setRegister] = useState<Users>(initialRegister);
    const [confirmPass, setConfirmPass] = useState("");
    const [err, setErr] = useState({
        errName: "",
        errUsername: "",
        errPhone: "",
        errEmail: "",
        errPassword: "",
        errConfirm: "",
    });

    const basicValidation = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const value = e.target.value;
        switch (fieldName) {
            case "fullname":
                setErr({ ...err, errName: value ? "" : "Please input your fullname!" });
                setRegister({ ...register, fullName: value });
                break;
            case "username":
                setErr({ ...err, errUsername: value ? "" : "Please input your username!" });
                setRegister({ ...register, username: value });
                break;
            case "phone":
                if (!value) setErr({ ...err, errPhone: "Please input your phone number!" });
                else if (!/^(0[3-9])\d{8}$/.test(value)) setErr({ ...err, errPhone: "Invalid phone number!" });
                else setErr({ ...err, errPhone: "" });
                setRegister({ ...register, phoneNumber: value });
                break;
            case "email":
                if (!value) setErr({ ...err, errEmail: "Please input your email!" });
                else if (!/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)) setErr({ ...err, errEmail: "Invalid email!" });
                else setErr({ ...err, errEmail: "" });
                setRegister({ ...register, email: value });
                break;
            case "password":
                if (!value) setErr({ ...err, errPassword: "Please input your password!" });
                else if (value.length < 8) setErr({ ...err, errPassword: "At least 8 characters long for password!" });
                else setErr({ ...err, errPassword: "" });
                setRegister({ ...register, password: value });
                break;
        }
    };

    useEffect(() => {
        setErr(prev => ({
            ...prev,
            errConfirm: confirmPass !== register.password ? "Password does not match!" : ""
        }));
    }, [confirmPass, register.password]);

    const handlePost = async () => {
        const valid = Object.values(err).every(e => e === "");
        if (valid) {
            try {
                const response = await axios.post(`${ENDPOINT}/user/register`, register);
                toast.success(response.data.message);
                setRegister(initialRegister);
                setConfirmPass("");
                setIsLoginTab(true);
            } catch (error: any) {
                setErr(prev => ({ ...prev, ...error.response.data.err }));
            }
        }else{
            toast.error("Please check the displayed errors!");
        }
    };

    const handleFacebookLogin = async(accessToken: string)=>{
        try {
            const response = dispatch(loginFacebook(accessToken))
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="login-container">
            <Navbar />
            <div className="login-left">
                <div className="login-image-wrapper">
                    <img src={bgLogin} alt="Login Visual" className="login-image" />
                </div>
            </div>
            <div className="login-right">
                <div className="login-tabs">
                    <div className={`tab ${isLoginTab ? "active" : ""}`} style={{cursor:"pointer"}} onClick={() => setIsLoginTab(true)}>Sign In</div>
                    <div className={`tab ${!isLoginTab ? "active" : ""}`} style={{cursor:"pointer"}} onClick={() => setIsLoginTab(false)}>Register</div>
                </div>

                <AnimatePresence mode="wait">
                    {isLoginTab ? (
                        <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.3 }}
                        className="login-form"
                        >
                        {/* Nội dung form login */}
                            <div className="login-form">
                                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
                                <button className="submit-button" onClick={() => dispatch(login({ username, password }))}>SUBMIT</button>
                            </div>
                            <GoogleOAuthProvider clientId={googleID}>
                                <GoogleLogin onSuccess={async(credentialResponse)=>{
                                    const accessToken = credentialResponse.credential;
                                    if (!accessToken) return "Failed"; 
                                    const response = await dispatch(loginGoogle(accessToken))
                                    console.log(response);
                                    toast.error(response.payload);
                                }} onError={()=>console.log("Login failed")}>

                                </GoogleLogin>
                            </GoogleOAuthProvider>
                            <FacebookLogin onLoginSuccess={handleFacebookLogin} />
                        </motion.div>
                    ) : (
                        <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="login-form"
                        >
                        {/* Nội dung form register */}
                            <div className="login-form">
                                <input type="text" placeholder="Full Name" value={register.fullName} onChange={(e) => basicValidation(e, "fullname")} />
                                <span className="text-danger">{err.errName}</span>

                                <input type="text" placeholder="Username" value={register.username} onChange={(e) => basicValidation(e, "username")} />
                                <span className="text-danger">{err.errUsername}</span>

                                <input type="text" placeholder="Phone Number" value={register.phoneNumber} onChange={(e) => basicValidation(e, "phone")} />
                                <span className="text-danger">{err.errPhone}</span>

                                <input type="email" placeholder="Email" value={register.email} onChange={(e) => basicValidation(e, "email")} />
                                <span className="text-danger">{err.errEmail}</span>

                                <input type="password" placeholder="Password" value={register.password} onChange={(e) => basicValidation(e, "password")} />
                                <span className="text-danger">{err.errPassword}</span>

                                <input type="password" placeholder="Confirm Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                                <span className="text-danger">{err.errConfirm}</span>

                                <button className="submit-button" onClick={handlePost}>REGISTER</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Login;
