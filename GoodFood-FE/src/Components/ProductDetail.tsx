import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import '../assets/css/ProductDetail.css'
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ENDPOINT } from '../App';
import Navbar from './Navbar';
import { Products } from '../Interfaces/Products';
import { formatVND } from '../Services/FormatVND';
import { toast } from 'react-toastify';
import { Reviews } from '../Interfaces/Reviews';
import Footer from './Footer';
import axiosInstance from '../Services/AxiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import { addToCart } from '../Slices/CartSlice';

const ProductDetail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {state} = useLocation();
    const [product,setProduct] = useState<Products | null>(null);
    const [products,setProducts] = useState<Products[]>([]);
    const averageRating = useRef(5);
    const [quantity,setQuantity] = useState<number>(1);
    const [filteredEvaluates,setFilteredEvaluates] = useState<Reviews[]>([]);
    const [evaluates,setEvaluates] = useState<Reviews[]>([]);
    const countStars = useRef(0);
    const {user} = useSelector((state:RootState)=>state.login);
    const navigator = useNavigate();

    const fetchDetail = async()=>{
        try {
            const response = await axios.get(`${ENDPOINT}/products/detail?id=${state.productID}`)
            setProduct(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchSimilar = async()=>{
        try {
            const response = await axios.get(`${ENDPOINT}/products/similar?id=${state.productID}&typeID=${state.productType}`)
            setProducts(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        window.scrollTo(0,0)
        fetchDetail();
        fetchSimilar();
    },[])

    const clickAddProductCart = async(product: Products)=>{
        if (user === null){
            toast.warning("Please login first!");
            navigator("/login");
            return
        }
        const payload = {
            quantity: quantity,
            productID: product.productID,
            accountID: user?.accountID,
        }
        
        dispatch(addToCart(payload))
    }

    const clickPay = (product: Products)=>{

    }
    
    const changeQuantity = (value: number)=>{
        if (value > 0){
            setQuantity(quantity+1);
        }
        else if (quantity == 1){
            return;
        }
        else{
            setQuantity(quantity-1);
        }
    }

    const handleRatingFilter = (stars: number) => {

    }

    const clickProduct = (product: Products) => {
    
    }

    const clickMuaNgay = (product: Products) =>{

    }

    return (
        <>
            <Navbar />
            <div className="bg-content product-details-content pb-5" style={{ paddingTop: 50 }}>
                <main className="container">
                    <div className="detail row">
                        <div className="image-product col-md-5">
                            {/* {productImages.length > 0 && ( */}
                            <img
                                className="large-image" id="largeImage"
                                src={product?.coverImage}
                                alt={product?.productName}
                            />
                        </div>

                        <div className="detail-product col-md-6">
                            <div className="name-product">{product?.productName}</div>
                            <div className="star">
                                <b className="number-star" style={{ fontSize: '25px' }}>{averageRating.current}</b>
                                <span style={{ fontSize: '20px' }}>
                                    <i className="fa fa-star text-warning"></i>
                                </span>
                                <span style={{ margin: '0 10px', color: '#979797' }}> |</span>
                                {/* {totalAllStars} */}
                                <span className="number-evaluate">5</span>
                                <span className="text-number-evaluate"> Đánh giá</span>
                            </div>
                            <div className="detail-product2">
                                <div className="price">
                                    <span> {product ? formatVND(product.price) : "Đang tải..."}</span>
                                </div>
                                <div className="description">
                                    <span>{product?.description}</span>
                                </div>
                                <div>
                                    <div className="salary" >
                                        <div>Số lượng</div>
                                        <div className="box-add-salary">
                                            <button type="button" className="btn btn-sm" onClick={() => { changeQuantity(-1) }} >-</button>
                                            <input type="text" className="form-control" value={quantity} name="soLuong" min={1} max={5} style={{ width: '50px' }} id="soLuong" />
                                            <button type="button" className="btn btn-sm" onClick={() => { changeQuantity(1) }} >+</button>
                                        </div>
                                    </div>
                                    <div className="button-btn">
                                        <button className="btn btn-add-cart btn-outline-success" onClick={() => { product && clickAddProductCart(product) }}>
                                            <i className="fa-solid fa-cart-plus"></i> Thêm Vào giỏ hàng
                                        </button>
                                        <button className="btn btn-buy btn-success" onClick={() => { product && clickPay(product) }}>Mua ngay</button>
                                    </div>
                                </div>
                                <div style={{ margin: '20px 0 0 0' }}>
                                    <span style={{ margin: '0 40px 0 0' }}>
                                        <i style={{ color: 'red' }} className="fa-solid fa-medal"></i> Hàng chất lượng 100%
                                    </span>
                                    <span style={{ margin: '0 40px 0 0' }}>
                                        <i style={{ color: 'red' }} className="fa-solid fa-clock"></i> Giao hạng nhanh trong 30 phút
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Review */}
                    <div className="evaluate mt-3">
                        <div className="mb-1" style={{ fontSize: '30px', paddingLeft:28 }}>ĐÁNH GIÁ SẢN PHẨM</div>
                        <div className="detail-evaluate-star">
                            <span className="number-star">{averageRating.current}</span>
                            <span style={{ color: '#FAA41A', fontSize: '24px', margin: '0 200px 0 0' }}> trên 5</span>
                            <form method="get">
                                <button type="button" name="soSao" value="" className="btn btn-outline-success me-2" onClick={() => handleRatingFilter(0)}>Tất Cả</button>
                                <button type="button" name="soSao" value="5" className="btn btn-outline-success me-2" onClick={() => handleRatingFilter(5)}>5 sao ({countStars.current})</button>
                                <button type="button" name="soSao" value="4" className="btn btn-outline-success me-2" onClick={() => handleRatingFilter(4)}>4 sao ({countStars.current})</button>
                                <button type="button" name="soSao" value="3" className="btn btn-outline-success me-2" onClick={() => handleRatingFilter(3)}>3 sao ({countStars.current})</button>
                                <button type="button" name="soSao" value="2" className="btn btn-outline-success me-2" onClick={() => handleRatingFilter(2)}>2 sao ({countStars.current})</button>
                                <button type="button" name="soSao" value="1" className="btn btn-outline-success" onClick={() => handleRatingFilter(1)}>1 sao ({countStars.current})</button>
                            </form>
                            <div style={{ fontSize: '30px', margin: '-20px 0 0 40px' }}>
                                {/* {renderStars(parseFloat(averageRating))} */}
                            </div>
                        </div>
                        <div className="detail-evaluate">
                            <div className="detail-evaluate">
                                <div className="card card-evaluate">
                                    {filteredEvaluates.length > 0 ? (
                                        Array.isArray(evaluates) && evaluates.length > 0 && evaluates.map(eva => (
                                            <div className="card-body content row" key={eva.reviewID}>
                                                <div className="col-md-1 mt-2 ms-3 me-3">
                                                    <img 
                                                        alt="" 
                                                        src={eva.reviewAccount.avatar || 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg'} 
                                                        width="50px" 
                                                        height="50px" 
                                                        style={{ borderRadius: '50%' }} 
                                                    />
                                                </div>
                                                <div className="col-md-9 mt-2">
                                                    <div className="name">{eva.reviewAccount.fullName}</div>
                                                    <div className="review-rating">
                                                        {/*{renderStars(eva.soSao)}*/}
                                                    </div>
                                                    {/* <div className="time-date">{formatDate(eva.ngayDanhGia)}</div> */}
                                                </div>
                                                <div className="body-content col-md-12" style={{ fontSize: '20px' }}>
                                                    <div className="mb-3">{eva.comment}</div>

                                                    {/* {reviewImages.filter(image => image.maDanhGia === eva.maDanhGia).map(image => (
                                                        <span key={image.tenHinhAnh}>
                                                            <img 
                                                                src={image.tenHinhAnh} 
                                                                alt="" 
                                                                width="75px" 
                                                                height="75px" 
                                                                style={{ marginRight: '10px' }} 
                                                            />
                                                        </span>
                                                    ))} */}

                                                    {/* Phản hồi của admin */}
                                                    <div className="admin-replies mt-3">
                                                        <h5 className="text-success">Phản hồi từ Admin:</h5>
                                                        {/* {adminResponse && adminResponse.length > 0 ? (
                                                            adminResponse
                                                                .filter(reply => reply.maTaiKhoan?.maTaiKhoan === eva.taiKhoanDG?.maTaiKhoan) // Lọc phản hồi phù hợp
                                                                .map((reply, index) => (
                                                                    <div className="admin-reply" key={index}>
                                                                        <strong>Admin:</strong> <span>{reply.noiDungPhanHoi}</span>
                                                                    </div>
                                                                ))
                                                        ) : (
                                                            <div className="no-replies text-muted">Chưa có phản hồi nào từ Admin</div>
                                                        )} */}
                                                    </div>

                                                    {/* Nút chỉnh sửa dành cho người dùng đang đăng nhập */}
                                                    {/* {eva.taiKhoanDG?.maTaiKhoan === loggedInUserId && (
                                                        <div className='danhGiaBtn'>
                                                            <a href="#" onClick={() => clickEdit(eva.maDanhGia)}>
                                                                <i className="fa-regular fa-pen-to-square"></i>
                                                            </a>
                                                        </div>
                                                    )} */}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-reviews-message text-center">Không có đánh giá</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* {filteredEvaluates.length > 0 && (
                            <div className="see-more">
                                <form action="" method="post">
                                    <input type="hidden" name="sanPhamId" value={product.maSanPham} />
                                    <button onClick={loadMoreReviews} className="btn btn-success xemthem">Xem Thêm</button>
                                </form>
                            </div>
                        )} */}
                    </div>

                    <div className="similar-product-details row">
                        <div className='mb-2' style={{ fontSize: '30px' }}>SẢN PHẨM TƯƠNG TỰ</div>
                        {products.length > 0 ? (
                            products.slice(0,8)
                            .map(product => (
                                <div className="col-md-3 card-product" key={product.productID}>
                                    <div className="card card-sp">
                                        <img src={product.coverImage} className="card-img-top" alt={product.productName} onClick={() => clickProduct(product)}/>
                                        {/* </a> */}
                                        <div className="card-body">
                                            <h3 className="product-name">{product.productName}</h3>
                                            <div className="action row me-1">
                                                <div className="product-price col-md-7 m-0 d-flex justify-content-center align-items-center">{formatVND(product.price)}</div>
                                                <div className="btn btn-success col-md-5 m-0 d-flex justify-content-center text-center" style={{ cursor: 'pointer' }} onClick={() => clickMuaNgay(product)}>Mua ngay</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center">Không có sản phẩm để hiển thị.</div>
                        )}

                        {/* <div className="see-more">
                            <button className="btn btn-success xemthem" onClick={handleSeeMore}>Xem Thêm</button>
                        </div> */}
                    </div>

                </main>
            </div>  

            <Footer></Footer> 
        </>
    );
};

export default ProductDetail;