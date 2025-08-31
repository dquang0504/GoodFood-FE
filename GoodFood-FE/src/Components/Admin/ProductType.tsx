import React, { useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import { ProductTypes } from '../../Interfaces/ProductTypes';
import Footer from './Footer';
import ReactPaginate from 'react-paginate';
import axiosInstance from '../../Services/AxiosInstance';
import { toast } from 'react-toastify';


const ProductType = () => {

    const initialDisplayT = {
        productTypeID: 0,
        status: true,
        typeName: "",
        TotalProduct: 0,
    }
    const [displayT,setDisplayT] = useState<ProductTypes>(initialDisplayT);
    const [types,setTypes] = useState<ProductTypes[]>([])
    const [err,setErr] = useState({
        errTypeName: ""
    })
    const [editting,setEditting] = useState(false);
    const [search,setSearch] = useState("");
    const [pageNum,setPageNum] = useState(1);
    const [totalPage,setTotalPage] = useState(0);

    const fetchData = async(page: number, search: string)=>{
        try {
            const response = await axiosInstance.get(`admin/product-type?page=${page}&search=${search}`);
            setTypes(response.data.data);
            setTotalPage(response.data.totalPage);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchData(pageNum,search);
    },[])

    useEffect(()=>{
        const delayDebounce = setTimeout(()=>{
            fetchData(pageNum,search);
        },500)
        return ()=> clearTimeout(delayDebounce);
    },[search,pageNum])

    const basicValidation = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (fieldName === "typeName") {
            if (e.target.value.length <= 0) {
                setErr({ ...err, errTypeName: "Please input product type!" })
            }
            else {
                setErr({ ...err, errTypeName: "" })
            }
            setDisplayT({ ...displayT, typeName: e.target.value })
        }

    }

    const handlePost = async()=>{
        if(err.errTypeName == ""){
            try {
                const response = await axiosInstance.post(`admin/product-type/create`,displayT);
                toast.success(response.data.message);
                resetForm();
            } catch (error: any) {
                console.log(error)
                setErr(error.response.data.err);
            }finally{
                fetchData(pageNum,search);
            }
        }else{
            toast.error("Please check the inputs!");
            console.log(err.errTypeName);
        }
    }

    const handlePut = async()=>{
        if(err.errTypeName == ""){
            try {
                const response = await axiosInstance.put(`admin/product-type/update?typeID=${displayT.productTypeID}`,displayT);
                toast.success(response.data.message);
                resetForm();
                setEditting(false);
            } catch (error: any) {
                console.log(error)
                setErr(error.response.data.err);
            }finally{
                fetchData(pageNum,search);
            }
        }else{
            toast.error("Please check the inputs!");
            console.log(err.errTypeName);
        }
    }

    const resetForm = async()=>{
        setDisplayT(initialDisplayT);
        setEditting(false);
    }

    const fetchDetail = async(typeID: number)=>{
        try {
            setEditting(true);
            const response = await axiosInstance.get(`admin/product-type/detail?typeID=${typeID}`)
            setDisplayT(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="wrapper">
            <SideNav></SideNav>
            <div className="main main-admin p-0">
                <HorizontalNav></HorizontalNav>
                <main className="content">
                    <div className="container-fluid p-0">
                        <div className='userDetail' style={{ marginTop: "20px" }}>
                            <h4> Product type details </h4>
                            <form className="mt-3">
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Type name:</label>
                                            <input type="text" value={displayT.typeName || ''}
                                                className="form-control"
                                                placeholder="Input product type name"
                                                onChange={(e) => basicValidation(e, "typeName")}
                                            />
                                            <em className='text-danger'>{err.errTypeName}</em>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Status:</label>
                                            <div className="form-check">
                                                <input type="radio" checked={displayT.status}
                                                    className="form-check-input" name="trangThai"
                                                    id="flexRadioDefault1"
                                                    onChange={() => setDisplayT({...displayT,status: true})}
                                                />Displayed
                                            </div>
                                            <div className="form-check">
                                                <input checked={!displayT.status}
                                                    className="form-check-input" type="radio" name="trangThai"
                                                    id="flexRadioDefault2"
                                                    onChange={() => setDisplayT({...displayT,status: false})} />Hidden
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handlePost} type='button' disabled={editting} className="btn btn-success me-2">Create</button>
                                <button onClick={handlePut} type='button' disabled={!editting} className="btn btn-primary me-2">Update</button>
                                <button onClick={resetForm} type='button' className="btn me-2" style={{ backgroundColor: '#656565' }}>Reset</button>
                            </form>
                        </div>

                        <div className="userList" style={{ marginTop: "20px" }}>
                            <h4 className="text-center"> Product type list </h4>
                            <form>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="input-group mb-3">
                                            <input value={search} name="search" type="search" className="form-control" placeholder="Search" onChange={(e)=>setSearch(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <table className="table table-striped table-hover table-light">
                                <thead className="text-center" style={{ backgroundColor: '#067a38', color: '#fff',fontSize:'0.8rem' }}>
                                    <th>Type ID</th>
                                    <th>Type name</th>
                                    <th>Total products</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </thead>
                                <tbody className="text-center">
                                    {types && types.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.productTypeID}</td>
                                            <td>{item.typeName}</td>
                                            <td>{item.TotalProduct}</td>
                                            <td>
                                                <span className={`badge ${item.status === false ? 'bg-danger' : 'bg-success'}`}>
                                                    {item.status === true ? 'Displayed' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td>
                                                <i className="fa-solid fa-pen-to-square" onClick={()=>fetchDetail(item.productTypeID)}></i>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-center" hidden={totalPage !== 0}>
                                <p className="fw-bold">No matching product type found.</p>
                            </div>

                            <div hidden={totalPage === 0} className="d-flex justify-content-between" style={{ marginTop: "25px" }}>
                                {/* Vị trí hiển thị số trang */}
                                <p className="fw-bold">Currently viewing {pageNum} / {totalPage}</p>

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

export default ProductType;