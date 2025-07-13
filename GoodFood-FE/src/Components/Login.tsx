import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { login } from "../Slices/LoginSlice";
import "../assets/css/Login.css";
import bgLogin from "../assets/images/GoodFood24h_logo.png";
import Navbar from "./Navbar";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const toUrl = location.state?.from?.pathname || "/home";

    const { isAuthenticated } = useSelector((state: RootState) => state.login);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            clickDangNhap(username, password);
        }
    };

    const clickDangNhap = (username: string, password: string) => {
        dispatch(login({ username, password }));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/home");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="login-container">
            <Navbar></Navbar>
            <div className="login-left">
                <div className="login-image-wrapper">
                    <img src={bgLogin} alt="Login Visual" className="login-image" />
                </div>
            </div>
            <div className="login-right">
                <div className="login-tabs">
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            isActive ? "tab active" : "tab"
                        }
                    >
                        Sign In
                    </NavLink>
                    <NavLink
                        to="/register"
                        className={({ isActive }) =>
                            isActive ? "tab active" : "tab"
                        }
                    >
                        Register
                    </NavLink>
                </div>
                <div className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="submit-button"
                        onClick={() => clickDangNhap(username, password)}
                    >
                        SUBMIT
                    </button>
                    <NavLink to="/forgot-password" className="forgot-password">
                        Forgot Password?
                    </NavLink>
                    <div className="social-login">
                        <span><i className="fa-brands fa-facebook text-lg" style={{color:"#6068e2"}}></i> Facebook</span>
                        <span><i className="fa-brands fa-google"></i> Google+</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
