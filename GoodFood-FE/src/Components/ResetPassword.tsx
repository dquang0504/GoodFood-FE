import React, { useEffect, useState } from 'react';
import '../assets/css/Resetpassword.css';
import bgLogin from '../assets/images/backgrounddangnhap.png';
import { Button } from 'react-bootstrap';
import {NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINT } from '../App';
import { toast } from 'react-toastify';

interface ResetPass{
    newPass: string,
    confirmPass: string,
    email: string,
}
const ResetPassword = () => {
    const navigate = useNavigate();
    const initialReset: ResetPass = {
        confirmPass: "",
        newPass: "",
        email: "",
    }
    const [resetPass,setResetPass] = useState<ResetPass>(initialReset);
    const [err,setErr] = useState({
        errNewPass: "",
        errConfirm: "",
    })
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get('token');
    const [isValid,setIsValid] = useState(false);

    const basicValidation = (e:React.ChangeEvent<HTMLInputElement>,fieldName: string) =>{
        if (fieldName === "newPass"){
            if (e.target.value.length <= 7){
                setErr({...err,errNewPass: "Password needs to be at least 8 characters!"})
            }else{
                setErr({...err,errNewPass: ""})
            }
            setResetPass({...resetPass,newPass: e.target.value})
        }
    }

    const clickXacNhan = async()=>{
        if(
            err.errNewPass === "" && err.errConfirm === ""
        ){
            try {
                const response = await axios.post(`${ENDPOINT}/user/forgot-password/reset?token=${paramValue}`,resetPass);
                toast.success(response.data.message);
                setResetPass(initialReset);
                navigate("/login");
            } catch (error: any) {
                console.log(error);
                setErr({...err,errNewPass: error.response.data.message})
            }
        }else{
            toast.error("Please check the displayed errors!");
        }
    }

    useEffect(()=>{
        if(resetPass.newPass !== resetPass.confirmPass){
            setErr({...err,errConfirm: "Password does not match!"})
        }else{
            setErr({...err,errConfirm: ""})
        }
    },[resetPass.newPass,resetPass.confirmPass])

    useEffect(()=>{
        const validate = async()=>{
            try {
                const response = await axios.get(`${ENDPOINT}/user/forgot-password/validate?token=${paramValue}`);
                setIsValid(response.data.isValid);
                setResetPass({...resetPass,email:response.data.email})
                console.log(response);
            } catch (error) {
                console.log(error);
            }
        }
        validate();
    },[])

    return (
        <div className="confirmforgotpassword">
            <div className="div-image">
                <img src={bgLogin} alt='Login background' />
            </div>
            <div className="div-main">
                <div className="d-flex justify-content-center">
                    {isValid ? (
                        <div className="card">
                            <div className="card-body">
                                <div className="text-center fs-2 fw-bold">Reset Password</div>
                                <div className="mt-4">
                                    <form>
                                        <div className="d-flex justify-content-center div-input">
                                            <div className="input-box">
                                                <div>
                                                    <i className="fa-solid fa-lock"></i>
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={resetPass.newPass}
                                                        onChange={(e) => basicValidation(e,"newPass")}
                                                    />
                                                    <div className="text-danger mt-1">{err.errNewPass}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center div-input mt-1">
                                            <div className="input-box">
                                                <div>
                                                    <i className="fa-solid fa-lock"></i>
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm New Password"
                                                        value={resetPass.confirmPass}
                                                        onChange={(e) => setResetPass({...resetPass,confirmPass: e.target.value})}
                                                    />
                                                </div>
                                                <div className="text-danger mt-1">{err.errConfirm}</div>
                                            </div>

                                        </div>
                                        <div className="d-flex justify-content-center mt-1 div-button">
                                            <div className="d-flex justify-content-center mt-3">
                                                <NavLink className="btn  nav-link" to={"/login"}>Return</NavLink>
                                            </div>
                                            <div className="d-flex justify-content-center mt-3">
                                                <Button type="button" className="btn btn-primary " onClick={clickXacNhan} >Reset</Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ):(
                        <div className="invalid-reset-wrapper">
                            <div className="invalid-reset-box">
                                <i className="fa-solid fa-triangle-exclamation warning-icon"></i>
                                <h4 className="text-danger mt-3">Reset Link Invalid or Expired</h4>
                                <p className="mt-2 text-center">
                                    Your password reset link is either <b>invalid</b> or has <b>expired</b>. <br />
                                    Please <NavLink to="/forgot-password" className="text-link">request a new one</NavLink>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;