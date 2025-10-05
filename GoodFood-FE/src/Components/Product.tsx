import React, { useEffect, useRef, useState } from 'react';
import '../assets/css/product.css';
import '../assets/css/pagination.css'
import Navbar from './Navbar';
import { ProductTypes } from '../Interfaces/ProductTypes';
import axios from 'axios';
import { ENDPOINT } from '../App';
import { toast } from 'react-toastify';
import { FourSquare } from 'react-loading-indicators';
import { Products } from '../Interfaces/Products';
import { formatVND } from '../Services/FormatVND';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import Footer from './Footer';
import { Carts } from '../Interfaces/Carts';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';

/* eslint-disable @typescript-eslint/no-explicit-any */


const Product = () => {

    const [loaiSanPhams, setLoaiSanPhams] = useState<ProductTypes[]>([]);
    const { user } = useSelector((state: RootState) => state.login)
    const [timKiem, setTimKiem] = useState("");
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Products[]>([]);
    const [loai, setLoai] = useState<ProductTypes | null>(null);
    const [totalPage, setToTalPage] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [price, setPrice] = useState<{ minPrice: number, maxPrice: number }>({
        minPrice: 0,
        maxPrice: 250000,
    })
    const [orderBy, setOrderBy] = useState("ASC");
    const [text, setText] = useState("");
    //state isListening để xác định xem micro còn đang lắng nghe không
    const [isListening, setIsListening] = useState(false);
    const transcriptRef = useRef(''); // Sử dụng useRef để giữ giá trị transcript
    // Kiểm tra xem trình duyệt có hỗ trợ Web Speech API không
    const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;

    const navigate = useNavigate();


    const fetchLoaiSP = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${ENDPOINT}/products/getTypes`);
            setLoaiSanPhams(response.data.data);
        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            setLoading(false);;
        }
    }

    const fetchProductsByPage = async (page: number, searchQuery: string, loai?: ProductTypes | null) => {
        setLoading(true);
        try {
            const typeQuery = loai ? `&type=${loai.typeName}` : '';
            const response = await axios.get(`${ENDPOINT}/products?page=${page}${typeQuery}&search=${searchQuery}&minPrice=${price.minPrice}&maxPrice=${price.maxPrice}&orderBy=${orderBy}`);
            setProducts(response.data.data || []);
            setToTalPage(response.data.totalPage);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error fetching products");
        } finally {
            setLoading(false);
        }
    };

    const clickTimkiem = (timKiem: string) => {
        fetchProductsByPage(pageNum, timKiem, null);
    }

    const timKiemBangGiongNoi = () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }

    // Xử lý khi nhận được kết quả từ mic
    recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        transcriptRef.current = transcript;
        setText(transcript);
    }
    // Xử lý khi bắt đầu và kết thúc lắng nghe
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
        setIsListening(false);
        setTimKiem(transcriptRef.current);
        clickTimkiem(transcriptRef.current);
        recognition.stop();
        setTimKiem("");
        setText("");
        transcriptRef.current = "";
    }

    const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return
        try {
            setLoading(true);
            // Tạo FormData và gán file ảnh
            const formData = new FormData();
            formData.append("image", file);
            const response = await axios.post(`${ENDPOINT}/products/classify-image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            // Tìm kiếm ngay với tên sản phẩm cần tìm
            transcriptRef.current = response.data.data.productName; // Lấy tên sản phẩm có độ tin cậy cao nhất
            setTimKiem(transcriptRef.current); // Đặt text từ result vào thanh tìm kiếm
            clickTimkiem(transcriptRef.current); // Gọi hàm tìm kiếm với giá trị text
            setTimKiem("");
            setText("");
            transcriptRef.current = "";
        } catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message)
        }
        finally {
            setLoading(false);
        }
    }

    const clickMuaNgay = (product: Products) => {
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

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimKiem(event.target.value);
    }


    useEffect(() => {
        fetchLoaiSP();
    }, [])

    useEffect(() => {
        fetchProductsByPage(pageNum, timKiem, loai);
    }, [pageNum, loai, orderBy])


    return (
        <div className='body-product'>
            <Navbar></Navbar>
            <div className="container product-container mb-4" style={{ paddingTop: 70 }}>
                <div className="row">
                    <div className="col-md-2 mt-3">
                        <div className="filters">
                            <div>
                                <div className="input-group mb-3">
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search..."
                                        onChange={(event) => { handleSearch(event) }}
                                        value={text ? text : timKiem}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={() => { clickTimkiem(timKiem) }}
                                    >
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={timKiemBangGiongNoi}
                                    >
                                        <i className="fa-solid fa-microphone"></i>
                                    </button>
                                    {/* Nút upload hình ảnh */}
                                    <label className="btn btn-primary mb-0">
                                        <i className="fa-solid fa-image"></i>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture='user'
                                            style={{ display: "none" }}
                                            onChange={(event) => uploadImage(event)}
                                        />
                                    </label>
                                </div>

                                <h3>Category</h3>
                                <ul className="categories">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <li key={i}>
                                                <div className='placeholder-wave'>
                                                    <span className='placeholder col-6'></span>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        loaiSanPhams.filter(item => item.status === true)
                                            .map(loai => (
                                                <li key={loai.productTypeID} style={{ cursor: 'pointer' }}>
                                                    <a onClick={() => { setLoai(loai), setPageNum(1) }}>{loai.typeName}</a></li>
                                            ))
                                    )}
                                </ul>

                                <h3>Price</h3>
                                <div className="form-group">
                                    {/* <input type="number" className="form-control" name="minPrice" id="minPrice" placeholder="Min Price" onChange={(e)=>setPrice({...price,minPrice:e.target.valueAsNumber})} />
                                    <input type="number" className="form-control" name="maxPrice" id="maxPrice" placeholder="Max Price" c /> */}
                                    <label htmlFor="" className='form-label'>Min price: <span>{price.minPrice.toLocaleString()} VND</span></label>
                                    <input value={price.minPrice} type="range" className="form-control-range" id="priceRange" min="0" max="250000" step="1000" onChange={(e) => setPrice({ ...price, minPrice: e.target.valueAsNumber })} />

                                    <label htmlFor="" className='form-label'>Max price: <span>{price.maxPrice.toLocaleString()} VND</span></label>
                                    <input value={price.maxPrice} type="range" className="form-control-range" id="priceRange" min="0" max="250000" step="1000" onChange={(e) => setPrice({ ...price, maxPrice: e.target.valueAsNumber })} />
                                </div>
                                <button onClick={() => fetchProductsByPage(pageNum, timKiem, loai)} type="button" className="btn btn-primary">Filter</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-10">
                        <div className="sort-options">
                            <label htmlFor="sort">Order By: </label>
                            <div>
                                <select className="form-control d-inline w-auto" id="sort" name="sort" value={orderBy} onChange={(event) => setOrderBy(event.target.value)} >
                                    <option value="ASC">Low to high</option>
                                    <option value="DESC">High to low</option>
                                    {/* <option value="moinhat">Mới nhất</option> */}
                                </select>
                            </div>
                        </div>

                        {loading ?
                            // <div>Loading...</div>
                            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: 310 }}>
                                <FourSquare color="#D95D39" size="large" text="" textColor="" />
                            </div>
                            :
                            products?.length === 0 ? <div className='px-5'>No products to display...</div> :
                                <div className="similar-product row container-center">
                                    {products.filter(item => item.status === true)
                                        .map(product => (
                                            <div key={product.productID} className="col-md-4">
                                                <div className="card">
                                                    <img src={product.coverImage} alt={product.productName} onClick={() => { navigate(`/home/product-details/${product.productID}`, { state: { productID: product.productID, productType: product.productTypeID } }) }} />
                                                    <div className="card-body">
                                                        <h3 className="product-name">{product.productName}</h3>
                                                        <div className="action row">
                                                            <div className="product-price col-md-6">{formatVND(product.price)}</div>
                                                            <div className="btn btn-success col-md-5" style={{ cursor: 'pointer' }} onClick={() => clickMuaNgay(product)}>Purchase</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                        }
                        <div className="pagination justify-content-center">
                            <div className='d-flex justify-content-center' >
                                <ReactPaginate
                                    breakLabel="..."
                                    nextLabel={<i className="fa-solid fa-forward-step"></i>}
                                    onPageChange={(event) => setPageNum(event.selected + 1)}
                                    pageRangeDisplayed={3}
                                    pageCount={totalPage}
                                    previousLabel={<i className="fa-solid fa-backward-step"></i>}
                                    renderOnZeroPageCount={null}
                                    pageClassName='page-item  page-address'
                                    pageLinkClassName='page-link'
                                    previousClassName='page-item page-address'
                                    previousLinkClassName='page-link'
                                    nextClassName='page-item page-address'
                                    nextLinkClassName='page-link'
                                    breakClassName='page-item'
                                    breakLinkClassName='page-link'
                                    containerClassName='pagination'
                                    activeClassName='active'
                                    forcePage={pageNum - 1}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Product;