import React, { useState } from 'react';
import '../assets/css/Updateaccount.css'
import Navbar from './Navbar';
import imgCrush from '../assets/images/comga.png'
import Footer from './Footer';
import { Users } from '../Interfaces/Users';
import axiosInstance from '../Services/AxiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import { storage } from './Firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { setUser } from '../Slices/LoginSlice';

const UpdateAccount = () => {
    const {user} = useSelector((state:RootState)=>state.login);
    if (!user) return;
    const [account,setAccount] = useState<Users>(user);
    const [err,setErr] = useState({
        errName: "",
        errPhone: "",
        errEmail: "",
        errGender: "",
        errImage: "",
    })
    const[file,setFile] = useState<File | null>(null);
    
    const dispatch = useDispatch<AppDispatch>();

    const basicValidation = (e:React.ChangeEvent<HTMLInputElement>,fieldName: string)=>{
        if (fieldName === "fullname"){
            if (e.target.value.length <= 0){
                setErr({...err,errName: "Please input your full name!"});
            }
            else{
                setErr({...err,errName: ""});
            }
            setAccount({...account,fullName: e.target.value});
        }
        if (fieldName === "phone"){
            if (e.target.value.length <= 0){
                setErr({...err,errPhone: "Please input your phone number!"});
            }else if(!/^(0[3-9])\d{8}$/.test(e.target.value)){
                setErr({...err,errPhone:"Invalid phone number!"})
            }
            else{
                setErr({...err,errPhone: ""});
            }
            setAccount({...account,phoneNumber: e.target.value});
        }
        if (fieldName === "email"){
            if (e.target.value.length <= 0){
                setErr({...err,errEmail: "Please input your email!"});
            }else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})?$/.test(e.target.value)){
                setErr({...err,errEmail:"Invalid email!"})
            }
            else{
                setErr({...err,errEmail: ""});
            }
            setAccount({...account,email: e.target.value});
        }
    }

    const handleUpdateAccount = async()=>{
        let updatedAccount = {...account};
        if(
            err.errEmail === "" && err.errName === "" &&
            err.errGender === "" && err.errImage === "" &&
            err.errPhone === ""
        ){
            try {
                //uploading avatar to firebase
                if (file !== null){
                    const fileExtension = file.name.split('.').pop();
                    const fileNameWithoutExtension = file.name.split('.').join('.');

                    //create a file name with v4 library
                    const newUniqueFileName = `${fileNameWithoutExtension}_${v4()}.${fileExtension}`;
                    //create a referance to firebase storage
                    const storageRef = ref(storage,`avatars/${newUniqueFileName}`);
                    await uploadBytes(storageRef,file); //upload image to storage
                    updatedAccount.avatar = await getDownloadURL(storageRef) || "";
                }
                const response = await axiosInstance.put(`user/update?accountID=${user?.accountID}`,updatedAccount);
                toast.success(response.data.message);
                console.log(response.data.data);
                dispatch(setUser(response.data.data))
                // setAccount(initialAccount);
            } catch (error: any) {
                console.log(error);
                setErr(prev => ({
                    ...prev,
                    ...error.response.data.err
                }));
            }
        }else{
            toast.error("Please check displayed errors!");
        }
    }

    return (
        <>
            <Navbar />
            <main className='main-update-account' style={{paddingTop:40}}>
                <div className="row pt-5 ms-5 me-5">
                    <div className="col-md-6 d-flex justify-content-center">
                        <div className="card">
                            <div className="card-body">
                                <div className="div-title">
                                    <div className="text-center fs-2 fw-bold">Update Information</div>
                                </div>
                                <div className="">
                                    <form>
                                        <div className="d-flex justify-content-center div-input">
                                            <div className="input-box">
                                                <div>
                                                    <i className="fa-solid fa-user"></i>
                                                    <input
                                                        type="text"
                                                        placeholder="Full name"
                                                        className=''
                                                        value={account.fullName} 
                                                        onChange={(e) => basicValidation(e,"fullname")}
                                                    />
                                                </div>
                                                <span className="text-danger">{err?.errName}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center div-input mt-1">
                                            <div className="input-box">
                                                <div>
                                                    <i className="fa-solid fa-phone"></i>
                                                    <input
                                                        type="text"
                                                        placeholder="Phone number"
                                                        className=''
                                                        value={account.phoneNumber}
                                                        onChange={(e) => basicValidation(e,"phone")}
                                                    />
                                                </div>
                                                <span className="text-danger">{err?.errPhone}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center div-input mt-1">
                                            <div className="input-box">
                                                <div>
                                                    <i className="fa-regular fa-envelope"></i>
                                                    <input
                                                        type="text"
                                                        placeholder="Email"
                                                        className=''
                                                        value={account.email}
                                                        onChange={(e) => basicValidation(e,"email")}
                                                    />
                                                </div>
                                                <span className="text-danger">{err?.errEmail}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-1">
                                            <div className="d-flex justify-content-start" style={{ width: '350px', height: '51px' }}>
                                                <div>
                                                    <label className="fs-5" htmlFor="">Gender:</label>
                                                    <input
                                                        id='nam'
                                                        type="radio"
                                                        className="ms-3"
                                                        name="gioiTinh"
                                                        value="true"
                                                        checked={account.gender === true}
                                                        onChange={(e) => setAccount({...account,gender: e.target.value === 'true'})}
                                                    /> <label htmlFor="nam">Male</label>
                                                    <input
                                                        id='nu'
                                                        type="radio"
                                                        className="ms-2"
                                                        name="gioiTinh"
                                                        value="false"
                                                        checked={account.gender === false}
                                                        onChange={(e) => setAccount({...account,gender: e.target.value === 'true'})}
                                                    /> <label htmlFor="nu">Female</label>
                                                    <span className="text-danger">{err?.errGender}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-1">
                                            <div className="d-flex justify-content-start" style={{ width: '350px' }}>
                                                <div className="row">
                                                    <label className="fs-5 p-0" htmlFor="">Profile picture:</label>
                                                    <input
                                                        type="file"
                                                        className="form-control col-md-9"
                                                        accept='image/*'
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files.length > 0){
                                                                setFile(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-danger p-0">{err?.errImage}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-4 mb-2 div-button">
                                            <div className="d-flex justify-content-end">
                                                <button type='button' onClick={handleUpdateAccount} className="btn btn-success ">Save changes</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-center">
                            <img src={imgCrush} alt="" className="hero-img"/>
                        </div>
                    </div>
                </div>
            </main>
            <Footer></Footer>
        </>
    );
};

export default UpdateAccount;