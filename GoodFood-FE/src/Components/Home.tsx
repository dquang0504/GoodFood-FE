import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import comImg from '../assets/images/comga.png'
import aboutImg from '../assets/images/about.png';
import placeOrderImg from '../assets/images/place_order.png'
import shippingImg from '../assets/images/shipping.png'
import enjoyImg from '../assets/images/enjoy_review.png'
import '../assets/css/main.css'
import Footer from './Footer';
import axios, { AxiosResponse } from 'axios';
import { ENDPOINT } from '../App';
import { Products } from '../Interfaces/Products';
import { formatVND } from '../Services/FormatVND';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import { addMessage, openChatbot } from '../Slices/ChatbotSlice';
import { toast } from 'react-toastify';
import ThreeDCarousel from './ThreeDCarouse';

const Home = () => {
    const navigate = useNavigate();
    const { isOpen } = useSelector((state: RootState) => state.chatbot);
    const dispatch = useDispatch();
    const [products, setProducts] = useState<Products[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        fromEmail: '',
        content: '',
    })
    const [showFullText, setShowFullText] = useState(false)
    const [err, setErr] = useState({
        errFullname: "",
        errEmail: "",
        errMessage: "",
    })

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${ENDPOINT}/products/getFeaturings`)
            setProducts(response.data.data);
            console.log(response);
        } catch (error) {
            console.log(error)
        }
        finally {
            setLoading(false)
        }
    }

    // Hàm để chuyển đổi hiển thị text của phần "Về Chúng Tôi"
    const toggleText = () => {
        setShowFullText(!showFullText);
    };


    const basicValidation = (event: React.ChangeEvent<HTMLInputElement> | null, event2: React.ChangeEvent<HTMLTextAreaElement> | null, fieldName: string) => {
        if (fieldName === "fullname") {
            if (event === null) return;

            if (event.target.value.length <= 0) {
                setErr({ ...err, errFullname: "Please input your full name!" })
            }
            else {
                setErr({ ...err, errFullname: "" })
            }
            setFormData({ ...formData, name: event.target.value })
        }
        else if (fieldName === "message") {
            if (event2 === null) return;

            if (event2.target.value.length <= 0) {
                setErr({ ...err, errMessage: "Please input your message!" })
            }
            else {
                setErr({ ...err, errMessage: "" })
            }
            setFormData({ ...formData, content: event2.target.value })
        }
        else if (fieldName === "email") {
            if (event === null) return;

            if (event.target.value === "") {
                setErr({ ...err, errEmail: "Please input your email!" })
            }
            else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})?$/.test(event.target.value)) {
                setErr({ ...err, errEmail: "Invalid email!" })
            }
            else {
                setErr({ ...err, errEmail: "" })
            }
            setFormData({ ...formData, fromEmail: event.target.value })
        }
    }

    const resetForm = ()=>{
        setFormData({
            name: '',
            fromEmail: '',
            content: '',
        })
    }

    const handleSubmit = async () => {
        if (
            err.errFullname === "" && err.errEmail === "" && err.errMessage === ""
        ) {
            try {
                const response = await axios.post(`${ENDPOINT}/user/contact`, formData);
                console.log(response);
                toast.success(response.data.message);
                resetForm();
            } catch (error) {
                console.log(error);
            }
        } else {
            toast.error("Please check the displayed errors!");
        }

    }

    useEffect(() => {
        fetchProduct();
    }, [])

    const handleTestBot = () => {
        dispatch(openChatbot());
        dispatch(addMessage("Can you help me place an order ?"));

    }

    return (
        <div>
            <Navbar></Navbar>

            {/* Hero Section */}
            <section className="hero d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <h1>
                                <a style={{ color: '#FAA41A' }}>Your best</a> Food Ordering Website
                            </h1>
                            <span>
                                Placing an order becomes so much easier with our personal AI assistant.
                                <div className="btn-icon-wrapper mx-3">
                                    <button onClick={handleTestBot} className="btn btn-success d-flex align-items-center">
                                        <i className="fa-solid fa-robot"></i>
                                    </button>
                                    <div className="info-tooltip">
                                        Click to try!
                                    </div>
                                </div>
                            </span>

                            <a href="/home/cart" className="btn btn-primary ">Place your order now!</a>
                        </div>
                        <div className="col-md-6 text-center">
                            <h2 className="featured-title mb-4">Featured Products</h2>
                            <ThreeDCarousel products={products}></ThreeDCarousel>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services py-5 text-center">
                <div className="container">
                    <h3 className="pb-3" style={{ color: 'red' }}>How It Works</h3>
                    <div className="row">
                        <div className="col-md-4">
                            <img
                                src={placeOrderImg}
                                alt="Order"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Place An Order</h4>
                            <p>You can place your order either through manual browsing or with our AI assistant.</p>
                        </div>
                        <div className="col-md-4">
                            <img
                                src={shippingImg}
                                alt="Delivery"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Wait For Delivery</h4>
                            <p>Always on time!</p>
                        </div>
                        <div className="col-md-4">
                            <img
                                src={enjoyImg}
                                alt="Quality"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Enjoy Your Food!</h4>
                            <p>Enjoy your food and give us a review!</p>
                        </div>
                    </div>

                    <h2 className="pb-3">Our Service Includes</h2>
                    <h5 style={{ textAlign: 'center' }}>
                        Product quality is our top priority, and we always ensure that everything meets strict safety standards until it reaches you.
                    </h5>
                    <br />
                    <div className="row">
                        <div className="col-md-4">
                            <img
                                src="https://img.icons8.com/?size=100&id=InBFaIcuKzYq&format=png&color=000000"
                                alt="Order"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Easy Ordering</h4>
                            <p>Simply place your order through our website.</p>
                        </div>
                        <div className="col-md-4">
                            <img
                                src="https://img.icons8.com/?size=100&id=8HsozTgMRBk2&format=png&color=000000"
                                alt="Delivery"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Fast Delivery</h4>
                            <p>Your order arrives right on time.</p>
                        </div>
                        <div className="col-md-4">
                            <img
                                src="https://img.icons8.com/?size=100&id=N2betboMPKre&format=png&color=000000"
                                alt="Quality"
                                className='mx-auto'
                            />
                            <h4 className="my-3">Best Quality</h4>
                            <p>The finest dishes prepared just for you.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            {/* {loading ? <div>Loading...</div> :
                products.length === 0 ? <div>Không có sản phẩm để hiển thị.</div> :
                <div className="similar-product1 row container-center ">
                    {products.map(product => (
                        <div key={product.productID} className="col-md-3 d-flex justify-content-center">
                            <div className="card">
                                <img src={product.coverImage} alt={product.productName} onClick={() => { navigate(`/home/product-details/${product.productID}`,{state:{productID:product.productID,productType:product.productTypeID}}) }} />
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
            } */}

            {/* About Us Section */}
            <section id="about-us" className="about-us d-flex align-items-center">
                <div className="container">
                    <h2 style={{ textAlign: 'center' }}>About Us</h2>
                    <h3 style={{ textAlign: 'center' }}>Summary of Our Website Background</h3>
                    <br />
                    <div className="row">
                        <div className="col-md-6">
                            {/* Nội dung sẽ thay đổi dựa trên trạng thái showFullText */}
                            <p>
                                {showFullText
                                    ? <div>
                                        Welcome to <b>GoodFood24h</b> – where your taste buds are delighted by a variety of unique and irresistible dishes! We take pride in being a trusted destination that offers an exceptional culinary experience with a wide selection of delicious, high-quality food, from tempting snacks to satisfying main courses.
                                        <br />  Driven by a deep passion for street food and diverse cuisine, we have created a warm and friendly online space where you can explore an abundance of distinctive dishes. At <b>GoodFood24h</b>, we are committed to using only the freshest ingredients and strictly adhering to food safety and hygiene standards to bring you the safest and most enjoyable culinary experience.
                                        <br /> Come and discover the signature flavors of our carefully prepared dishes crafted by our talented team of chefs. We believe that with a comfortable browsing experience, professional service, and unique tastes, <b>GoodFood24h</b> will be the ideal destination for all food lovers who want to enjoy special culinary moments.
                                    </div>
                                    : "Welcome to GoodFood24h – where your taste buds are delighted by a variety of unique and irresistible dishes! We take pride in being a trusted destination that offers an exceptional culinary experience with a wide selection of delicious, high-quality food, from tempting snacks to satisfying main courses."}
                            </p>
                            <button className="btn btn-primary" onClick={toggleText}>
                                {showFullText ? "Collapse" : "View more..."}
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
                        <h1 className="contact-title">Contact</h1>
                        <p className="contact-subtitle">If you ever need help, please reach out to us</p>
                    </div>
                    <div className="row justify-content-center align-items-center">
                        <div className="col-md-8 d-flex justify-content-center">
                            <div style={{ width: 500 }} >
                                <div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control input-lien-he"
                                            id="name"
                                            name="name"
                                            placeholder="Fullname"
                                            value={formData.name}
                                            onChange={(e)=>basicValidation(e,null,"fullname")}
                                            required
                                        />
                                    </div>
                                    <em className='text-danger'>{err.errFullname}</em>
                                    <div className="form-group mt-3">
                                        <input
                                            type="email"
                                            className="form-control input-lien-he"
                                            id="fromEmail"
                                            name="toEmail"
                                            placeholder="Email"
                                            value={formData.fromEmail}
                                            onChange={(e)=>basicValidation(e,null,"email")}
                                            required
                                        />
                                    </div>
                                    <em className='text-danger'>{err.errEmail}</em>
                                    <div className="form-group mt-3">
                                        <textarea
                                            className="form-control input-lien-he input-textarea"
                                            id="content"
                                            name="content"
                                            rows={3}
                                            placeholder="Message"
                                            value={formData.content}
                                            onChange={(e)=>basicValidation(null,e,"message")}

                                            required
                                        ></textarea>
                                    </div>
                                    <em className='text-danger'>{err.errMessage}</em>
                                </div>
                                <div className='mt-3 d-flex justify-content-end'>
                                    <button type="submit" style={{ backgroundColor: '#D95D39' }} className="btn btn-primary d-flex align-items-center" onClick={() => handleSubmit()}>Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

        </div>
    );
};

export default Home;