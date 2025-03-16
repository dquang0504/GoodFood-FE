import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    return (
        <div>
            <footer className="footer">
                <div className="container-fluid">
                    <div className="row text-muted">
                        <div className="col-6 text-start">
                            <p className="mb-0">
                                <NavLink to={""} className="text-muted" target="_blank" style={{fontFamily: "Rancho"}}><strong>Five Food 24 Giờ</strong></NavLink> - <NavLink to={""} className="text-muted" target="_blank"><strong> Quản trị
                                    </strong></NavLink> &copy;
                            </p>
                        </div>
                        <div className="col-6 text-end">
                            <ul className="list-inline">
                                
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;