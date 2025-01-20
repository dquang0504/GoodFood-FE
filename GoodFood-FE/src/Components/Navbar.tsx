import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/css/menu.css'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import { logout } from '../Slices/LoginSlice';

const Navbar = () => {

    const [listCart, setListCart] = useState([]);
    const [taiKhoan,setTaiKhoan] = useState(null);
    const {user} = useSelector((state:RootState)=>state.login)
    const dispatch = useDispatch<AppDispatch>();

    const clickDangXuat = ()=>{
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token")
        dispatch(logout())
    }

    useEffect(()=>{
       console.log(user) 
    },[])

    return (
        <>
            <nav className='navbar navbar-expand-lg navbar-light fixed-top'>
            <NavLink className="navbar-brand" to="/home" style={{ fontFamily: 'Rancho' }}>Good Food 24 Giờ</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="navbar-collapse justify-content-center" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item active">
                        <NavLink className="nav-link" to="/home">Trang Chủ</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/home/product">Đồ Ăn</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={"/"} className="nav-link">Về Chúng Tôi</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={"/"} className="nav-link">Liên Hệ</NavLink>
                    </li>
                </ul>
            </div>
            <div className="navbar-nav ml-auto">
                <li className="nav-item cart-dropdown ">
                    <NavLink className="nav-link cart-icon " to="/home/cart">
                        <i className="fas fa-shopping-cart position-relative">
                            {
                                listCart.length === 0 ? (
                                    <></>
                                ) : (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {listCart.length}
                                    </span>
                                )
                            }
                        </i>
                    </NavLink>
                    {
                        listCart.length === 0 ? (
                            <div className="cart-dropdown-content" style={{ borderRadius:5 }}>
                                <p className='mt-3 ms-3'>Chưa Có Sản Phẩm</p>
                            </div>
                        ) : (
                            <div className="cart-dropdown-content" style={{ width: "350px", borderRadius:5 }}>
                                {
                                    listCart.map((item) => {
                                        return (
                                            <div className="row mt-1" key={item.sanPhamGH.maSanPham}>
                                                <div className="col-md-2"><img alt="" src={item.sanPhamGH.hinhAnh} height="40px" width="40px" /> </div>
                                                <div className="col-md-5 align-content-center" >{item.sanPhamGH.tenSanPham}</div>
                                                <div className="col-md-5 align-content-center">{item.soLuong} x {formatVND(item.sanPhamGH.gia)} <formatVND value={item.sanPhamGH.gia} format={"0.0"} /></div>
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
                        {user !== null ? (
                            <>
                                { user?.avatar !== null ? (
                                        <img className="img-menu" alt="" src={user.avatar} />
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
                        {user !== null ? (
                            <>
                                <NavLink className="dropdown-item" to="/home/address">Địa chỉ</NavLink>
                                <NavLink className="dropdown-item" to="/home/order-history">Đơn mua</NavLink>
                                <NavLink className="dropdown-item" to="/home/change-password">Đổi mật khẩu</NavLink>
                                <NavLink className="dropdown-item" to="/home/edit-profile">Cập nhật tài khoản</NavLink>
                                {user.role == true ? (
                                    <NavLink className="dropdown-item" to="/home-admin">Admin</NavLink>
                                ):(
                                    <></>
                                )}
                                <NavLink to={""} className="dropdown-item" onClick={() => clickDangXuat()}>Đăng xuất</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink className="dropdown-item" to="/login">Đăng Nhập</NavLink>
                                <NavLink className="dropdown-item" to="/register">Đăng Ký</NavLink>
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