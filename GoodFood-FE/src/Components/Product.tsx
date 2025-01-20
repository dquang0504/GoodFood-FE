import React, { useEffect, useState } from 'react';
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


const Product = () => {

    const [loaiSanPhams, setLoaiSanPhams] = useState<ProductTypes[]>([]);
    const [text,setText] = useState("");
    const [timKiem,setTimKiem] = useState("");
    const [loading,setLoading] = useState(false);
    const [products,setProducts] = useState<Products[]>([]);
    const [valueSapXep,setValueSapXep] = useState("");
    const [totalPage,setToTalPage] = useState(0);
    const [pageNum,setPageNum] = useState(1); 
    const navigate = useNavigate();


    const fetchLoaiSP = async()=>{
        try {
            const response = await axios.get(`${ENDPOINT}/products/getTypes`);
            setLoaiSanPhams(response.data.data);
        } catch (error : any) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    const fetchProductsByPage = async (page: number, loai?: ProductTypes | null) => {
        try {
            const typeQuery = loai ? `&type=${loai.typeName}` : '';
            const response = await axios.get(`${ENDPOINT}/products?page=${page}${typeQuery}&search=`);
            setProducts(response.data.data);
            setToTalPage(response.data.totalPage);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error fetching products");
        }
    };

    const clickTimkiem = ()=>{

    }

    const timKiemBangGiongNoi = ()=>{
        
    }

    const uploadImage = ()=>{

    }

    const clickChonLoai = async(loai?: ProductTypes | null)=>{
        console.log(loai?.typeName)
        fetchProductsByPage(1,loai)
    }

    const clickSapXep = (event: React.ChangeEvent<HTMLSelectElement>)=>{

    }

    const clickMuaNgay = (product: Products)=>{

    }


    useEffect(()=>{
        fetchLoaiSP();
    },[])

    useEffect(()=>{
        fetchProductsByPage(pageNum);
    },[pageNum])

    // useEffect(()=>{
    //     handlePageClick(pageNum);
    // },[pageNum])

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
                                        placeholder="Tìm kiếm..."
                                        onChange={(event) => { setTimKiem(event.target.value) }}
                                        value={text ? text : timKiem}
                                    />
                                    <button
                                        className="btn btn-success"
                                        type="button"
                                        onClick={() => { clickTimkiem() }}
                                    >
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        type="button"
                                        onClick={timKiemBangGiongNoi}
                                    >
                                        <i className="fa-solid fa-microphone"></i>
                                    </button>
                                    {/* Nút upload hình ảnh */}
                                    <label className="btn btn-success mb-0">
                                        <i className="fa-solid fa-image"></i>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture='user'
                                            style={{ display: "none" }}
                                            onChange={uploadImage}
                                        />
                                    </label>
                                </div>

                                <h3>Danh mục</h3>
                                <ul className="categories">
                                    {loaiSanPhams.filter(item => item.status === true)
                                        .map(loai => (
                                            <li key={loai.productTypeID} style={{cursor:'pointer'}}>
                                                <a onClick={() => { clickChonLoai(loai) }}>{loai.typeName}</a></li>
                                        ))}
                                </ul>

                                {/* <h3>Giá</h3>
                                <div className="form-group">
                                    <input type="number" className="form-control" name="minPrice" id="minPrice" placeholder="Min Price" />
                                    <input type="number" className="form-control" name="maxPrice" id="maxPrice" placeholder="Max Price" />
                                    <input type="range" className="form-control-range" id="priceRange" min="0" max="250000" step="1000" />
                                    <span id="priceRangeLabel">0 VND - 250000 VND</span>
                                </div>
                                <button type="submit" className="btn btn-primary">Lọc</button> */}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-10">
                        <div className="sort-options">
                            <label htmlFor="sort">Sắp xếp theo: </label>
                            <div>
                                <select className="form-control d-inline w-auto" id="sort" name="sort" value={valueSapXep} onChange={(event) => clickSapXep(event)} >
                                    <option value="banchaynhat" >Vui lòng chọn</option>
                                    <option value="giatangdan">Giá tăng dần</option>
                                    <option value="giagiamdan">Giá giảm dần</option>
                                    {/* <option value="moinhat">Mới nhất</option> */}
                                </select>
                            </div>
                        </div>
                       
                        {loading ? 
                            // <div>Loading...</div>
                            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: 310 }}>
                                <FourSquare color="#067A38" size="large" text="" textColor="" />
                            </div>
                            :
                            products.length === 0 ? <div className='px-5'>Không có sản phẩm để hiển thị.</div> :
                                <div className="similar-product row container-center">
                                    {products.filter(item => item.status === true)
                                        .map(product => (
                                            <div key={product.productID} className="col-md-4">
                                                <div className="card">
                                                    <img src={product.coverImage} alt={product.productName} onClick={() => { navigate(`/home/product-details/${product.productID}`) }} />
                                                    <div className="card-body">
                                                        <h3 className="product-name">{product.productName}</h3>
                                                        <div className="action row">
                                                            <div className="product-price col-md-6">{formatVND(product.price)}</div>
                                                            <div className="btn btn-success col-md-5" style={{ cursor: 'pointer' }} onClick={() => clickMuaNgay(product)}>Mua ngay</div>
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
                                    onPageChange={(event)=>setPageNum(event.selected + 1)}
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
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* {imageURL && (
                <img
                    src={imageURL}
                    alt="Upload Preview"
                    crossOrigin="anonymous"
                    ref={imageRef}
                    onLoad={identify} // Gọi identify sau khi ảnh đã load xong
                    style={{ display: "none" }}
                />
            )} */}

            <Footer />
        </div>
    );
};

export default Product;