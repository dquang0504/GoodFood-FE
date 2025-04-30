import React, { useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import { Reviews } from '../../Interfaces/Reviews';
import { Replies } from '../../Interfaces/Replies';
import { ReviewImages } from '../../Interfaces/ReviewImages';
import axiosInstance from '../../Services/AxiosInstance';
import { Products } from '../../Interfaces/Products';
import { ProductImages } from '../../Interfaces/ProductImages';
import { ProductTypes } from '../../Interfaces/ProductTypes';
import Lightbox, { SlideImage } from 'yet-another-react-lightbox';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import Footer from './Footer';
import { Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';

type Cards = {
    TotalReview: number,
    Total5S: number,
}

type ClauseAnalysis = {
    clause: string,
    sentiment: string
}

type AnalyzeStruct = {
    review: string,
    clauses: string[],
    analysis: ClauseAnalysis[],
    summary: string,
}

const Review = () => {

    const [cards,setCards] = useState<Cards>({Total5S:0,TotalReview:0})
    const [pageNum,setPageNum] = useState(1);
    const [totalPage,setToTalPage] = useState(0);
    const [ngayFrom,setNgayFrom] = useState(new Date());
    const [ngayTo,setNgayTo] = useState(new Date());
    const [sort,setSort] = useState("Product Name");
    const [search,setSearch] = useState("");
    const initialUser = {
        accountID: 0,
        email: "",
        fullName: "",
        gender: true,
        password: "",
        phoneNumber: "",
        role: false,
        status: true,
        username: "",
        avatar: "",
    }
    const initialProductImgs: ProductImages = {
        image: "",
        productID: 0,
        productImageID: 0
    }
    const initialProductType: ProductTypes = {
        productTypeID: 0,
        typeName: "",
        status: true,
        TotalProduct: 0,
    };
    const initialProduct: Products = {
        coverImage: "",
        description: "",
        insertDate: new Date(),
        price: 0,
        productID: 0,
        productImages: initialProductImgs,
        productName: "",
        productType: initialProductType,
        productTypeID: 0,
        status: true,
        weight: 0
    }
    const initialDisplayR = {
        accountID: 0,
        comment: "",
        invoiceID: 0,
        productID: 0,
        reviewAccount: initialUser,
        reviewDate: new Date(),
        reviewID: 0,
        stars: 0,
        status: true,
        reviewProduct: initialProduct
    }
    const [displayR,setDisplayR] = useState<Reviews>(initialDisplayR);
    const [reviews,setReviews] = useState<Reviews[]>([]);
    const [reply,setReply] = useState<Replies>({
        accountID: 0,
        isReplied: false,
        reply: "",
        replyID: 0,
        reviewID: 0,
    })
    const [listHinhDG,setListHinhDG] = useState<ReviewImages[]>([]);
    const [err,setErr] = useState({
        errReply: "",
    })
    const [slides,setSlides] = useState<SlideImage[]>([]);
    const [open,setOpen] = useState(false);
    const [analysis,setAnalysis] = useState<AnalyzeStruct[]>([]);
    const [showModal,setShowModal] = useState(false);

    const fetchData = async(page: number, search: string, sort: string, ngayFrom: Date, ngayTo: Date)=>{
        try {
            const response = await axiosInstance(`admin/review?page=${page}&search=${search}&sort=${sort}&ngayFrom=${ngayFrom.toISOString().slice(0,10)}&ngayTo=${ngayTo.toISOString().slice(0,10)}`);
            setCards(response.data.cards);
            setReviews(response.data.data);
            setToTalPage(response.data.totalPage);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchData(pageNum,search,sort,ngayFrom,ngayTo)
    },[])

    const fetchDetail = async(reviewID: number)=>{
        try {
            const response = await axiosInstance.get(`admin/review/detail?reviewID=${reviewID}`);
            setDisplayR(response.data.data);
            setListHinhDG(response.data.listHinhDG);
            setSlides(
                (response.data.listHinhDG as ReviewImages[])?.map(item=> ({
                    src: item.imageName
                }))
            )
            setReply(response.data.reply);
            setAnalysis(response.data.result)
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }
    
    const basicValidation = (e: React.ChangeEvent<HTMLTextAreaElement>, fieldName: string) => {
        if (fieldName === "phanHoi") {
          if (e.target.value.length <= 0) {
            setErr({ ...err, errReply: "Please input your reply to the feedback!" });
          } else {
            setErr({ ...err, errReply: "" });
          }
          setReply({ ...reply, reply: e.target.value, reviewID: displayR.reviewID, accountID: displayR.accountID, });
        }
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData(pageNum,search,sort,ngayFrom,ngayTo);
    }

    useEffect(()=>{
        const delayDebounce = setTimeout(()=>{
            fetchData(pageNum,search,sort,ngayFrom,ngayTo)
        },500);
        return () => clearTimeout(delayDebounce)
    },[search,sort,pageNum])

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(event.target.value);
    
        toggleSearchAndDateFields();
    };

    const toggleSearchAndDateFields = () => {
        var sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;
        var searchField = document.getElementById("searchField") as HTMLInputElement;
        var dateFields = document.getElementById("dateFields") as HTMLDataElement;

        if (sortSelect.value === "Review Date") {
            searchField.style.display = "none";
            dateFields.style.display = "flex"; // Sử dụng flex để giữ các phần tử trong cùng một hàng
        } else {
            searchField.style.display = "flex"; // Sử dụng flex để giữ các phần tử trong cùng một hàng
            dateFields.style.display = "none";
        }
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value} = event.target
        if (name === "ngayFrom"){
            setNgayFrom(new Date(value))
        }else if(name === "ngayTo"){
            setNgayTo(new Date(value))
        }
    }

    const handlePost = async()=>{
        try {
            console.log("Hi")
            const response = await axiosInstance.post("admin/review/reply",reply);
            toast.success(response.data.message);
            setReply(response.data.data);
        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message);
        }finally{
            
        }
    }

    const handlePut = async()=>{
        try {
            console.log("Hello")
            const response = await axiosInstance.put(`admin/review/update?replyID=${reply.replyID}`,reply);
            toast.success(response.data.message);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className="wrapper">
            <SideNav></SideNav>
            <div className="main main-admin p-0">
                <HorizontalNav></HorizontalNav>
                <main className="content">
                    <div className="container-fluid p-0">
                        <h1 className="h3 mb-3">Danh sách đánh giá sản phẩm</h1>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card">
                                <div className="card-body" style={{borderRadius:8}}>
                                    <div className="row">
                                    <div className="col mt-0">
                                        <h5 className="card-title">Tổng số bình luận</h5>
                                    </div>

                                    <div className="col-auto">
                                        <div className="stat text-primary">
                                        <i className="fa-solid fa-file-invoice" style={{color: "#067a38"}}></i>
                                        </div>
                                    </div>
                                    </div>
                                    <h1 className="mt-1 mb-3 fs-2">{cards.TotalReview}</h1>
                                </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                <div className="card-body" style={{borderRadius:8}}>
                                    <div className="row">
                                    <div className="col mt-0">
                                        <h5 className="card-title">Số sản phẩm đạt 5 sao</h5>
                                    </div>

                                    <div className="col-auto">
                                        <div className="stat text-primary">
                                        <i className="fa-solid fa-file-invoice" style={{color: "#067a38"}}></i>
                                        </div>
                                    </div>
                                    </div>
                                    <h1 className="mt-1 mb-3 fs-2">{cards.Total5S}</h1>
                                </div>
                                </div>
                            </div>
                        </div>

                        <div className="commentDetail d-flex justify-content-center">
                            <div
                                className="card"
                                style={{ width: "1000px", height: "600px" }}
                            >
                                <div className="card-body" style={{borderRadius:8}}>
                                    <div hidden={displayR.accountID !== 0}>
                                        <h2
                                        className="text-center"
                                        style={{
                                            color: "grey",
                                            position: "absolute",
                                            top: "50%",
                                            left: "25%",
                                            right: "25%",
                                        }}
                                        >
                                        Choose a review to show
                                        </h2>
                                    </div>

                                    {/* ONLY DISPLAY WHEN EDIT BUTTON IS CLICKED */}
                                    <div hidden={displayR.accountID === 0}>
                                        <div className="d-flex">
                                            <img
                                                className="rounded-circle"
                                                alt="ảnh người dùng"
                                                src={displayR.reviewAccount?.avatar}
                                                style={{ width: "10%" }}
                                            />
                                            <div
                                                className="customerDetail"
                                                style={{ marginLeft: "15px" }}
                                            >
                                                <p className="fw-bold">
                                                    {displayR.reviewAccount?.fullName}
                                                </p>
                                                <p style={{ color: "rgb(163,163,163)" }}>
                                                    {new Date(displayR.reviewDate).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <p style={{fontSize:"20px"}}>{displayR.comment}</p>
                                                <span>
                                                    {[...Array(displayR.stars)].map((_, i) => (
                                                        <span key={i}>⭐</span>
                                                    ))}
                                                </span>
                                                <span>{displayR.stars}</span>
                                                <textarea
                                                    onChange={(e) => basicValidation(e, "phanHoi")}
                                                    value={reply?.reply || ""}
                                                    placeholder="Nhập phản hồi"
                                                    className="form-control m-0"
                                                    name=""
                                                    id=""
                                                    cols={6}
                                                    rows={4}  
                                                />
                                                <em className="text-danger">{err.errReply}</em>

                                                <div className="display-reply mt-3">
                                                    <button
                                                        onClick={
                                                        reply?.replyID ? handlePut : handlePost
                                                        }
                                                        className={`btn ${
                                                        reply?.replyID
                                                            ? "btn-outline-info"
                                                            : "btn-outline-success"
                                                        }`}
                                                    >
                                                        {reply?.replyID
                                                        ? "Update Reply"
                                                        : "Reply"}
                                                    </button>
                                                    <button onClick={()=>setShowModal(true)} className="btn btn-outline-secondary mx-2">Analysis</button>
                                                </div>
                                            </div>
                                            <div className="col-md-8 text-center">
                                                <div className="row">
                                                    <div
                                                        className="image-gallery"
                                                        style={{ marginTop: "10px" }}
                                                    >
                                                        {listHinhDG &&
                                                            listHinhDG.map((hinh, index) => (
                                                                <img
                                                                    src={hinh.imageName} // Đường dẫn ảnh từ imageUrls
                                                                    alt={hinh.imageName}
                                                                    style={{
                                                                    width: "100px",
                                                                    height: "120px",
                                                                    objectFit: "cover",
                                                                    margin: "5px",
                                                                    border: "1px solid #ddd",
                                                                    padding: "5px",
                                                                    cursor: 'pointer'
                                                                    }}
                                                                    onClick={()=>setOpen(true)}
                                                                />      
                                                        ))}
                                                        {slides && slides.length > 0 &&(
                                                            <Lightbox open={open} close={()=>setOpen(false)} slides={slides}></Lightbox>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="nav nav-tabs d-flex justify-content-center" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                className="nav-link active"
                                id="home-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#danhgia"
                                type="button"
                                role="tab"
                                aria-controls="home"
                                aria-selected="true"
                                >
                                Product Review
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                className="nav-link"
                                id="profile-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#phantich"
                                type="button"
                                role="tab"
                                aria-controls="profile"
                                aria-selected="false"
                                >
                                Product Review Analysis
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content" id="myTabContent">
                            {/* REVIEW SECTION HERE */}
                            <div
                                className="tab-pane fade show active"
                                id="danhgia"
                                role="tabpanel"
                                aria-labelledby="home-tab"
                            >
                                <div className="commentList" style={{ marginTop: "20px" }}>
                                    <h4 className="text-center"> Đánh giá sản phẩm </h4>
                                    <form onSubmit={(e)=>handleSearchSubmit(e)}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="input-group mb-3">
                                                <select
                                                    id="sortSelect"
                                                    name="sort"
                                                    className="form-select"
                                                    aria-label="Default select example"
                                                    onChange={(e)=>
                                                        {toggleSearchAndDateFields(); handleSortChange(e)}
                                                    }
                                                >
                                                    <option value="Product Name">Product Name</option>
                                                    <option value="Review Date">Review Date</option>
                                                    <option value="Stars">Stars</option>
                                                    <option value="Display Status">
                                                    Display Status
                                                    </option>
                                                    <option value="Hide Status">Hide Status</option>
                                                    <option value="Comment">Comment</option>
                                                </select>
                                                <div id="searchField">
                                                    <input
                                                    name="search"
                                                    type="search"
                                                    value={search}
                                                    className="form-control"
                                                    placeholder="Tìm kiếm"
                                                    onChange={(e)=>setSearch(e.target.value)}
                                                    />

                                                </div>
                                                </div>
                                            </div>

                                            <div
                                                id="dateFields"
                                                className="col-md-6"
                                                style={{ display: "none" }}
                                            >
                                                <div className="input-group mb-3">
                                                    <input
                                                        name="ngayFrom"
                                                        type="date"
                                                        className="form-control"
                                                        placeholder="Từ"
                                                        onChange={(e)=>handleDateChange(e)}
                                                    />
                                                    <input
                                                        name="ngayTo"
                                                        type="date"
                                                        className="form-control"
                                                        placeholder="Đến"
                                                        onChange={(e)=>handleDateChange(e)}
                                                    />
                                                    <button type="submit" className="btn btn-success">Tìm kiếm</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    <table className="table table-striped table-hover table-light">
                                        <thead className="text-center" style={{ backgroundColor: '#067a38', color: '#fff',fontSize:'0.8rem' }}>
                                            <tr>
                                                <th>Mã đánh giá</th>
                                                <th>Ngày đánh giá</th>
                                                <th>Trạng thái</th>
                                                <th>Tên khách hàng</th>
                                                <th>Tên sản phẩm</th>
                                                <th>Số sao</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-center">
                                            {reviews && reviews.map((r, index) => (
                                                <tr key={index}>
                                                <td>{r.reviewID}</td>
                                                <td>{new Date(r.reviewDate).toLocaleString()}</td>
                                                <td>
                                                    <span
                                                    className={`badge ${
                                                        r.status ? "bg-success" : "bg-danger"
                                                    }`}
                                                    >
                                                    {r.status ? "Displayed" : "Hidden"}
                                                    </span>
                                                </td>
                                                <td>{r.reviewAccount?.fullName}</td>
                                                <td>{r.reviewProduct?.productName}</td>
                                                <td>
                                                    {[...Array(r.stars)].map((_, i) => (
                                                    <span key={i}>⭐</span>
                                                    ))}
                                                </td>
                                                <td>
                                                    <i
                                                    className="fa-solid fa-pen-to-square"
                                                    onClick={()=>fetchDetail(r.reviewID)}
                                                    ></i>
                                                </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                    </table>

                                    <div className="text-center" hidden={totalPage !== 0}>
                                        <p className="fw-bold">Không tìm thấy đánh giá tương ứng</p>
                                    </div>

                                    <div hidden={totalPage===0} className="d-flex justify-content-between" style={{marginTop:"25px"}}>
                                        {/* Vị trí hiển thị số trang */}
                                        <p className="fw-bold">Đang xem trang {pageNum} / {totalPage}</p>

                                        
                                        {/* React Paginate */}
                                        <ReactPaginate
                                                breakLabel="..."
                                                nextLabel={<i className="fa-solid fa-forward-step"></i>}
                                                onPageChange={(event)=>setPageNum(event.selected + 1)}
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
                                        <p className="fw-bold">6 bản ghi / 1 trang</p>
                                    </div>         

                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Modal show={showModal} onHide={()=>setShowModal(false)}>
                    <ModalHeader closeButton className=''>
                        <ModalTitle className='fw-bold fs-3 mx-auto'>Sentiment Analysis</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        {/* Sentiment Analysis */}
                        <div className="sentiment-analysis mt-4">
                            {analysis?.map((item, index) => (
                                <div key={index} className="sentiment-item">
                                    {item.analysis?.map(clauseOrSentiment => (
                                        <p>
                                        <span
                                            className={`sentiment-label ${clauseOrSentiment.sentiment.toLowerCase()}`}
                                        >
                                            {clauseOrSentiment.sentiment === "POS"
                                                ? "POSITIVE"
                                                : clauseOrSentiment.sentiment === "NEG"
                                                ? "NEGATIVE"
                                                : "NEUTRAL"}
                                        </span>
                                            : {clauseOrSentiment.clause}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>                        
                    </ModalBody>
                </Modal>

                <Footer></Footer>

            </div>
        </div>
    );
};

export default Review;