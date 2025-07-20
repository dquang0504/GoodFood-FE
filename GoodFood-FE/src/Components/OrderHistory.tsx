import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import '../assets/css/orderhistory.css'
import { Invoices } from '../Interfaces/Invoices';
import { formatVND } from '../Services/FormatVND';
import axiosInstance from '../Services/AxiosInstance';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Footer from './Footer';
import { NavLink } from 'react-router-dom';
import { access } from 'fs';
import { Products } from '../Interfaces/Products';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';

interface InvoiceList{
    invoiceID: number,
	totalProducts: number,
    address: string,
    status: boolean,
	totalMoney: number,
    cancelReason: string,
}

export interface InvoiceDetailList{
    invoiceID: number,
    image: string,
    product: Products | null,
    quantity: number,
    totalMoney: number,
    shippingFee: number,
    reviewCheck: boolean,
}

const OrderHistory = () => {
    const {user} = useSelector((state: RootState)=>state.login)
    const statusList = ['Order Placed', 'Order Confirmed', 'Order Processing', 'Shipping', 'Delivered', 'Cancelled']
    const [activeTab,setActiveTab] = useState("Order Placed");
    const [invoiceList,setInvoiceList] = useState<InvoiceList[]>([])
    const [invoiceDetailList,setInvoiceDetailList] = useState<InvoiceDetailList[]>([]);
    const [showModal,setShowModal] = useState(false);
    const [showModalDetail,setShowModalDetail] = useState(false);
    const listReasons = [
        { id: 1, reason: "I don't want to buy anymore." },
        { id: 2, reason: "I want to update my delivery address." },
        { id: 3, reason: "I found a better price for the product." },
        { id: 4, reason: "I want to buy another product." },
        { id: 5, reason: "Other." },
    ]
    const initialInvoice: InvoiceList = {
        address: "",
        cancelReason: listReasons[0].reason,
        invoiceID: 0,
        status: false,
        totalMoney: 0,
        totalProducts: 0
    }
    const [invoice,setInvoice] = useState<InvoiceList>(initialInvoice);
    const [err,setErr] = useState({
        errReason: "",
    })
    const [otherReason,setOtherReason] = useState("");
    

    const fetchData = async(tab:string)=>{
        try {
            const response = await axiosInstance.get(`order-history?tab=${tab}&accountID=${user?.accountID}`)
            setInvoiceList(response.data.data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        fetchData(activeTab);
    },[activeTab])

    const clickXemChiTiet = async(invoiceID:number)=>{
        try {
            const response = await axiosInstance.get(`order-history/details?invoiceID=${invoiceID}`)
            setInvoiceDetailList(response.data.data);
            console.log(response);
            setShowModalDetail(true);
        } catch (error) {
            console.log(error);
        }
    }

    const clickHuy = async (invoiceID: number) => {
        // Kiểm tra nếu lý do là "Other." và ô nhập bị trống
        if (invoice.cancelReason === "Other." && otherReason.trim() === "") {
            setErr({ ...err, errReason: "Please state your reason for canceling the order!" });
            return;
        }

        // Nếu hợp lệ thì xóa lỗi
        setErr({ ...err, errReason: "" });

        try {
            const response = await axiosInstance.put(`order-history/update?invoiceID=${invoiceID}`,{cancelReason: invoice.cancelReason === "Other." ? otherReason : invoice.cancelReason});
            toast.success(response.data.message);
        } catch (error) {
            console.log(error);
        } finally {
            // Reset state khi đóng modal
            setShowModal(false);
            setOtherReason("");
            setInvoice({ ...invoice, cancelReason: listReasons[0]?.reason || "" }); // reset dropdown
            setErr({ ...err, errReason: "" });
            fetchData(activeTab);
        }
    }

    const clickMuaLai = async(productID: number, quantity: number)=>{
        try {
            
        } catch (error) {
            
        }
    }

    return (
        <>
            <Navbar></Navbar>
            <ul className="nav nav-tabs mb-4" id="myTab" role="tablist" style={{ marginTop: 80 }}>
                {statusList.map((status,index) => (
                    <li className="nav-item" key={index}>
                        <p
                            className={`nav-link ${activeTab === status ? 'active' : ''}`}
                            onClick={(event) => setActiveTab(event.currentTarget.innerText)}
                        >
                            {status}
                        </p>
                    </li>
                ))}
            </ul>
            <hr />

            <div className="container order-history-container mb-5">
                <div style={{ minHeight: '300px' }}>
                    <h3 className="cart-header mt-4">Sales Receipt</h3>
                    <div className="table-responsive mb-2">
                        <table className="table">
                            <thead className='text-center'>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Total Products</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Total Money</th>
                                    {activeTab === 'Đã hủy' ? (
                                        <th>Cancel reason</th>
                                    ) : (
                                        <></>
                                    )}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {
                                invoiceList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className='text-center'>No data to display.</td>
                                    </tr>
                                ) : (
                                    invoiceList.map((order,index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{order.invoiceID}</td>
                                            <td>{order.totalProducts}</td>
                                            <td>{order.address}</td>
                                            <td>
                                                <span className={`badge bg-${order.status ? 'success':'danger'}`}>
                                                    {order.status ? 'Paid' : 'Not Paid'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'red', fontWeight: 'bold' }}>{formatVND(order.totalMoney)}</td>
                                            {activeTab === 'Đã hủy' ? (
                                                <td>{order.cancelReason}</td>
                                            ) : (
                                                <></>
                                            )}
                                            <td className='d-flex justify-content-center'>
                                                <div>
                                                    {/* {order.tenTrangThai === 'Đang vận chuyển' ? (
                                                        <button className="btn btn-sm btn-success ms-1 me-1"
                                                        onClick={() => clickDaNhanDuocHang(order)}
                                                        >Đã nhận được hàng
                                                        </button>
                                                    ) : (
                                                        <></>
                                                    )
                                                    } */}
                                                    {activeTab === 'Đã đặt hàng' ? (
                                                        <button className="btn btn-sm btn-danger ms-1 me-1"
                                                        onClick={() => {setInvoice({...invoice,invoiceID: order.invoiceID}) ;setShowModal(true)}}
                                                        >Cancel Order
                                                        </button>
                                                    ) : (
                                                        <></>
                                                    )
                                                    }
                                                    <button
                                                        onClick={() => clickXemChiTiet(order.invoiceID)}
                                                        className="btn btn-info btn-sm ms-1 me-1"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    )
                                    })
                                )
                                }
                            </tbody>
                            </table>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <Modal show={showModal} onHide={()=>setShowModal(false)} >
                <Modal.Header closeButton className='d-flex justify-content-end '>
                <Modal.Title className='fw-bold fs-3'>Cancel reason</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className='ms-4 me-4 mt-2 mb-2'>      
                    <select className="form-select mb-4 py-2" id="ward" value={invoice.cancelReason} onChange={(e)=>setInvoice({...invoice,cancelReason: e.target.value})}>
                        {listReasons.map((item) => {
                            return <option key={item.id} value={item.reason}>{item.reason}</option>
                        })}
                    </select>
                    {invoice.cancelReason === "Other." ? (<><textarea className="form-control" id="lyDoHuy" rows={3} onChange={(e)=>setOtherReason(e.target.value)}></textarea>
                        <span className='text-danger'>{err.errReason}</span></>
                    ) : (
                        <></>
                    )}

                </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="success" onClick={() => clickHuy(invoice.invoiceID)} style={{ width: '120px' }}>
                    Xác nhận
                </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal xem chi tiết */}
            <Modal show={showModalDetail} onHide={()=>setShowModalDetail(false)} size="lg" scrollable={true}>
                <Modal.Header closeButton className='d-flex justify-content-end'>
                <Modal.Title className='fw-bold fs-3'>Receipt Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className='ms-1 me-1 mb-2'>
                    <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="purchased" role="tabpanel" aria-labelledby="purchased-tab">
                        <div className="table-responsive">
                        <table className="table table-order-history">
                            <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Image</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Total Money</th>
                                {
                                    activeTab === 'Giao thành công' && (
                                        <th>Action</th>
                                    )
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                invoiceDetailList.map((detail,index) => (
                                    <tr key={index}>
                                        <td>{detail.invoiceID}</td>
                                        <td><img src={detail.image} alt={detail.product?.productName} width="50" height="50" /></td>
                                        <td>{detail.product?.productName}</td>
                                        <td>{detail.quantity}</td>
                                        <td style={{ color: 'red' }}>{formatVND(detail.totalMoney)}</td>
                                        <td className="align-content-center">
                                        {
                                            activeTab === "Delivered" ? (
                                            <>
                                                {detail.product?.productID !== undefined && (
                                                    <NavLink to={"#"} className="btn btn-sm btn-buy-again btn-success me-2" onClick={() => { clickMuaLai(detail.product!.productID, detail.quantity) }}>Buy Again</NavLink>
                                                )}
                                                {!detail.reviewCheck ? 
                                                    (
                                                        <NavLink
                                                            className="btn btn-sm btn-review btn-warning"
                                                            to={`/home/evaluate`}
                                                            state={{invoiceID:detail.invoiceID,productID: detail.product?.productID}}
                                                        >
                                                            Review
                                                        </NavLink>
                                                    ) : 
                                                    null
                                                }
                                            </>
                                            ) : (
                                            <></>
                                            )

                                        }

                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                        </div>
                    </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-6'></div>
                        <div className='col-md-3'>Subtotal:</div>
                        <div className='col-md-3 text-end'>{formatVND(invoiceDetailList.reduce((acc,item)=> item.totalMoney + acc,0))}</div>

                        <div className='col-md-6'></div>
                        <div className='col-md-3'>Shipping fee:</div>
                        <div className='col-md-3 text-end'>{formatVND(invoiceDetailList[0]?.shippingFee)}</div>

                        <div className='col-md-6'></div>
                        <div className='col-md-3'>Invoice total:</div>
                        <div className='col-md-3 text-end fw-medium text-danger'>{formatVND(invoiceDetailList[0]?.shippingFee + invoiceDetailList.reduce((acc,item)=> acc + item.totalMoney,0))}</div>

                    </div>
                </div>
                </Modal.Body>
            </Modal>

            <Footer></Footer>        
        </>
    );
};

export default OrderHistory;