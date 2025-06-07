import React, { TextareaHTMLAttributes, useEffect, useState } from 'react';
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
import { ProductImages } from '../Interfaces/ProductImages';
import { v4 } from 'uuid';
import { storage } from './Firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { toast } from 'react-toastify';
import { ReviewImages } from '../Interfaces/ReviewImages';

const ReviewProduct = () => {

    const {user} = useSelector((state:RootState)=>state.login);
    const {state} = useLocation();
    const invoiceID = state?.invoiceID ?? 0;
    const productID = state?.productID ?? 0;
    const initialReviewImages: ReviewImages = {
        reviewImageID: 0,
        imageName: "",
        reviewID: 0
    };
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
        invoiceID: invoiceID,
        productID: productID,
        reviewAccount: user,
        reviewDate: new Date(),
        reviewID: 0,
        reviewProduct: null,
        reviewImages: initialReviewImages,
        reviewReply: null,
        stars: 0,
        status: true,
        reviewInvoice: null
    }
    const [review,setReview] = useState<Reviews>(initialReview);
    const [imageFile, setImageFile] = useState<File[]>([]);
    const [resetPreview,setResetPreview] = useState(false);
    const [err,setErr] = useState({
        errReview: "",
        errStars: "",
    })

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
        setImageFile([]);
    }

    const basicValidation = (e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        if (e !== null){
            if(e.target.value == ""){
                setErr({...err,errReview: "Please input your honest review!"})
            }else if(e.target.value.length <= 9){
                setErr({...err,errReview: "Your review needs to be at least 10 words long!"})
            }
            else{
                setErr({...err,errReview: ""})
            }
            setReview({...review,comment: e.target.value})
        }
    }

    useEffect(()=>{
        if(review.stars === 0){
            setErr({...err,errStars:"Please rate this product based on your experience!"})
        }else{
            setErr({...err,errStars:""})
        }
    },[review.stars])

    const handleSubmit = async()=>{
        let newUniqueFileName = ""
        let imageURL: ReviewImages[] = [];
        if(imageFile.length > 0){
            for(const file of imageFile){
                //split the extension of the file
                let fileExtension = file.name.split('.').pop();
                let fileNameWithoutExtension = file.name.split('.').join('.');
                //create a new file name with v4 library
                newUniqueFileName = `${fileNameWithoutExtension}_${v4()}.${fileExtension}`;
                //create a reference to firebase storage
                const storageRef = ref(storage,`AnhDanhGia/${newUniqueFileName}`);
                await uploadBytes(storageRef,file); //upload the image to firebase
                imageURL.push({
                    imageName: await getDownloadURL(storageRef) || "",
                    reviewID: 0,
                    reviewImageID: 0
                })
            }
        }
        const newReview = {
            ...review,
            reviewImages: imageURL
        }
        if(err.errReview === "" && review.stars > 0){
            try {
                console.log(newReview);
                const response = await axiosInstance.post(`review/create`,newReview);
                console.log(response);
                toast.success(response.data.message);
                resetForm();
            } catch (error) {
                console.log(error);
            }finally{
                fetchData();
            }
        }else{
            toast.error("Please check the displayed errors!");
        }
        
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
                                    <span className="product-price">{formatVND(invoiceDetail.totalMoney ?? 0)}</span>
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
                                        onChange={() => setReview({...review,stars:star})}
                                    />
                                    <label className="star" htmlFor={`star-${star}`}></label>
                                </React.Fragment>
                            ))}
                        </div>
                        <span className='text-danger d-flex justify-content-center'>{err.errStars}</span>
                        <br />

                        <label style={{ fontWeight: 'bold' }}>Images</label>
                        <div className="image-input mb-3">
                            <UploadImgProduct
                                className='form-control'
                                inputClass='upload-instructions'
                                onFileSelect={setImageFile}
                                reset={resetPreview}
                            />
                        </div>
                        <textarea
                            className='form-control'
                            name="content"
                            rows={5}
                            cols={80}
                            placeholder="Your review..."
                            value={review.comment}
                            onChange={(e) => basicValidation(e)}
                        />
                        <span className='text-danger'>{err.errReview}</span>
                        <br />
                        <div className="content-btn mt-3" style={{ textAlign: 'right' }}>
                            <button className="btn btn-out btn-secondary me-3" type="button" onClick={() => window.history.back()}>
                                Return
                            </button>
                            <button disabled={review.comment === ""} onClick={handleSubmit} className="btn btn-agree btn-warning" type="button">
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