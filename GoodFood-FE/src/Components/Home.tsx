import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import comImg from '../assets/images/comga.png'
import aboutImg from '../assets/images/about.png';
import '../assets/css/main.css'
import Footer from './Footer';
import axios, { AxiosResponse } from 'axios';
import { ENDPOINT } from '../App';
import { Products } from '../Interfaces/Products';
import { formatVND } from '../Services/FormatVND';

const Home = () => {
    const [products,setProducts] = useState<Products[]>([]);
    const [loading,setLoading] = useState(true);
    const [formData,setFormData] = useState({
        name: '',
        toEmail: '',
        content: '',
    })
    const [showFullText,setShowFullText] = useState(false)

    const fetchProduct = async()=>{
        try {
            const response = await axios.get(`${ENDPOINT}/products/getFeaturings`)
            setProducts(response.data.data);
        } catch (error) {
            console.log(error)
        }
        finally{
            setLoading(false)
        }
    }

    // Hàm để chuyển đổi hiển thị text của phần "Về Chúng Tôi"
    const toggleText = () => {
        setShowFullText(!showFullText);
    };

    const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
    };

    const clickMuaNgay = ()=>{

    }

    const handleSubmit = ()=>{
        
    }

    useEffect(()=>{
        fetchProduct();
    },[])

    return (
        <div>
            <Navbar></Navbar>

            {/* Hero Section */}
            <section className="hero d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <h1>
                                Món Ăn Vặt Tốt Nhất Dành <a style={{ color: '#FAA41A' }}>Cho Bạn</a>
                            </h1>
                            <p>Bạn có thể dễ dàng đặt hàng tại đây rất dễ dàng và đơn giản.</p>
                            <a href="/home/cart" className="btn btn-primary ">Đặt Hàng Ngay</a>
                        </div>
                        <div className="col-md-6 text-center">
                            <img src={comImg} alt="Chips" className="hero-img" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services py-5 text-center">
                <div className="container">
                    <h3 className="pb-3" style={{ color: 'red' }}>Nó Hoạt Động Như Thế Nào</h3>
                    <h2 className="pb-3">Dịch Vụ Của Chúng Tôi Gồm</h2>
                    <h5 style={{ width: '1100px', textAlign: 'center' }}>
                        Chất lượng sản phẩm là ưu tiên hàng đầu của chúng tôi và luôn được đảm bảo đạt tiêu chuẩn Halal, an toàn cho đến khi đến tay bạn.
                    </h5>
                    <br />
                    <div className="row">
                        <div className="col-md-4">
                            <img
                                src="https://img.icons8.com/?size=100&id=InBFaIcuKzYq&format=png&color=000000"
                                alt="Order"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Đặt Hàng Một Cách Dễ Dàng</h4>
                            <p>Bạn chỉ cần đặt hàng qua ứng dụng</p>
                            </div>
                            <div className="col-md-4">
                            <img
                                src="https://img.icons8.com/?size=100&id=8HsozTgMRBk2&format=png&color=000000"
                                alt="Delivery"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Giao Hàng Nhanh Nhất</h4>
                            <p>Giao hàng luôn đúng giờ</p>
                        </div>
                        <div className="col-md-4">
                            <img
                                src="https://img.icons8.com/?size=100&id=N2betboMPKre&format=png&color=000000"
                                alt="Quality"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Chất Lượng Tốt Nhất</h4>
                            <p>Món ăn chất lượng nhất dành cho bạn</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            {loading ? <div>Loading...</div> :
                products.length === 0 ? <div>Không có sản phẩm để hiển thị.</div> :
                <div className="similar-product1 row container-center ">
                    {products.map(product => (
                        <div key={product.productID} className="col-md-3 d-flex justify-content-center">
                            <div className="card">
                                <img src={product.coverImage} alt={product.productName} />
                                <div className="card-body">
                                    <h3 className="product-name">{product.productName}</h3>
                                    <div className="action row me-1">
                                        <div className="product-price col-md-7 m-0 d-flex justify-content-center align-items-center"><div>{formatVND(product.price)}</div></div>
                                        <div className="btn btn-success col-md-5 m-0 d-flex justify-content-center text-center" style={{ cursor: 'pointer' }} onClick={() => clickMuaNgay(product)}>Mua ngay</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            }

            {/* About Us Section */}
            <section id="about-us" className="about-us d-flex align-items-center">
                <div className="container">
                    <h2 style={{ textAlign: 'center' }}>Về Chúng Tôi</h2>
                    <h3 style={{ textAlign: 'center' }}>Tóm tắt nền tảng của công ty chúng tôi</h3>
                    <br />
                    <div className="row">
                        <div className="col-md-6">
                            {/* Nội dung sẽ thay đổi dựa trên trạng thái showFullText */}
                            <p>
                                {showFullText
                                ? "Chào mừng bạn đến với Đồ Ăn Vặt Ngon – nơi thỏa mãn vị giác của bạn với những món ăn vặt độc đáo và hấp dẫn! Chúng tôi tự hào là địa chỉ uy tín, mang đến trải nghiệm ẩm thực tuyệt vời với đa dạng các món ngon miệng và chất lượng. Với niềm đam mê sâu sắc về ẩm thực đường phố, chúng tôi đã tạo ra một không gian ấm cúng và thân thiện, nơi mà bạn có thể thưởng thức những món ăn vặt phong phú và độc đáo. Tại Đồ Ăn Vặt Ngon, chúng tôi cam kết sử dụng nguyên liệu tươi ngon nhất và tuân thủ nghiêm ngặt các tiêu chuẩn vệ sinh an toàn thực phẩm, để mang lại cho bạn trải nghiệm ẩm thực an toàn và ngon miệng nhất. Hãy đến và khám phá hương vị đặc trưng của các món ăn vặt được chế biến tinh tế từ đội ngũ đầu bếp tài năng của chúng tôi. Chúng tôi tin rằng, với không gian thoải mái, dịch vụ chuyên nghiệp và hương vị độc đáo, Đồ Ăn Vặt Ngon sẽ là điểm đến lý tưởng cho tất cả những ai yêu thích ẩm thực đường phố và muốn tận hưởng những khoảnh khắc ẩm thực đặc biệt."
                                : "Chào mừng bạn đến với Đồ Ăn Vặt Ngon – nơi thỏa mãn vị giác của bạn với những món ăn vặt độc đáo và hấp dẫn!"}
                            </p>
                            <button className="btn btn-primary" onClick={toggleText}>
                                {showFullText ? "Thu gọn" : "Đọc Thêm"}
                            </button>
                        </div>
                        <div className="col-md-6">
                            <img src={aboutImg} alt="About Us" className="img-fluid" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact py-5">
                <div className="container">
                    <div className="text-center mb-3">
                        <h1 className="contact-title">Liên Hệ</h1>
                        <p className="contact-subtitle">Nếu bạn cần giúp đỡ, chúng tôi ở đây</p>
                    </div>
                    <div className="row justify-content-center align-items-center">
                        <div className="col-md-8 d-flex justify-content-center">
                            <div style={{width:500}} >
                                <div>
                                    <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control input-lien-he"
                                        id="name"
                                        name="name"
                                        placeholder="Họ và tên"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    </div>
                                    <div className="form-group mt-3">
                                    <input
                                        type="email"
                                        className="form-control input-lien-he"
                                        id="fromEmail"
                                        name="toEmail"
                                        placeholder="Email"
                                        value={formData.toEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                    </div>
                                    <div className="form-group mt-3">
                                    <textarea
                                        className="form-control input-lien-he input-textarea"
                                        id="content"
                                        name="content"
                                        rows={3}
                                        placeholder="Tin Nhắn"
                                        value={formData.content}
                                        onChange={handleChange}
                                        
                                        required
                                    ></textarea>
                                    </div>
                                </div>
                                <div className='mt-3 d-flex justify-content-end'>
                                    <button type="submit" className="btn btn-primary d-flex align-items-center" onClick={()=>handleSubmit()}>Gửi</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>

        </div>
    );
};

export default Home;