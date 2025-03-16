import React from 'react';
import { NavLink } from 'react-router-dom';
import "../../assets/css/Admin/pagination.css"

const SideNav = () => {
    return (
        <div>
            <nav id="sidebar" className="sidebar sidebar-admin js-sidebar">
                <div className="sidebar-content js-simplebar">
                    <NavLink className="sidebar-brand text-decoration-none" to={"/Dashboard"}>
                        <span className="align-middle" style={{fontFamily: "Rancho"}}>Five Food 24 Giờ</span>
                    </NavLink>

                    <ul className="sidebar-nav">
                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin"}>
                                <i className="fa-solid fa-house"></i>
                                <span className="align-middle">Bảng điều khiển</span>
                            </NavLink>
                        </li>

                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin/order"}>
                                <i className="fa-solid fa-receipt"></i> <span className="align-middle">Quản lý Hóa đơn</span>
                            </NavLink>
                        </li>

                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin/user"}>
                                <i className="fa-solid fa-users"></i> <span className="align-middle">Quản lý Người dùng</span>
                            </NavLink>
                        </li>
                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin/product"}>
                                <i className="fa-solid fa-cookie-bite"></i> <span className="align-middle">Quản lý Sản phẩm</span>
                            </NavLink>
                        </li>
                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin/product-category"}>
                                <i className="fa-solid fa-cookie-bite"></i> <span className="align-middle">Quản lý Loại sản phẩm</span>
                            </NavLink>
                        </li>
                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin/statistics"}>
                                <i className="fa-solid fa-chart-simple"></i> <span className="align-middle">Thống kê</span>
                            </NavLink>
                        </li>

                        <li className="sidebar-item">
                            <NavLink className="sidebar-link" to={"/home-admin/reviews"}>
                                <i className="fa-solid fa-star"></i> <span className="align-middle">Đánh giá</span>
                            </NavLink>
                        </li>
                        <li className="sidebar-header"></li>

                    </ul>

                </div>
            </nav>
        </div>
    );
};

export default SideNav;