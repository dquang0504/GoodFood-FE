import React, { useEffect, useState } from 'react';
import '../assets/css/Evaluate.css'
import Navbar from './Navbar';
import axiosInstance from '../Services/AxiosInstance';
import { Products } from '../Interfaces/Products';
import { formatVND } from '../Services/FormatVND';
import { NavLink, useLocation } from 'react-router-dom';
import { InvoiceDetails } from '../Interfaces/InvoiceDetails';
import { InvoiceDetailList } from './OrderHistory';
import { Reviews } from '../Interfaces/Reviews';
import User from './Admin/User';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import UploadImgProduct from './Admin/UploadImgProduct';
import Footer from './Footer';

const ReviewProduct = () => {

    const {user} = useSelector((state:RootState)=>state.login);
    const {state} = useLocation();
    const invoiceID = state?.invoiceID ?? 0;
    const productID = state?.productID ?? 0;
    const initialDetail: InvoiceDetailList = {
        image: "",
        invoiceID: 0,
        product: null,
        quantity: 0,
        reviewCheck: false,
        shippingFee: 0,
        totalMoney: 0
    }
    const [invoiceDetail,setInvoiceDetail] = useState<InvoiceDetailList>(initialDetail);
    const initialReview: Reviews = {
        accountID: user ? user.accountID : 0,
        comment: "",
        invoiceID: 0,
        productID: 0,
        reviewAccount: user,
        reviewDate: new Date(),
        reviewID: 0,
        reviewProduct: null,
        stars: 0,
        status: true
    }
    const [review,setReview] = useState<Reviews>(initialReview);
    const [imageFile, setImageFile] = useState<File[]>([]);
    const [resetPreview,setResetPreview] = useState(false);

    const fetchData = async()=>{
        try {
            const response = await axiosInstance.get(`review?invoiceID=${invoiceID}&productID=${productID}`);
            setInvoiceDetail(response.data.data);
            setReview({...review,reviewProduct: response.data.data.product})
            console.log(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    const resetForm = ()=>{
        setResetPreview(false);
        setReview(initialReview);
    }

    const handleSubmit = async()=>{
        // try {
        //     const response = await axiosInstance.post(`review/create`,review);
        //     console.log(response);
        //     resetForm();
        // } catch (error) {
        //     console.log(error);
        // }
    }

    return (
        <>
            <Navbar></Navbar>
            <div className="main" style={{marginTop:50}}>
                <b className='text-center mt-3 mb-3'>PRODUCT REVIEW</b>
                <form>
                    <table className="table">
                        <thead className='text-center'>
                            <tr>
                                <th>Product Image</th>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            <tr className="cart-item">
                                <td className="text-center align-middle">
                                    <div className="product-info d-flex justify-content-center align-items-center">
                                        <span className='text-center'>
                                            <img alt="" src={invoiceDetail.image} />
                                        </span>
                                    </div>
                                </td>
                                <td className="align-content-center">{invoiceDetail.product?.productName}</td>
                                <td className="align-content-center">{invoiceDetail.quantity}</td>
                                <td className="align-content-center" style={{ color: 'red' }}>
                                    <span className="product-price">{formatVND(invoiceDetail.totalMoney ?? 0)} VNĐ</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="rating-wrapper">
                        <label className="rating-label">How many stars ?</label>
                        <div className="stars-container">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <React.Fragment key={star}>
                                    <input
                                        className="star"
                                        value={star}
                                        id={`star-${star}`}
                                        type="radio"
                                        name="star"
                                        required
                                        checked={review.stars === star}
                                        onChange={() => setReview({ ...review, stars: star })}
                                    />
                                    <label className="star" htmlFor={`star-${star}`}></label>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div className="content mb-6">
                        <label style={{ marginTop: '0px' }}>Images</label>
                        <div className="image-input mb-3">
                            <UploadImgProduct
                                className='form-control'
                                inputClass='upload-instructions'
                                onFileSelect={setImageFile}
                                reset={resetPreview}
                            />
                        </div>
                        <textarea
                            name="content"
                            rows={5}
                            cols={80}
                            placeholder="Your review..."
                            value={review.comment}
                            onChange={(e) => setReview({...review,comment:e.target.value})}
                        />
                        <br />
                        <div className="content-btn mt-3" style={{ textAlign: 'right' }}>
                            <button className="btn btn-out btn-secondary me-3" type="button" onClick={() => window.history.back()}>
                                Return
                            </button>
                            <button onClick={handleSubmit} className="btn btn-agree btn-warning" type="button">
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <Footer></Footer>
        </>
    );
};

export default ReviewProduct;