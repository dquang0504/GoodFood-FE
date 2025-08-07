import React, { useEffect, useState } from 'react';
import '../assets/css/Changepassword.css'
import imgCrush from '../assets/images/comga.png';
import Navbar from './Navbar';
import Footer from './Footer';
import { toast } from 'react-toastify';
import axiosInstance from '../Services/AxiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import { logout } from '../Slices/LoginSlice';
import { clearCart } from '../Slices/CartSlice';

const ChangePassword = () => {

    const [changePass,setChangePass] = useState({
        accountID: 0,
        oldPassword: "",
        newPassword: "",
        confirmPassword:"",
    });
    const [err,setErr] = useState({
        errOldPassword: "",
        errNewPassword: "",
        errConfirmPassword: "",
    })
    const {user} = useSelector((state:RootState) => state.login)
    const dispatch = useDispatch<AppDispatch>();

    const basicValidation = (e:React.ChangeEvent<HTMLInputElement>, fieldName: string)=>{
        if(fieldName === "old"){
            if(e.target.value.length <= 7){
                setErr({...err,errOldPassword: "Old password needs to be at least 8 characters!"});
            }
            else{
                setErr({...err,errOldPassword: ""});
            }
            setChangePass({...changePass,oldPassword: e.target.value});
        }
        if(fieldName === "new"){
            if(e.target.value.length <= 7){
                setErr({...err,errNewPassword: "New password needs to be at least 8 characters!"});
            }
            else{
                setErr({...err,errNewPassword: ""});
            }
            setChangePass({...changePass,newPassword: e.target.value});
        }
    }

    const handleSubmit = async()=>{
        if(
            err.errOldPassword === "" && err.errNewPassword === "" && err.errConfirmPassword === ""
        ){
            try {
                const response = await axiosInstance.post(`change-password/submit`,changePass);
                toast.success(response.data.message);
                dispatch(logout());
                dispatch(clearCart());
            } catch (error: any) {
                setErr(prev=>({
                    ...prev,
                    ...error.response.data.err
                }))
                console.log(error);
            }
        }
        else{
            toast.error("Please check displayed errors!");
        }
    }

    useEffect(()=>{
        setChangePass({...changePass,accountID: user ? user.accountID : 0})
        if(changePass.confirmPassword !== changePass.newPassword){
            setErr({...err,errConfirmPassword: "Password does not match!"})
            console.log("hello")
        }
        else{
            setErr({...err,errConfirmPassword: ""})
        }
    },[changePass.newPassword,changePass.confirmPassword])

    return (
        <>
           <Navbar />
            <main className='main-change-pass' style={{marginTop:20}}>
                <div className="row pt-5 pb-5 ms-5 me-5">
                    <div className="col-md-6 d-flex justify-content-center mt-5">
                        <div className="card">
                            <div className="card-body">
                                <div className="text-center fs-2 fw-bold">Change Password</div>
                                    <div className="mt-4">
                                        <form>
                                            <div className="d-flex justify-content-center div-input">
                                                <div className="input-box">
                                                    <div>
                                                        <i className="fa-solid fa-lock"></i>
                                                        <input
                                                            type="password"
                                                            placeholder="Old Password"
                                                            value={changePass.oldPassword}
                                                            onChange={(e) => basicValidation(e,"old")}
                                                        />
                                                    </div>
                                                    <span className="text-danger">{err.errOldPassword}</span>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center div-input mt-1">
                                                <div className="input-box">
                                                    <div>
                                                        <i className="fa-solid fa-lock"></i>
                                                        <input
                                                            type="password"
                                                            placeholder="New Password"
                                                            value={changePass.newPassword}
                                                            onChange={(e) => basicValidation(e,"new")}
                                                        />
                                                    </div>
                                                    <span className="text-danger">{err.errNewPassword}</span>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center div-input mt-1">
                                                <div className="input-box">
                                                    <div>
                                                        <i className="fa-solid fa-lock"></i>
                                                        <input
                                                            type="password"
                                                            placeholder="Confirm New Password"
                                                            value={changePass.confirmPassword}
                                                            onChange={(e) => setChangePass({...changePass,confirmPassword: e.target.value})}
                                                        />
                                                    </div>
                                                    <span className="text-danger">{err.errConfirmPassword}</span>
                                                    {/* {successMessage && <span className="text-success mt-2">{successMessage}</span>}
                                                    {errorMessage && <span className="text-danger mt-2">{errorMessage}</span>} */}
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center mt-3 div-button">
                                                <button type='button' onClick={handleSubmit} className="btn btn-success">Confirm</button>
                                            </div>
                                        </form>
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 mt-2">
                        <div className="d-flex justify-content-center">
                            <img src={imgCrush} alt="Crush Chips" className="hero-img" />
                        </div>
                    </div>
                </div>
            </main>
            <Footer></Footer>
        </>
    );
};

export default ChangePassword;