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
                            Tòa nhà FPT Polytechnic, Đ. Số 22,<br /> Thường Thạnh, Cái Răng, Cần Thơ
                        </address>
                        <div className="social-icons">
                            <a href="#"><img src="https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000" alt="Instagram" /></a>
                            <a href="#"><img src="https://img.icons8.com/?size=100&id=114441&format=png&color=000000" alt="Facebook" /></a>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <h5>Công Ty</h5>
                        <ul className="list-unstyled">
                            <li><a href="#about-us">Về chúng tôi</a></li>
                            <li><a href="#contact">Liên Hệ</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5>Chính Sách</h5>
                        <ul className="list-unstyled">
                            <li><a href="#">Hỏi & đáp</a></li>
                            <li><a href="#">Sự riêng tư</a></li>
                            <li><a href="#">Quyền lợi</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5>Liên Hệ</h5>
                        <p>+91 123 4567 8900</p>
                        <p>food@example.com</p>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <p>&copy; 2024 Good Food 24 Giờ. Tất cả các quyền lợi được đảm bảo.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
