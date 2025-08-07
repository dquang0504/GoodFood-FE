import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import axiosInstance from '../Services/AxiosInstance';
import { Reviews } from '../Interfaces/Reviews';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import { formatVND } from '../Services/FormatVND';
import { InvoiceDetails } from '../Interfaces/InvoiceDetails';
import UploadImgProduct from './Admin/UploadImgProduct';
import { ReviewImages } from '../Interfaces/ReviewImages';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './Firebase';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';
import Lightbox, { SlideImage } from 'yet-another-react-lightbox';

const EditReviewProduct = () => {
    const { user } = useSelector((state: RootState) => state.login);
    const queryString = window.location.search
    const urlParams: URLSearchParams = new URLSearchParams(queryString);
    const reviewID = urlParams.get('id');
    const initialReview: Reviews = {
        accountID: user ? user.accountID : 0,
        comment: "",
        invoiceID: 0,
        productID: 0,
        reviewAccount: user,
        reviewDate: new Date(),
        reviewID: 0,
        reviewProduct: null,
        reviewImages: null,
        reviewReply: null,
        stars: 0,
        status: true,
        reviewInvoice: null,
    }
    const initialInvoiceDetails: InvoiceDetails = {
        invoice: null,
        invoiceDetailID: 0,
        invoiceID: 0,
        price: 0,
        product: null,
        productID: 0,
        quantity: 0,
    }
    const [review, setReview] = useState<Reviews>(initialReview)
    const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetails>(initialInvoiceDetails);
    const [imageFile, setImageFile] = useState<File[]>([])
    const [resetPreview, setResetPreview] = useState(false);
    const [listHinhReview,setListHinhReview] = useState<ReviewImages[]>([]);
    const [err, setErr] = useState({
        errReview: "",
        errStars: "",
        errImages: "",
    })
    const [open, setOpen] = useState(false);
    const [slides, setSlides] = useState<SlideImage[]>([]);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get(`review/detail?reviewID=${reviewID}`);
            console.log(response);
            setSlides(
                (response.data.data.reviewImages as ReviewImages[]).map(item => ({
                    src: item.imageName
                }))
            );
            setListHinhReview(response.data.data.reviewImages)
            setReview(response.data.data)
            setInvoiceDetail(response.data.detail);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        if (review.stars === 0) {
            setErr({ ...err, errStars: "Please rate this product based on your experience!" })
        } else {
            setErr({ ...err, errStars: "" })
        }
    }, [review.stars])

    const resetForm = () => {
        setResetPreview(true);
        setReview(initialReview);
        setImageFile([]);
        setListHinhReview([]);
    }

    const handleUpdate = async () => {
        const formData = new FormData()
        formData.append("review",JSON.stringify({
            ...review,
            reviewImages: []
        }))

        for(const file of imageFile){
            formData.append("reviewImages",file)
        }


        // if (err.errReview === "" && review.stars > 0) {
        //     try {
        //         console.log(newReview);
        //         const response = await axiosInstance.put(`review/update?reviewID=${reviewID}`, newReview);
        //         console.log(response);
        //         toast.success(response.data.message);
        //         resetForm();
        //     } catch (error) {
        //         console.log(error);
        //     }finally{
        //         fetchData();
        //     }
        // } else {
        //     toast.error("Please check the displayed errors!");
        // }

    }

    const basicValidation = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e !== null) {
            if (e.target.value == "") {
                setErr({ ...err, errReview: "Please input your honest review!" })
            } else if (e.target.value.length <= 9) {
                setErr({ ...err, errReview: "Your review needs to be at least 10 words long!" })
            }
            else {
                setErr({ ...err, errReview: "" })
            }
            setReview({ ...review, comment: e.target.value })
        }
    }

    return (
        <>
            <Navbar></Navbar>
            <div className="main" style={{ marginTop: 50 }}>
                <b className='text-center mt-3 mb-3'>EDIT REVIEW</b>
                <table className="table">
                    <thead className='text-center'>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody className='text-center'>
                        <tr className="cart-item">
                            <td className="d-flex justify-content-center align-content-center">
                                <div className="product-info">
                                    <span><img alt="" src={review.reviewProduct?.coverImage ? `${review.reviewProduct.coverImage}` : 'https://t4.ftcdn.net/jpg/04/81/13/43/360_F_481134373_0W4kg2yKeBRHNEklk4F9UXtGHdub3tYk.jpg'} width="150px" /></span>
                                </div>
                            </td>
                            <td className="align-content-center">{review.reviewProduct?.productName}</td>
                            <td className="align-content-center">
                                {invoiceDetail.quantity}
                            </td>
                            <td className="align-content-center" style={{ color: 'red' }}>
                                {invoiceDetail && formatVND(invoiceDetail.price)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <form>
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
                            <em className="text-danger">{err?.errImages}</em>
                        </div>
                        <div className="image-gallery mb-3" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {Array.isArray(review.reviewImages) && review.reviewImages && review.reviewImages.map((hinh) => (
                                <img 
                                    key={hinh.imageName}
                                    src={hinh.imageName}
                                    alt={hinh.imageName}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        margin: '5px',
                                        border: '1px solid #ddd',
                                        padding: '5px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setOpen(true)}
                                />
                            ))}
                            {slides.length > 0 && (
                                <Lightbox open={open} close={() => setOpen(false)} slides={slides} />
                            )}
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
                            <button disabled={review.comment === ""} onClick={handleUpdate} className="btn btn-agree btn-warning" type="button">
                                Update
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <Footer></Footer>
        </>
    );
};

export default EditReviewProduct;