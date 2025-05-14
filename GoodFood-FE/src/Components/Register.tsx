import React, { useEffect, useState } from 'react';
import bgLogin from '../assets/images/backgrounddangnhap.png'
import '../assets/css/Register.css'
import { NavLink } from 'react-router-dom';
import { Users } from '../Interfaces/Users';
import axios from 'axios';
import { ENDPOINT } from '../App';
import { toast } from 'react-toastify';

const Register = () => {

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
    }
    const [register,setRegister] = useState<Users>(initialRegister);
    const [confirmPass,setConfirmPass] = useState("");
    const [err,setErr] = useState({
        errName: "",
        errUsername: "",
        errPhone: "",
        errEmail: "",
        errPassword: "",
        errConfirm: "",
    })

    const clickDangKy = async()=>{

    }

    const basicValidation = (e: React.ChangeEvent<HTMLInputElement>,fieldName: string)=>{
        if (fieldName === "fullname"){
            if (e.target.value.length <= 0){
                setErr({...err,errName:"Please input your fullname!"});;
            }
            else{
                setErr({...err,errName:""});
            }
            setRegister({...register,fullName: e.target.value})
        }
        else if(fieldName === "username"){
            if (e.target.value.length <= 0){
                setErr({...err,errUsername:"Please input your username!"});;
            }
            else{
                setErr({...err,errUsername:""});
            }
            setRegister({...register,username: e.target.value})
        }
        else if(fieldName === "phone"){
             if(e.target.value===""){
                setErr({...err,errPhone:"Please input your phone number!"})
            }
            else if(!/^(0[3-9])\d{8}$/.test(e.target.value)){
                setErr({...err,errPhone:"Invalid phone number!"})
            }
            else{
                setErr({...err,errPhone:""})
            }
            setRegister({...register,phoneNumber: e.target.value})
        }
        else if(fieldName === "email"){
            if(e.target.value===""){
                setErr({...err,errEmail:"Please input your email!"})
            }
            else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})?$/.test(e.target.value)){
                setErr({...err,errEmail:"Invalid email!"})
            }
            else{
                setErr({...err,errEmail:""})
            }
            setRegister({...register,email: e.target.value})
        }
        else if(fieldName === "password"){
            if (e.target.value.length <= 0){
                setErr({...err,errPassword:"Please input your password!"});
            }
            else if(e.target.value.length >=0 && e.target.value.length <= 7){
                setErr({...err,errPassword:"At least 8 characters long for password!"});
            }
            else{
                setErr({...err,errPassword:""});
            }
            setRegister({...register,password: e.target.value})
        }
        
    }

    useEffect(()=>{
        if(confirmPass !== register.password){
            setErr({...err,errConfirm:"Password does not match!"});
        }else{
            setErr({...err,errConfirm: ""})
        }
    },[confirmPass,register.password])

    const resetForm = ()=>{
        setRegister(initialRegister);
        setConfirmPass("");
    }

    const handlePost = async()=>{
        console.log(err)
        if(err.errConfirm === "" && err.errEmail === ""
            && err.errName === "" && err.errPassword === ""
            && err.errPhone === "" && err.errUsername === ""
        ){
            try {
                console.log(register);
                const response = await axios.post(`${ENDPOINT}/user/register`,register);
                console.log(response);
                toast.success(response.data.message);
                resetForm();
            } catch (error: any) {
                console.log(error);
                setErr(prev=>({
                    ...prev,
                    ...error.response.data.err
                }));
            }
        }
    }

    return (
        <div className='register'>
            <div className="div-image">
                <img src={bgLogin} alt='Logo Login' />
            </div>
            <div className='div-main'>
                <div className='d-flex justify-content-center mt-2'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className="text-center fs-2 fw-bold">Register</div>
                            <div className='mt-4'>
                                <form>
                                    <div className='d-flex justify-content-center div-input'>
                                        <div className='input-box'>
                                            <div>
                                                <i className='fa-solid fa-user'></i>
                                                <input type="text" placeholder='Full name' className='' value={register.fullName} onChange={(e)=>basicValidation(e,"fullname")} /> <br />
                                                <span className="text-danger">{err?.errName}</span>
                                            </div>
                                            {/* <span className='text-danger'>{message}</span> */}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center div-input mt-1">
                                        <div className="input-box">
                                            <div>
                                                <i className="fa-solid fa-user"></i>
                                                <input type="text" placeholder="Username" className='' value={register.username} onChange={(e)=>basicValidation(e,"username")} /><br />
                                                <span className="text-danger">{err?.errUsername}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center div-input mt-1">
                                        <div className="input-box">
                                            <div>
                                                <i className="fa-solid fa-phone"></i>
                                                <input type="text" placeholder="Phone number" className='' value={register.phoneNumber} onChange={(e)=>basicValidation(e,"phone")} /><br />
                                                <span className="text-danger">{err?.errPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center div-input mt-1">
                                        <div className="input-box">
                                            <div>
                                                <i className="fa-regular fa-envelope"></i>
                                                <input type="email" placeholder="Email" className='' value={register.email} onChange={(e)=>basicValidation(e,"email")} /><br />
                                                <span className="text-danger">{err?.errEmail}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center div-input">
                                        <div className="input-box">
                                            <div>
                                                <i className="fa-solid fa-lock"></i>
                                                <input type="password" placeholder="Password" className='' value={register.password} onChange={(e)=>basicValidation(e,"password")} /><br />
                                                <span className="text-danger">{err?.errPassword}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center div-input">
                                        <div className="input-box"><div>
                                                <i className="fa-solid fa-lock"></i>
                                                <input type="password" placeholder="Confirm Password" className='' value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} /><br />
                                                <span className="text-danger">{err?.errConfirm}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center div-button">
                                        <div className="d-flex justify-content-center mt-3">
                                            <button type='button' onClick={handlePost} className="btn btn-primary ">Register</button>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-3 div-button">
                                        Already have an account? &nbsp; <NavLink className="nav-link" to={"/login"}> Login</NavLink>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;