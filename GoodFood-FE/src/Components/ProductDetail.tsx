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
import internal from 'stream';
import { access } from 'fs';
import ReactPaginate from 'react-paginate';
import '../assets/css/Admin/pagination.css'
import { Carts } from '../Interfaces/Carts';
import { ProductImages } from '../Interfaces/ProductImages';

interface Stars {
    fiveStars: number,
    fourStars: number,
    threeStars: number,
    twoStars: number,
    oneStars: number,
}

const ProductDetail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()
    const { state } = useLocation();
    const initialProduct: Products = {
        coverImage: "",
        description: "",
        insertDate: new Date(),
        price: 0,
        productID: 0,
        productImages: [],
        productName: "",
        productType: null,
        productTypeID: 0,
        status: true,
        weight: 0,
    }
    const [product, setProduct] = useState<Products>(initialProduct);
    const [productImgs,setProductImgs] = useState<ProductImages[]>([]);
    const [selectedImage,setSelectedImage] = useState<ProductImages>({image: "",productID: 0,productImageID: 0})
    const [stars, setStars] = useState<Stars>({
        fiveStars: 0,
        fourStars: 0,
        oneStars: 0,
        threeStars: 0,
        twoStars: 0
    });
    const [products, setProducts] = useState<Products[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const [evaluates, setEvaluates] = useState<Reviews[]>([]);
    const { user } = useSelector((state: RootState) => state.login);
    const averageStars = useRef(0);
    const [ratingFilter, setRatingFilter] = useState('All');
    const navigator = useNavigate();
    const [pageNum, setPageNum] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [chosenItems, setChosenItems] = useState<Carts[]>([])

    const fetchDetail = async (filter: string, pageNum: number) => {
        try {
            const response = await axios.get(`${ENDPOINT}/products/detail?id=${state.productID}&filter=${filter}&page=${pageNum}`)
            console.log(response);
            setProduct(response.data.data.product);
            setSelectedImage({...selectedImage,image: response.data.data.product.coverImage});
            setProductImgs(response.data.data.productImages);
            if (response.data.data.product?.productID !== undefined) {
                const newItem: Carts = {
                    accountID: user ? user.accountID : 0,
                    cartID: 0,
                    product: response.data.data.product,
                    productID: response.data.data.product.productID,
                    quantity: quantity > 0 ? quantity : 1,
                };

                setChosenItems([newItem])
            }
            setStars(response.data.data.stars);
            setEvaluates(response.data.data.review);
            setTotalPage(response.data.totalPage)
            //calculating average rating
            const fetchedStars = response.data.data.stars
            const totalVotes = fetchedStars.fiveStars + fetchedStars.fourStars + fetchedStars.threeStars + fetchedStars.twoStars + fetchedStars.oneStars
            averageStars.current = totalVotes === 0 ? 0 : (5 * fetchedStars.fiveStars + 4 * fetchedStars.fourStars + 3 * fetchedStars.threeStars + 2 * fetchedStars.twoStars + 1 * fetchedStars.oneStars) / totalVotes
        } catch (error) {
            console.log(error);
        }
    }

    const fetchSimilar = async () => {
        try {
            const response = await axios.get(`${ENDPOINT}/products/similar?id=${state.productID}&typeID=${state.productType}`)
            setProducts(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchDetail(ratingFilter, pageNum);
        fetchSimilar();
    }, [ratingFilter, pageNum, quantity])


    const clickAddProductCart = async (product: Products) => {
        if (user === null) {
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


    const changeQuantity = (value: number) => {
        if (value > 0) {
            setQuantity(quantity + 1);
            setChosenItems(
                chosenItems.map(item => ({
                    ...item,
                    quantity: quantity + 1,
                }))
            )
        }
        else if (quantity == 1) {
            return;
        }
        else {
            setQuantity(quantity - 1);
            setChosenItems(
                chosenItems.map(item => ({
                    ...item,
                    quantity: quantity + 1,
                }))
            )
        }
    }

    const clickProduct = (product: Products) => {
        const cart: Carts[] = []
        const cartItem: Carts = {
            accountID: user ? user.accountID : 0,
            cartID: 0,
            product: product,
            productID: product.productID,
            quantity: 1
        }
        cart.push(cartItem)
        navigate("/home/payment-details", { state: { listChosenItems: cart } });
    }

    const clickMuaNgay = () => {
        navigate("/home/payment-details", { state: { listChosenItems: chosenItems } });
    }

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<i key={i} className="fa fa-star text-warning"></i>);
            } else if (rating >= (i - 0.5)) {
                stars.push(<i key={i} className="fa fa-star-half-alt text-warning"></i>);
            } else {
                stars.push(<i key={i} className="fa fa-star text-secondary"></i>);
            }
        }
        return stars;
    };

    const clickEditReview = (reviewID: number) => {
        navigate(`/home/edit-evaluate?id=${reviewID}`)
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
                                src={selectedImage.image}
                                alt={product?.productName}
                            />
                            {productImgs && productImgs.length > 0 && (
                                <div className="thumbnail-list d-flex flex-wrap mt-3">
                                {productImgs.map((img, index) => (
                                    <img
                                    key={index}
                                    src={img.image}
                                    alt={`${product?.productName} - ${index}`}
                                    className="thumbnail me-2 mb-2"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        border: img.image === selectedImage.image ? "2px solid #D95D39" : "1px solid #ddd",
                                        borderRadius: "6px",
                                    }}
                                    onClick={() => setSelectedImage(img)}
                                    />
                                ))}
                                </div>
                            )}
                        </div>
                        <div className="detail-product col-md-6">
                            <div className="name-product">{product?.productName}</div>
                            <div className="star">
                                <b className="number-star" style={{ fontSize: '25px' }}>
                                    {averageStars.current}
                                </b>
                                <span style={{ fontSize: '20px' }}>
                                    <i className="fa fa-star text-warning"></i>
                                </span>
                                <span style={{ margin: '0 10px', color: '#979797' }}> |</span>
                                {/* {totalAllStars} */}
                                <span className="number-evaluate">{evaluates.length}</span>
                                <span className="text-number-evaluate"> Review{evaluates.length >= 2 ? 's' : ''}</span>
                            </div>
                            <div className="detail-product2">
                                <div className="price">
                                    <span> {product ? formatVND(product.price) : "Loading..."}</span>
                                </div>
                                <div className="description">
                                    <span>{product?.description}</span>
                                </div>
                                <div>
                                    <div className="salary" >
                                        <div>Quantity</div>
                                        <div className="box-add-salary">
                                            <button type="button" className="btn btn-sm" onClick={() => { changeQuantity(-1) }} >-</button>
                                            <input type="text" className="form-control" value={quantity} name="soLuong" min={1} max={5} style={{ width: '50px' }} id="soLuong" />
                                            <button type="button" className="btn btn-sm" onClick={() => { changeQuantity(1) }} >+</button>
                                        </div>
                                    </div>
                                    <div className="button-btn">
                                        <button className="btn btn-add-cart btn-outline-success" onClick={() => { product && clickAddProductCart(product) }}>
                                            <i className="fa-solid fa-cart-plus"></i> Add to Cart
                                        </button>
                                        <button className="btn btn-buy btn-success" onClick={clickMuaNgay}>Purchase</button>
                                    </div>
                                </div>
                                <div style={{ margin: '20px 0 0 0' }}>
                                    <span style={{ margin: '0 40px 0 0' }}>
                                        <i style={{ color: 'red' }} className="fa-solid fa-medal"></i> Top quality product
                                    </span>
                                    <span style={{ margin: '0 40px 0 0' }}>
                                        <i style={{ color: 'red' }} className="fa-solid fa-clock"></i> Guaranteed delivery within 30 minutes
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Review */}
                    <div className="evaluate mt-3">
                        <div className="mb-1" style={{ fontSize: '30px', paddingLeft: 28 }}>PRODUCT REVIEWS</div>
                        <div className="detail-evaluate-star">
                            <span className="number-star">
                                {averageStars.current}/5 <i className="fa fa-star text-warning"></i>
                            </span>
                            <form>
                                <button type="button" name="soSao" value="All" className="btn btn-outline-success me-2" onClick={() => setRatingFilter("All")}>All</button>
                                <button type="button" name="soSao" value="5" className="btn btn-outline-success me-2" onClick={() => setRatingFilter("5")}>5 stars ({stars.fiveStars == 0 ? 0 : stars.fiveStars})</button>
                                <button type="button" name="soSao" value="4" className="btn btn-outline-success me-2" onClick={() => setRatingFilter("4")}>4 stars ({stars.fourStars})</button>
                                <button type="button" name="soSao" value="3" className="btn btn-outline-success me-2" onClick={() => setRatingFilter("3")}>3 stars ({stars.threeStars})</button>
                                <button type="button" name="soSao" value="2" className="btn btn-outline-success me-2" onClick={() => setRatingFilter("2")}>2 stars ({stars.twoStars})</button>
                                <button type="button" name="soSao" value="1" className="btn btn-outline-success" onClick={() => setRatingFilter("1")}>1 stars ({stars.oneStars})</button>
                            </form>
                            <div style={{ fontSize: '30px', margin: '-20px 0 0 40px' }}>
                                {renderStars(averageStars.current)}
                            </div>
                        </div>
                        <div className="detail-evaluate">
                            <div className="detail-evaluate">
                                <div className="card card-evaluate">
                                    {evaluates.length > 0 ? (
                                        evaluates.map(eva => (
                                            <div className="card-body content row" key={eva.reviewID}>
                                                <div className="col-md-1 mt-2 ms-3 me-3">
                                                    <img
                                                        alt=""
                                                        src={eva.reviewAccount?.avatar ?? 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg'}
                                                        width="50px"
                                                        height="50px"
                                                        style={{ borderRadius: '50%' }}
                                                    />
                                                </div>
                                                <div className="col-md-9 mt-2">
                                                    <div className="name fw-bold">{eva.reviewAccount?.fullName}</div>
                                                    <div className="review-rating">
                                                        {renderStars(eva.stars)}
                                                    </div>
                                                    <div className="time-date">{new Date(eva.reviewDate).toLocaleDateString()}</div>
                                                </div>
                                                <div className="body-content col-md-12" style={{ fontSize: '20px' }}>
                                                    <div className="mb-3">{eva.comment}</div>
                                                    {eva.reviewImages ? (
                                                        Array.isArray(eva.reviewImages) && eva.reviewImages.length > 0 && eva.reviewImages.map(img => (
                                                            <span key={img.imageName}>
                                                                <img
                                                                    src={img.imageName}
                                                                    alt=""
                                                                    width="75px"
                                                                    height="75px"
                                                                    style={{ marginRight: '10px' }}
                                                                />
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <></>
                                                    )}

                                                    {/* Phản hồi của admin */}
                                                    {eva.reviewReply ? (
                                                        Array.isArray(eva.reviewReply) && eva.reviewReply.length > 0 && eva.reviewReply.map(reply => (
                                                            <div className="admin-replies mt-3">
                                                                <h5 className="text-success">Admin's reply:</h5>
                                                                <div className="admin-reply" key={reply.replyID}>
                                                                    <strong>Admin:</strong> <span>{reply.reply}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <></>
                                                    )}

                                                    {/* Nút chỉnh sửa dành cho người dùng đang đăng nhập */}
                                                    {eva.reviewAccount?.username === user?.username && (
                                                        <div className='danhGiaBtn'>
                                                            <button className='btn btn-info' onClick={() => clickEditReview(eva.reviewID)}>
                                                                <i className="fa-regular fa-pen-to-square"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-reviews-message text-center">No reviews yet</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div hidden={totalPage === 0} className="d-flex justify-content-between" style={{ marginTop: "25px" }}>
                            {/* Vị trí hiển thị số trang */}
                            <p className="fw-bold">Currently viewing {pageNum} / {totalPage}</p>
                            {/* React Paginate */}
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel={<i className="fa-solid fa-forward-step"></i>}
                                onPageChange={(event) => setPageNum(event.selected + 1)}
                                pageRangeDisplayed={3}
                                pageCount={totalPage}
                                previousLabel={<i className="fa-solid fa-backward-step"></i>}
                                renderOnZeroPageCount={null}
                                pageClassName='page-item page-address'
                                pageLinkClassName='page-link'
                                previousClassName='page-item page-address mr-3'
                                previousLinkClassName='page-link'
                                nextClassName='page-item page-address'
                                nextLinkClassName='page-link'
                                breakClassName='page-item'
                                breakLinkClassName='page-link'
                                containerClassName='pagination'
                                activeClassName='active'
                                forcePage={pageNum - 1}
                            />
                            <p className="fw-bold">3 records / page</p>
                        </div>
                    </div>

                    <div className="similar-product-details row">
                        <div className='mb-2' style={{ fontSize: '30px' }}>SIMILAR PRODUCTS</div>
                        {products.length > 0 ? (
                            products.slice(0, 8)
                                .map(product => (
                                    <div className="col-md-3 card-product" key={product.productID}>
                                        <div className="card card-sp">
                                            <img src={product.coverImage} className="card-img-top" alt={product.productName}  />
                                            <div className="card-body">
                                                <h3 className="product-name">{product.productName}</h3>
                                                <div className="action row me-1">
                                                    <div className="product-price col-md-7 m-0 d-flex justify-content-center align-items-center">{formatVND(product.price)}</div>
                                                    <div className="btn btn-success col-md-5 m-0 d-flex justify-content-center text-center" style={{ cursor: 'pointer' }} onClick={() => clickProduct(product)}>Purchase</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center">No products to display.</div>
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