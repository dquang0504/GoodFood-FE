import React, { useState } from 'react';
import bgLogin from '../assets/images/backgrounddangnhap.png';
import '../assets/css/Forgotpassword.css'
import { Button, Card, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

interface ForgotPassword{
    email: string,
    codeOTP: string,
}
const ForgotPassword = () => {

    const initialForgot: ForgotPassword = {
        codeOTP: "",
        email: "",
    }
    const [forgot,setForgot] = useState<ForgotPassword>(initialForgot);
    const [err,setErr] = useState({
        errEmail: "",
        errCodeOTP: "",
    })
    const [isSent,setIsSent] = useState(false);

    const clickSendOTP = async()=>{
        setIsSent(true);
        try {
            
        } catch (error) {
            
        }
    }

    const clickNext = ()=>{

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
                                        <div className="d-flex justify-content-between div-input" style={{ width: '320px' }}>
                                            <div className="input-box">
                                                <div className="input-dau">
                                                    <i className="fa-solid fa-key"></i>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Mã xác nhận" 
                                                        name="OTP" 
                                                        className=""
                                                        value={forgot.codeOTP}
                                                        onChange={(e) => basicValidation(e,"codeOTP")}
                                                    />
                                                </div>
                                                <span className="text-danger">{err.errCodeOTP}</span>
                                            </div>
                                            <div className="input-box">
                                                <div className="input-dau">
                                                    <Button className="btn btn-primary " onClick={clickSendOTP}>Send OTP</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-1 div-button">
                                        <div className="d-flex justify-content-center mt-3">
                                            <Button type="button" className="btn btn-primary " onClick={clickNext} disabled={!isSent}>Tiếp tục</Button>
                                        </div>
                                        <div className="d-flex justify-content-center mt-3">
                                            <NavLink className="btn btn-secondary " to={"/login"}>Trở lại</NavLink>
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