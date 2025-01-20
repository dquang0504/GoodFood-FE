import React, { useContext, useEffect, useState } from 'react';
import '../assets/css/Login.css'
import bgLogin from '../assets/images/backgrounddangnhap.png';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import { login } from '../Slices/LoginSlice';


const Login = () => {
    
    //local states
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [message,setMessage] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const {error,isAuthenticated,isLoading,user} = useSelector((state:RootState)=>state.login)

    // const { updateTaiKhoan } = useContext(AuthContext);

    const navigate = useNavigate();
    const location = useLocation();
    const toUrl = location.state?.from?.pathname || '/home';
    // const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>)=>{
        if (event.key == "Enter"){
            clickDangNhap(username,password);
        }
    }

    const clickDangNhap = async(username: string, password: string)=>{
        dispatch(login({username,password}))
    }

    useEffect(()=>{
        if(isAuthenticated){
            navigate('/home')
        }
    })

    return (
        <>
            <div className='login'>
                <div className='div-image'>
                    <img src={bgLogin} alt='Logo Login' />
                </div>
                <div className="div-main">
                    <div className="d-flex justify-content-center">
                        <div className="card">
                            <div className="card-body">
                                <div className="text-center fs-2 fw-bold">Đăng nhập</div>
                                <div className="mt-4">
                                    <div>
                                        <div className="d-flex justify-content-center div-input">
                                            <div className="input-box" >
                                                <div className='d-flex justify-content-center'>
                                                    <i className="fa-solid fa-user"></i>
                                                    <input type="text"
                                                        placeholder="Tài khoản"
                                                        className=''
                                                        value={username !== undefined ? username : ''}
                                                        onChange={(event) => { setUsername(event.target.value); setMessage(""); }}
                                                    />
                                                </div>
                                                <span className='text-danger'>{message}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center div-input">
                                            <div className="input-box" >
                                                <div className='d-flex justify-content-center'>
                                                    <i className="fa-solid fa-lock"></i>
                                                    <input type="password"
                                                        placeholder="Mật khẩu"
                                                        className=''
                                                        value={password !== undefined ? password : ''}
                                                        onChange={(event) => { setPassword(event.target.value); setMessage(""); }}
                                                        onKeyDown={(event) => handleKeyDown(event)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-1">
                                            <div className="row div-cuoi">
                                                <div className="col-md-6">
                                                </div>
                                                <div className="col-md-6 d-flex justify-content-end">
                                                    <NavLink className="nav-link" to={"/forgot-password"}>Quên mật khẩu</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-2 div-button">
                                            <div className="d-flex justify-content-center mt-1">
                                                <button className="btn btn-primary " onClick={() => clickDangNhap(username,password)}>Đăng nhập</button>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-1">
                                            Hoặc
                                        </div>
                                        <div className="d-flex justify-content-center mt-1 div-button">
                                            <div className="d-flex justify-content-center">
                                                {/* <GoogleOAuthProvider clientId={googleClientId}>
                                                    <GoogleLogin
                                                        onSuccess={handleSuccess}
                                                        onError={handleFailure}
                                                        style={{ width: "210px" }}
                                                    />
                                                </GoogleOAuthProvider> */}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-3 div-button">
                                            Bạn chưa có tài khoản? &nbsp;<NavLink className="nav-link" to={"/register"}>Đăng ký</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Login;