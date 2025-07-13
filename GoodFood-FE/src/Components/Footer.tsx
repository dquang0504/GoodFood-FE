import React from 'react';
import '../assets/css/footer.css';  // Đảm bảo rằng đường dẫn đúng 

const Footer = () => {
    return (
        <footer >
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        <h5 style={{ fontFamily: 'Rancho' }}>Good Food 24 Giờ</h5>
                        <address>
                            FPT Polytechnic Building, 22 Street,<br /> Thuong Thanh ward, Cai Rang district, Can Tho
                        </address>
                        <div className="social-icons">
                            <a href="#"><img src="https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000" alt="Instagram" /></a>
                            <a href="#"><img src="https://img.icons8.com/?size=100&id=114441&format=png&color=000000" alt="Facebook" /></a>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <h5>Company</h5>
                        <ul className="list-unstyled">
                            <li><a href="#about-us">About Us</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5>Policy</h5>
                        <ul className="list-unstyled">
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Rights</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5>Contact</h5>
                        <p>+91 123 4567 8900</p>
                        <p>goodfood24h@example.com</p>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <p>&copy; 2024 GoodFood24h. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
