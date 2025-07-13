import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import { NavLink } from 'react-router-dom';

const HorizontalNav = () => {
    const { user } = useSelector((state: RootState) => state.login);

    const clickDangXuat = () => {
        // TODO: Handle logout logic here
        console.log("Logging out...");
    };

    return (
        <nav className="navbar navbar-expand navbar-light navbar-bg nav-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Sidebar toggle button */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <NavLink to="/home-admin" style={{ marginLeft: '20px' }} className="sidebar-toggle js-sidebar-toggle">
                    <i className="hamburger align-self-center"></i>
                </NavLink>
            </div>

            {/* Dropdown Avatar */}
            <div 
                className="dropdown" 
                style={{ marginRight: "125px",marginTop: "0px"}}
            >
                <button className="dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img 
                        src={user?.avatar || '/path/to/default-avatar.png'} 
                        alt="Avatar" 
                        className="avatar-img" 
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <NavLink className="dropdown-item" to={"/home/edit-profile"} >Account info</NavLink>
                    <NavLink className="dropdown-item" to={"/home/change-password"}>Change password</NavLink>
                    <NavLink to={"/home"} className="dropdown-item">Back</NavLink>
                    <button className="dropdown-item" onClick={clickDangXuat}>Log out</button>
                </div>
            </div>
        </nav>
    );
};

export default HorizontalNav;
