import React, { useState } from 'react';
import bgLogin from '../assets/images/backgrounddangnhap.png';
import '../assets/css/Forgotpassword.css'
import { Button, Card, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINT } from '../App';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../Store/store';
import { setResetToken } from '../Slices/LoginSlice';

interface ForgotPassword{
    email: string,
    codeOTP: string,
}
const ForgotPassword = () => {
    const dispatch = useDispatch<AppDispatch>();
    const initialForgot: ForgotPassword = {
        codeOTP: "",
        email: "",
    }
    const [forgot,setForgot] = useState<ForgotPassword>(initialForgot);
    const [err,setErr] = useState({
        errEmail: "",
        errCodeOTP: "",
    })

    const clickSendMail = async()=>{
        if(
            err.errEmail === "" && err.errCodeOTP === ""
        ){
            try {
                const response = await axios.post(`${ENDPOINT}/user/forgot-password/sendOTP`,forgot);
                console.log(response)
                toast.info(response.data.message);
                dispatch(setResetToken(response.data.data));
            } catch (error: any) {
                console.log(error);
                setErr({...err,errEmail: error.response.data.message})
            }
        }
    }


    const basicValidation = (e:React.ChangeEvent<HTMLInputElement>, fieldName: string)=>{
        if (fieldName === "email"){
            if (e.target.value.length <= 0){
                setErr({...err,errEmail: "Please input your email!"});
            }else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})?$/.test(e.target.value)){
                setErr({...err,errEmail:"Invalid email!"})
            }
            else{
                setErr({...err,errEmail: ""});
            }
            setForgot({...forgot,email: e.target.value});
        }
        if (fieldName === "codeOTP"){
            if (e.target.value.length <= 0){
                setErr({...err,errCodeOTP: "Please input the OTP that you received!"});
            }else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})?$/.test(e.target.value)){
                setErr({...err,errCodeOTP:"Invalid OTP Code!"})
            }
            else{
                setErr({...err,errCodeOTP: ""});
            }
            setForgot({...forgot,codeOTP: e.target.value});
        }
    }

    return (
        <div className="quenmatkhau">
            <div className="div-image">
                <img src={bgLogin} alt='Logo Login' />
            </div>
            <div className="div-main">
                <div className="d-flex justify-content-center">
                    <Card>
                        <Card.Body>
                            <div className="text-center fs-2 fw-bold">Forgot Password</div>
                            <div className="mt-4">
                                <Form>
                                    <div className="d-flex justify-content-center div-input">
                                        <div className="input-box">
                                            <div>
                                                <i className="fa-solid fa-envelope"></i>
                                                <input 
                                                    type="text" 
                                                    placeholder="Email" 
                                                    name="email" 
                                                    className=""
                                                    value={forgot.email}
                                                    onChange={(e) => basicValidation(e,"email")}
                                                />
                                            </div>
                                            <span className="text-danger">{err.errEmail}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="d-flex justify-content-center div-input" style={{ width: '320px' }}>
                                            <div className="input-box mx-2">
                                                <div className="input-return">
                                                    <NavLink className="btn btn-secondary" to={"/login"}>Return</NavLink>
                                                </div>
                                            </div>
                                            <div className="input-box mx-2">
                                                <div className="input-dau">
                                                    <Button className="btn btn-primary " onClick={clickSendMail}>Reset</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-1 div-button">
                                        <div className="d-flex justify-content-center mt-3">
                                            
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;