import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/css/menu.css'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import { logout } from '../Slices/LoginSlice';
import axiosInstance from '../Services/AxiosInstance';
import { Carts } from '../Interfaces/Carts';
import { formatVND } from '../Services/FormatVND';
import { clearCart, fetchCart } from '../Slices/CartSlice';

const Navbar = () => {

    const {cart} = useSelector((state:RootState)=>state.cart)
    const {user} = useSelector((state:RootState)=>state.login)
    console.log(user);
    const dispatch = useDispatch<AppDispatch>();

    const clickDangXuat = ()=>{
        dispatch(logout());
        dispatch(clearCart());
    }

    const getCart = ()=>{
        if(user?.accountID !== undefined){
            dispatch(fetchCart(user.accountID))
        }  
    }

    useEffect(()=>{
       getCart();
    },[])

    return (
        <>
            <nav className='navbar navbar-expand-lg navbar-light fixed-top'>
            <NavLink className="navbar-brand" to="/home" style={{ fontFamily: 'Rancho' }}>Good Food 24h</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="navbar-collapse justify-content-center" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item active">
                        <NavLink className="nav-link" to="/home">Home</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/home/product">Products</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={"/"} className="nav-link">About</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={"/"} className="nav-link">Contact</NavLink>
                    </li>
                </ul>
            </div>
            <div className="navbar-nav ml-auto">
                <li className="nav-item cart-dropdown ">
                    <NavLink className="nav-link cart-icon " to="/home/cart">
                        <i className="fas fa-shopping-cart position-relative">
                            {
                                cart && cart.length > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {cart.length}
                                    </span>
                                )
                            }
                        </i>
                    </NavLink>
                    {
                        !cart || cart.length === 0 ? (
                            <div className="cart-dropdown-content" style={{ borderRadius:5 }}>
                                <p className='mt-3 ms-3'>Cart Is Empty...</p>
                            </div>
                        ) : (
                            <div className="cart-dropdown-content" style={{ width: "350px", borderRadius:5 }}>
                                {
                                    Array.isArray(cart) && cart.map((item) => {
                                        return (
                                            <div className="row mt-1" key={item.product?.productID}>
                                                <div className="col-md-2"><img alt="" src={item.product?.coverImage} height="40px" width="40px" /> </div>
                                                <div className="col-md-5 align-content-center" >{item.product?.productName}</div>
                                                <div className="col-md-5 align-content-center">{item?.quantity} x {formatVND(item.product?.price)} </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    }
                </li>
                <li className="nav-item cart-dropdown">
                    <NavLink to={""} className="nav-link cart-icon" id="userDropdown" role="button">
                        {user ? (
                            <>
                                { user.avatar !== null ? (
                                        <img className="img-menu" alt="" src={user.avatar} referrerPolicy="no-referrer" />
                                    ) : (
                                        <i className="fas fa-user"></i>
                                    )

                                }
                            </>
                        ) : (
                            <i className="fas fa-user"></i>
                        )}
                    </NavLink>
                    <div className="cart-dropdown-content" style={{ borderRadius:5 }} aria-labelledby="userDropdown">
                        {user ? (
                            <>
                                <NavLink className="dropdown-item" to="/home/address">Delivery Address</NavLink>
                                <NavLink className="dropdown-item" to="/home/order-history">Orders</NavLink>
                                <NavLink className="dropdown-item" to="/home/change-password">Change Password</NavLink>
                                <NavLink className="dropdown-item" to="/home/edit-profile">Update Info</NavLink>
                                {user.role == true ? (
                                    <NavLink className="dropdown-item" to="/home-admin">Admin</NavLink>
                                ):(
                                    <></>
                                )}
                                <NavLink to={""} className="dropdown-item" onClick={() => clickDangXuat()}>Log out</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink className="dropdown-item" to="/login">Login</NavLink>
                                <NavLink className="dropdown-item" to="/register">Register</NavLink>
                            </>
                        )}
                    </div>
                </li>
            </div>
            
        </nav>
        </>
        
    );
};

export default Navbar;