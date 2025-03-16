import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import { NavLink } from 'react-router-dom';

const HorizontalNav = () => {

    const {user} = useSelector((state:RootState)=>state.login);

    const clickDangXuat = ()=>{
        
    }

    return (
        <nav className="navbar navbar-expand navbar-light navbar-bg nav-admin">
                <NavLink to={"/home-admin"} style={{marginLeft:"20px"}} className="sidebar-toggle js-sidebar-toggle">
                    <i className="hamburger align-self-center"></i>
                </NavLink>

                {/* <div className="navbar-collapse collapse">
                    <ul className="navbar-nav navbar-align">
                        <li className="nav-item dropdown">
                            <NavLink className="nav-icon dropdown-toggle d-inline-block d-sm-none" href="#" data-bs-toggle="dropdown"> <i
                                    className="align-middle" data-feather="settings"></i></NavLink>
                            <NavLink className="nav-link dropdown-toggle d-none d-sm-inline-block" href="#" data-bs-toggle="dropdown">
                                <img src={hinhAnh}
                                    className="avatar img-fluid rounded me-1" alt="avatar" /> <span
                                    className="text-dark">{hoTen}
                                </span>
                            </NavLink>
                            <div className="dropdown-menu dropdown-menu-end">
                                <NavLink className="dropdown-item" to={"/home/edit-profile"}><i className="align-middle me-1"
                                        data-feather="user"></i> Thông tin cá nhân</NavLink>
                                <NavLink className="dropdown-item" to={"/home"}><i className="align-middle me-1"
                                        data-feather="user"></i> Về trang người dùng</NavLink>
                                <div className="dropdown-divider"></div>
                                <NavLink className="dropdown-item" onClick={() => clickDangXuat()}>Đăng xuất</NavLink>
                            </div>
                        </li>
                    </ul>
                </div> */}

                <div className="navbar-collapse collapse">
                    <ul className="navbar-nav navbar-align">
                        <li className="nav-item dropdown">
                            {/* Icon cho mobile */}
                            <NavLink to={""} className="nav-icon dropdown-toggle d-inline-block d-sm-none" data-bs-toggle="dropdown">
                                <i className="align-middle" data-feather="settings"></i>
                            </NavLink>

                            {/* Avatar và tên người dùng cho desktop */}
                            <NavLink to={""} className="custom-nav-link dropdown-toggle d-none d-sm-inline-block" data-bs-toggle="dropdown">
                                <img src={user?.avatar} className="avatar img-fluid rounded me-1" alt="avatar" />
                                <span className="text-dark">{user?.fullName}</span>
                            </NavLink>

                            {/* Menu drop-down */}
                            <div className="dropdown-menu dropdown-menu-end" style={{ zIndex: 1050 }}>
                                <NavLink className="dropdown-item" to="/home/edit-profile">
                                    <i className="align-middle me-1" data-feather="user"></i> Thông tin cá nhân
                                </NavLink>
                                <NavLink className="dropdown-item" to="/home">
                                    <i className="align-middle me-1" data-feather="user"></i> Về trang người dùng
                                </NavLink>
                                <div className="dropdown-divider"></div>
                                <NavLink to={""} className="dropdown-item" onClick={() => clickDangXuat()}>Log out</NavLink>
                            </div>
                        </li>
                    </ul>
                </div>

            </nav>
    );
};

export default HorizontalNav;