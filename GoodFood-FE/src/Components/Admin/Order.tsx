import React, { useCallback, useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import axiosInstance, { ApiError } from '../../Services/AxiosInstance';
import { Invoices } from '../../Interfaces/Invoices';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import { InvoiceStatuses } from '../../Interfaces/InvoicesStatuses';
import { Modal } from 'react-bootstrap';
import Footer from './Footer';
import ReactPaginate from 'react-paginate';
import { formatVND } from '../../Services/FormatVND';
import { toast } from 'react-toastify';
import axios from 'axios';

type Cards = {
    TotalInvoice: number,
    TotalCanceled: number,
}
type InvoiceDetailResponse = {
    InvoiceDetailID: number,
    InvoiceID: number,
    Price: number,
    ProductID: number,
    ProductName: string,
    Quantity: number,
    ReceiveAddress: string,
    ReceiveName: string,
    ReceivePhone: string
}

const Order = () => {

    const [ngayFrom, setNgayFrom] = useState(new Date());
    const [ngayTo, setNgayTo] = useState(new Date());
    const [pageNum, setPageNum] = useState(1);
    const [totalPage, setToTalPage] = useState(0);
    const [sort, setSort] = useState("Invoice ID");
    const [search, setSearch] = useState("");
    const { user } = useSelector((state: RootState) => state.login);
    const [editting, setEditting] = useState(false);
    const [show, setShow] = useState(false);
    const [cards, setCards] = useState<Cards>({
        TotalInvoice: 0,
        TotalCanceled: 0,
    });
    const [invoices, setInvoices] = useState<Invoices[]>([]);
    const [displayI, setDisplayI] = useState<InvoiceDetailResponse[]>();
    const initialInvoice = {
        accountID: user ? user.accountID : 0,
        cancelReason: "",
        invoiceID: 0,
        invoiceStatus: null,
        invoiceStatusID: 0,
        note: "",
        createdAt: new Date().toISOString(),
        paymentMethod: false,
        receiveAddress: "",
        receiveName: "",
        receivePhone: "",
        shippingFee: 0,
        status: false,
        totalPrice: 0,
    }
    const [displayInvoice, setDisplayInvoice] = useState<Invoices>(initialInvoice);
    const [statusList, setStatusList] = useState<InvoiceStatuses[]>([]);
    const initialInvoiceStatus = {
        invoiceStatusID: 0,
        statusName: ""
    }
    const [status, setStatus] = useState<InvoiceStatuses>(initialInvoiceStatus)

    const fetchData = useCallback(async (page: number, sort: string, search: string, dateFrom: Date, dateTo: Date) => {
        try {
            const response = await axiosInstance.get(`admin/order?page=${page}&sort=${sort}&search=${search}&dateFrom=${dateFrom.toISOString().slice(0, 10)}&dateTo=${dateTo.toISOString().slice(0, 10)}`);
            setCards(response.data.cards);
            setInvoices(response.data.data);
            setToTalPage(response.data.totalPage);
        } catch (error: unknown) {
            if (axios.isAxiosError<ApiError>(error)) {
                toast.error(error.response?.data?.message ?? "Unexpected error");
            } else {
                console.error(error);
                toast.error("An unexpected error occurred");
            }
        }
    },[])

    useEffect(() => {
        fetchData(pageNum, sort, search, ngayFrom, ngayTo);
    }, [pageNum, sort, search, ngayFrom, ngayTo, fetchData]);

    const handleShow = (invoiceID: number, status: InvoiceStatuses) => {
        if (statusList[0].statusName === "Delivered" || statusList[0].statusName === "Cancelled") {
            setEditting(false);
            return;
        }
        if (status.statusName === "Cancelled") {
            setShow(true);
        }
        else {
            updateOrder(invoiceID, status.statusName);
        }

    }

    const updateOrder = async (invoiceID: number, statusName: string) => {
        const payload = {
            statusName: statusName,
            cancelReason: displayInvoice.cancelReason
        }
        if (statusList[0].statusName === "Delivered" || statusList[0].statusName === "Cancelled") {
            return;
        }
        try {
            const response = await axiosInstance.put(`admin/order/update?invoiceID=${invoiceID}`, payload)
            console.log(response)
            toast.success(response.data.message);
        } catch (error) {
            console.log(error);
        } finally {
            fetchData(pageNum, sort, search, ngayFrom, ngayTo)
            fetchDetail(displayI ? displayI[0].InvoiceID : 0)
            setShow(false);
        }
    }

    const handleSend = (invoiceID: number, status: InvoiceStatuses) => {
        setShow(true);
        updateOrder(invoiceID, status.statusName);
    }


    const toggleSearchAndDateFields = () => {
        const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;
        const searchField = document.getElementById("searchField") as HTMLElement;
        const dateFields = document.getElementById("dateFields") as HTMLElement;

        if (sortSelect && sortSelect.value === "Created at") {
            searchField.style.display = "none";
            dateFields.style.display = "flex"; // Keep elements in the same row
        } else if (sortSelect) {
            searchField.style.display = "flex"; // Keep elements in the same row
            dateFields.style.display = "none";
        }
    }

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(event.target.value);
        toggleSearchAndDateFields();
    }

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'ngayFrom') {
            setNgayFrom(new Date(value));

        } else if (name === 'ngayTo') {
            setNgayTo(new Date(value));
        }
    }

    const fetchDetail = async (invoiceID: number) => {
        setEditting(true);
        try {
            const response = await axiosInstance.get(`admin/order/detail?invoiceID=${invoiceID}`)
            setDisplayI(response.data.listInvoiceDetails);
            setStatusList(response.data.listStatus);
            console.log(response);
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        if (statusList.length === 1) {
            setEditting(false);
        } else if (statusList.length > 1) {
            setEditting(true);
        }
    }, [editting, statusList])


    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        fetchData(pageNum, sort, search, ngayFrom, ngayTo);
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData(pageNum, sort, search, ngayFrom, ngayTo);
        }, 500); // debounce 500ms tránh spam gọi API liên tục

        return () => clearTimeout(delayDebounce);
    }, [search, sort, pageNum, ngayFrom,ngayTo,fetchData]); // tự động gọi lại mỗi khi search/sort/pageNum thay đổi

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    return (
        <div className="wrapper">
            <SideNav></SideNav>

            <div className="main main-admin p-0">
                <HorizontalNav></HorizontalNav>
                <main className="content">
                    <div className="container-fluid p-0">
                        <h1 className="h3 mb-3">Invoice Management</h1>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body" style={{ borderRadius: 8 }}>
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Total invoices</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <i className="fa-solid fa-file-invoice" style={{ color: "#067a38" }}></i>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3 fs-2">{cards.TotalInvoice}</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body" style={{ borderRadius: 8 }}>
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Total cancelled invoices</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <i className="fa-solid fa-file-invoice" style={{ color: "#067a38" }}></i>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3 fs-2">{cards.TotalCanceled}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="invoiceDetail" style={{ marginTop: "20px" }}>
                            <h4> Detailed invoices </h4>
                            <form>
                                <div className="row">
                                    <div className="col-md-8 col-xxl-8">
                                        <table className="table table-striped table-hover table-light">
                                            <thead className="text-center" style={{ backgroundColor: '#067a38', color: '#fff', fontSize: '0.8rem' }}>
                                                <th>Product name</th>
                                                <th>Quantity</th>
                                                <th>Customer name</th>
                                                <th>Delivery address</th>
                                                <th>Phone number</th>
                                            </thead>

                                            <tbody className="text-center">
                                                {displayI && displayI.map((detail, index) => (
                                                    <tr key={index}>
                                                        <td>{detail.ProductName}</td>
                                                        <td>{detail.Quantity}</td>
                                                        <td>{detail.ReceiveName}</td>
                                                        <td>{detail.ReceiveAddress}</td>
                                                        <td>{detail.ReceivePhone}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Status:</label>
                                            <select value={status.statusName} onChange={(e) => setStatus({ ...status, statusName: e.target.value })} name="trangThaiHoaDon.tenTrangThai" className="form-select"
                                                aria-label="Default select example">
                                                {statusList !== null ? (
                                                    statusList.map((item, index) => (
                                                        <option value={item.statusName} key={index}>{item.statusName}</option>
                                                    ))
                                                ) : (
                                                    <option value={displayInvoice.invoiceStatus?.statusName}>{displayInvoice.invoiceStatus?.statusName}</option>
                                                )}
                                            </select>
                                            {/* <em className="text-danger" th:text="${errType}"></em> */}
                                        </div>

                                        <button
                                            disabled={!editting}
                                            onClick={() => displayI?.[0] && handleShow(displayI[0].InvoiceID, status)}
                                            className="btn btn-primary"
                                            type="button"
                                        >
                                            Update invoice status
                                        </button>
                                        <Modal show={show} onHide={() => setShow(false)} backdrop="static" aria-labelledby="contained-modal-title-vcenter" centered>
                                            <Modal.Header closeButton>
                                                <Modal.Title id="contained-modal-title-vcenter">Reason for cancelling</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <div className='mb-3'>
                                                    <textarea onChange={(event) => setDisplayInvoice({ ...displayInvoice, cancelReason: event.target.value })} placeholder="Your excuse for cancelling customer's order..." className='form-control' name="" id="" cols={3} rows={6}></textarea>
                                                </div>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <button className='btn btn-primary' onClick={() => displayI?.[0] && handleSend(displayI[0].InvoiceID, status)}>
                                                    Send
                                                </button>
                                            </Modal.Footer>
                                        </Modal>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="invoiceList" style={{ marginTop: "20px" }}>
                            <h4 className="text-center"> Invoice list </h4>
                            <form onSubmit={(event) => handleSearchSubmit(event)}>
                                <div className="row">
                                    <div className="col-md-4 col-xxl-6">
                                        <div className="input-group mb-3">
                                            <select id="sortSelect" name="sort" onChange={(event) => { toggleSearchAndDateFields(); handleSortChange(event) }}
                                                className="form-select" aria-label="Default select example">
                                                <option value="Invoice ID">Invoice ID</option>
                                                <option value="Customer name">Customer name</option>
                                                <option value="Created at">Created at</option>
                                                <option value="Invoice status">Invoice status</option>
                                            </select>
                                            <div id="searchField">
                                                <input name="search" type="search" className="form-control"
                                                    placeholder="Search" value={search} onChange={handleSearchChange}></input>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="dateFields" className="col-md-8 col-xxl-6" style={{ display: "none" }}>
                                        <div className="input-group mb-3">
                                            <input name="ngayFrom" type="date"
                                                className="form-control" placeholder="From" onChange={(event) => handleDateChange(event)}></input>
                                            <input name="ngayTo" type="date"
                                                className="form-control" placeholder="To" onChange={(event) => handleDateChange(event)}></input>
                                            <button type="submit" className="btn btn-success">Search</button>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <table className="table table-striped table-hover table-light">
                                <thead className="text-center align-middle" style={{ backgroundColor: '#067a38', color: '#fff', fontSize: '0.8rem' }}>
                                    <th>Invoice ID</th>
                                    <th>Created at</th>
                                    <th>Invoice status</th>
                                    <th>Invoice total</th>
                                    <th>Payment status</th>
                                    <th>Notes</th>
                                    <th>Shipping fee</th>
                                    <th>Payment method</th>
                                    <th>Action</th>
                                </thead>

                                <tbody className="text-center">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.invoiceID}>
                                            <td>{invoice.invoiceID}</td>
                                            <td>{invoice.createdAt.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${invoice.invoiceStatus?.statusName === 'Cancelled' ? 'bg-danger' : invoice.invoiceStatus?.statusName === 'Processing' ? 'bg-warning' : invoice.invoiceStatus?.statusName === 'Shipping' ? 'bg-info' : 'bg-success'}`}>
                                                    {invoice.invoiceStatus?.statusName}
                                                </span>
                                            </td>
                                            <td>
                                                <span>{formatVND(invoice.totalPrice)}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${invoice.status ? 'bg-success' : 'bg-danger'}`}>
                                                    {invoice.status ? 'Paid' : 'Not paid'}
                                                </span>
                                            </td>
                                            <td>{invoice.note !== "" ? invoice.note : 'None'}</td>
                                            <td>
                                                <span>{formatVND(invoice.shippingFee)}</span>
                                            </td>
                                            <td>{invoice.paymentMethod ? 'COD' : 'ONLINE'}</td>
                                            <td>
                                                <i className="fa-solid fa-pen-to-square" onClick={() => fetchDetail(invoice.invoiceID)}></i>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-center" hidden={totalPage !== 0}>
                                <p className="fw-bold">No matching invoice found.</p>
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

export default Order;