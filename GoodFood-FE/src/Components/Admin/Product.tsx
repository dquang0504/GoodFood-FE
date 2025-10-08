import React, { useCallback, useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import { Products } from '../../Interfaces/Products';
import { ProductTypes } from '../../Interfaces/ProductTypes';
import { ProductImages } from '../../Interfaces/ProductImages';
import axiosInstance from '../../Services/AxiosInstance';
import { formatVND } from '../../Services/FormatVND';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import UploadImgProduct from './UploadImgProduct';
import "yet-another-react-lightbox/styles.css";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../Firebase';
import { v4 } from 'uuid';
import Footer from './Footer';


type Cards = {
    TotalProduct: number,
    TotalInactive: number
}
const initialProductType: ProductTypes = {
    productTypeID: 0,
    typeName: "",
    status: true,
    TotalProduct: 0,
};
const Product = () => {

    const [cards, setCards] = useState<Cards>({
        TotalInactive: 0,
        TotalProduct: 0,
    })
    const [pageNum, setPageNum] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [sort, setSort] = useState("Type");
    const [search, setSearch] = useState("");
    const initialDisplayP: Products = {
        coverImage: "",
        description: "",
        insertDate: new Date(),
        price: 0,
        productID: 0,
        productName: "",
        productTypeID: 0,
        status: true,
        weight: 0,
        productType: initialProductType,
        productImages: [],
    }
    const [displayP, setDisplayP] = useState<Products>(initialDisplayP)
    const [err, setErr] = useState({
        errProductName: '',
        errPrice: '',
        errWeight: '',
        errType: '',
        errImages: ''
    });
    const [editting, setEditting] = useState(false);
    const [listLoaiSP, setListLoaiSP] = useState<ProductTypes[]>([]);
    const [products, setProducts] = useState<Products[]>([]);
    const [listHinhSP, setListHinhSP] = useState<ProductImages[]>([]);
    const [imageFile, setImageFile] = useState<File[]>([]);
    const [resetPreview, setResetPreview] = useState(false);
    const [open, setOpen] = useState(false);
    const [slides, setSlides] = useState<SlideImage[]>([]);

    const fetchData = useCallback(async (page: number, sort: string, search: string) => {
        try {
            const response = await axiosInstance.get(`admin/product?page=${page}&sort=${sort}&search=${search}`);
            setListLoaiSP(response.data.listLoaiSP);
            setProducts(response.data.data);
            setTotalPage(response.data.totalPage);
            setCards(response.data.cards);
        } catch (error) {
            console.log(error);
        }
    },[])

    useEffect(() => {
        fetchData(pageNum, sort, search);
    }, [pageNum,sort,search,fetchData]);

    const basicValidation = (e: React.ChangeEvent<HTMLInputElement> | null, selectEvent: React.ChangeEvent<HTMLSelectElement> | null, fieldName: string) => {
        if (fieldName === "productName" && e) {
            if (e.target.value.length <= 0) {
                setErr({ ...err, errProductName: "Please input product name!" })
            }
            else {
                setErr({ ...err, errProductName: "" })
            }
            setDisplayP({ ...displayP, productName: e.target.value })
        }
        else if (fieldName === "productPrice" && e) {
            if (e.target.valueAsNumber < 0) {
                setErr({ ...err, errPrice: "Price can't be lower than 0!" })
            }
            else {
                setErr({ ...err, errPrice: "" })
            }
            setDisplayP({ ...displayP, price: e.target.valueAsNumber })
        }
        else if (fieldName === "productWeight" && e) {
            if (e.target.valueAsNumber < 0) {
                setErr({ ...err, errWeight: "Weight can't be lower than 0!" })
            }
            else {
                setErr({ ...err, errWeight: "" })
            }
            setDisplayP({ ...displayP, weight: e.target.valueAsNumber })
        }
        else if (fieldName === "productType" && selectEvent) {
            if (selectEvent.target.value.length <= 0) {
                setErr({ ...err, errType: "Please choose product type!" })
            }
            else {
                setErr({ ...err, errType: "" })
            }
            const selectedType = listLoaiSP.find(item => item.typeName === selectEvent.target.value)
            if (selectedType) {
                setDisplayP({ ...displayP, productType: selectedType, productTypeID: selectedType.productTypeID });
            }
        }

    }

    const fetchDetail = async (id: number) => {
        setEditting(true);
        try {
            const response = await axiosInstance.get(`admin/product/detail?productID=${id}`);
            setDisplayP(response.data.data);
            setListHinhSP(response.data.listHinhSP);
            setSlides(
                listHinhSP && listHinhSP.map(item => ({
                    src: item.image
                }))
            );
            console.log(slides);
        } catch (error) {
            console.log(error);
        }
    }

    const handlePost = async () => {
        let newUniqueFileName = "";
        const imageURL: ProductImages[] = []
        if (imageFile.length > 0) {
            for (const file of imageFile) {
                //split the extension of the file
                const fileExtension = file.name.split('.').pop();
                const fileNameWithoutExtension = file.name.split('.').join('.');

                //create a new file name with v4 library
                newUniqueFileName = `${fileNameWithoutExtension}_${v4()}.${fileExtension}`;
                //creating a reference to firebase storage
                const storageRef = ref(storage, `AnhSanPham/${newUniqueFileName}`);
                await uploadBytes(storageRef, file); //uploading the image to storage
                imageURL.push({
                    image: await getDownloadURL(storageRef) || v4(),
                    productID: 0,
                    productImageID: 0
                }) //fetch the uploaded images' url
                //test
                // await deleteObject(ref(storage,`AnhSanPham/${newUniqueFileName}`));
            }
        }
        const newDisplayP = {
            ...displayP,
            coverImage: imageURL[0]?.image || "",
            productImages: imageURL
        };
        if (
            err.errImages === "" && err.errPrice === "" &&
            err.errProductName === "" && err.errType === "" && err.errWeight === ""
        ) {
            try {
                const response = await axiosInstance.post(`admin/product/create`, newDisplayP)
                toast.success(response.data.message);
                console.log(response);
                resetForm();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.log(error);
                setErr(error.response.data.err)
            } finally {
                fetchData(pageNum, sort, search);
            }
        } else {
            toast.error("Please check the inputs!");
        }
    }

    const handlePut = async () => {
        let newUniqueFileName = ""
        const imageURL: ProductImages[] = []
        if (imageFile.length > 0) {
            for (const file of imageFile) {
                //split the extension of the file
                const fileExtension = file.name.split('.').pop();
                const fileNameWithoutExtension = file.name.split('.').join();
                //create a new file name with v4 library
                newUniqueFileName = `${fileNameWithoutExtension}_${v4()}.${fileExtension}`
                //checking if the product already has images
                if (listHinhSP && listHinhSP.length > 0) {
                    for (const hinh of listHinhSP) {
                        const imageNameWithParams = hinh.image.split("%2F").pop();
                        const imageName = imageNameWithParams?.split("?")[0];
                        try {
                            await deleteObject(ref(storage, `AnhSanPham/${imageName}`));
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (error: any) {
                            if (error.code === 'storage/object-not-found') {
                                console.warn(`Ảnh không tồn tại: ${imageName} — đã bị xóa trước đó.`);
                            } else {
                                console.error("Lỗi khi xóa ảnh:", error);
                                throw error; // nếu lỗi khác thì vẫn ném ra để biết
                            }
                        }
                    }
                }
                //creating a reference to firebase storage
                const storageRef = ref(storage, `AnhSanPham/${newUniqueFileName}`);
                await uploadBytes(storageRef, file)
                imageURL.push({
                    image: await getDownloadURL(storageRef) || v4(),
                    productID: displayP.productID || 0,
                    productImageID: 0
                }) //fetch the uploaded images' url
                //test
                // await deleteObject(ref(storage,`AnhSanPham/${newUniqueFileName}`));
            }
        }
        const newDisplayP = {
            ...displayP,
            coverImage: imageURL[0]?.image || "",
            productImages: imageURL
        };
        if (
            err.errImages === "" && err.errPrice === "" &&
            err.errProductName === "" && err.errType === "" && err.errWeight === ""
        ) {
            try {
                const response = await axiosInstance.put(`admin/product/update?productID=${newDisplayP.productID}`, newDisplayP)
                toast.success(response.data.message);
                console.log(response);
                resetForm();
                setEditting(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.log(error);
                setErr(error.response.data.err)
            } finally {
                fetchData(pageNum, sort, search);
            }
        } else {
            toast.error("Please check the inputs!");
        }
    }

    const resetForm = () => {
        setDisplayP(initialDisplayP);
        setEditting(false);
        setImageFile([]);
        setListHinhSP([]);
        setResetPreview(true)
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData(pageNum, sort, search);
        }, 500)
        return () => clearTimeout(delayDebounce);
    }, [pageNum, sort, search])

    useEffect(() => {
        if (imageFile.length > 0) {
            setErr({ ...err, errImages: "" });
        }
    }, [imageFile])

    return (
        <div className="wrapper">
            <SideNav></SideNav>
            <div className="main main-admin p-0">
                <HorizontalNav></HorizontalNav>
                <main className="content">
                    <div className="container-fluid p-0">
                        <h1 className="h3 mb-3">Products List</h1>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body" style={{ borderRadius: 8 }}>
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Total products</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <i className="fa-solid fa-arrow-up-right-dots" style={{ color: "#067a38" }}></i>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3 fs-2">
                                            {cards.TotalProduct}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body" style={{ borderRadius: 8 }}>
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Total inactive products</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <i className="fa-solid fa-arrow-up-right-dots" style={{ color: "#067a38" }}></i>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3 fs-2">
                                            {cards.TotalInactive}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="userDetail" style={{ marginTop: "20px" }}>
                            <h4>Product details</h4>
                            <form id="productForm">
                                <input type="text" readOnly hidden name="idForUpdate" value="${idForUpdate}"></input>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Product name:</label>
                                            <input value={displayP?.productName || ''} type="text"
                                                name="tenSanPham"
                                                className="form-control"
                                                placeholder="Input product name"
                                                onChange={(event) => basicValidation(event, null, "productName")}
                                            />
                                            <em className="text-danger">{err?.errProductName}</em>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Price:</label>
                                            <input value={displayP?.price || 0}
                                                type="number" name="gia" className="form-control"
                                                placeholder="Nhập vào giá sản phẩm"
                                                onChange={(event) => basicValidation(event, null, "productPrice")}
                                            />
                                            <em className="text-danger">{err?.errPrice}</em>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Weight (gram):</label>
                                            <input value={displayP?.weight || 0}
                                                type="number" name="trongLuong"
                                                className="form-control"
                                                placeholder="Nhập vào khối lượng"
                                                onChange={(event) => basicValidation(event, null, "productWeight")}
                                            />
                                            <em className="text-danger">{err?.errWeight}</em>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Status:</label>
                                            <div className="form-check">
                                                <input type="radio" checked={displayP.status === true}
                                                    className="form-check-input" value={"Active"} name="trangThai"
                                                    id="flexRadioDefault1"
                                                    onChange={(e) => setDisplayP({ ...displayP, status: e.target.value === 'Active' })}
                                                />Active
                                            </div>
                                            <div className="form-check">
                                                <input checked={displayP.status === false}
                                                    className="form-check-input" value={"Inactive"} type="radio" name="trangThai"
                                                    id="flexRadioDefault2"
                                                    onChange={(e) => setDisplayP({ ...displayP, status: e.target.value === 'Active' })} />Inactive
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Type:</label>
                                            <select
                                                value={displayP.productType?.typeName}
                                                name="tenLoai"
                                                className="form-select"
                                                aria-label="Default select example"
                                                onChange={(event) => basicValidation(null, event, "productType")}
                                            >
                                                <option value="" hidden>Choose a type...</option>
                                                {listLoaiSP.map((loaiSP, index) => (
                                                    <option key={index} value={loaiSP.typeName}>
                                                        {loaiSP.typeName}
                                                    </option>
                                                ))}
                                            </select>
                                            <em className="text-danger">{err?.errType}</em>
                                        </div>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Choose one or multiple images:</label>
                                            <UploadImgProduct
                                                className='form-control'
                                                inputClass='upload-instructions'
                                                onFileSelect={setImageFile}
                                                reset={resetPreview}
                                            />
                                            <div className="image-gallery" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {listHinhSP && listHinhSP.map((hinh, index) => (
                                                    <div key={index}>
                                                        <img
                                                            src={hinh.image}
                                                            alt={hinh.image}
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
                                                    </div>
                                                ))}
                                                {slides && slides.length > 0 && (
                                                    <Lightbox open={open} close={() => setOpen(false)} slides={slides} />
                                                )}
                                            </div>
                                            <em className="text-danger">{err?.errImages}</em>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Description:</label>
                                            <textarea name="moTa" className="form-control" rows={3} cols={4} value={displayP?.description || ''}
                                                onChange={(event) => setDisplayP({ ...displayP, description: event.target.value })}></textarea>
                                        </div>
                                    </div>
                                </div>

                                <button type='button' disabled={editting} onClick={handlePost}
                                    className="btn btn-success me-2">Create</button>
                                <button disabled={!editting}
                                    type='button' className="btn btn-primary me-2" onClick={handlePut}>Update</button>
                                <button type='button' onClick={resetForm} className="btn me-2" style={{ backgroundColor: '#656565' }}>Reset</button>

                                <input type="hidden" name="hinhAnh" id="hinhAnh"></input>

                            </form>
                        </div>

                        <div className="userList" style={{ marginTop: "20px" }}>
                            <h4 className="text-center"> Product list </h4>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="row">
                                    <div className="col-md-4 col-xxl-8">
                                        <div className="input-group mb-3">
                                            <select onChange={(e) => setSort(e.target.value)} name="sort" className="form-select" aria-label="Default select example">
                                                <option value="Type">Type</option>
                                                <option value="Product Name">Product Name</option>
                                                <option value="Weight">Weight</option>
                                                <option value="Low to high price">Low to high price</option>
                                                <option value="High to low price">High to low price</option>
                                                <option value="Active Status">Active Status</option>
                                                <option value="Inactive Status">Inactive Status</option>
                                            </select>
                                            <input value={search} name="search" type="search" className="form-control" placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <table className="table table-striped table-hover table-light">
                                <thead className="text-center" style={{ backgroundColor: '#067a38', color: '#fff', fontSize: '0.8rem' }}>
                                    <th>Product ID</th>
                                    <th>Product name</th>
                                    <th>Price</th>
                                    <th>Weight</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                    <th>Action</th>
                                </thead>
                                <tbody className="text-center">
                                    {products && products.map((p, index) => (
                                        <tr key={index}>
                                            <td>{p.productID}</td>
                                            <td>{p.productName}</td>
                                            <td>{formatVND(p.price)}</td>
                                            <td>{p.weight}</td>
                                            <td>{p.productType?.typeName}</td>
                                            <td>
                                                <span className={`badge ${p.status === false ? 'bg-danger' : 'bg-success'}`}>
                                                    {p.status === true ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{p.description}</td>
                                            <td><i className="fa-solid fa-pen-to-square" onClick={() => fetchDetail(p.productID)}></i></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-center" hidden={totalPage !== 0}>
                                <p className="fw-bold">No matching product found</p>
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
                                <p className="fw-bold">6 records / page</p>
                            </div>

                        </div>

                    </div>
                </main>
                <Footer></Footer>
            </div>
        </div>
    );
};

export default Product;