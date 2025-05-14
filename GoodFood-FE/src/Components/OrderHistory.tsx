import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import '../assets/css/orderhistory.css'
import { Invoices } from '../Interfaces/Invoices';
import { formatVND } from '../Services/FormatVND';
import axiosInstance from '../Services/AxiosInstance';

interface InvoiceList{
    invoiceID: number,
	totalProducts: number,
    address: string,
    status: boolean,
	totalMoney: number,
}

const OrderHistory = () => {

    const statusList = ['Đã Đặt Hàng', 'Đã Xác Nhận', 'Đang Xử Lý', 'Đang Vận Chuyển', 'Giao Thành Công', 'Đã Hủy']
    const [activeTab,setActiveTab] = useState("Đã Đặt Hàng");
    const [invoiceList,setInvoiceList] = useState<InvoiceList[]>([])

    const fetchData = async()=>{
        try {
            const response = await axiosInstance.get("order-history")
            setInvoiceList(response.data.data);
            console.log(response);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    const clickXemChiTiet = async(invoiceID:number)=>{

    }

    return (
        <>
            <Navbar></Navbar>
            <ul className="nav nav-tabs mb-4" id="myTab" role="tablist" style={{ marginTop: 80 }}>
                {statusList.map(status => (
                <li className="nav-item" key={status}>
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
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Total Products</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Total Money</th>
                                    {activeTab === 'Đã Hủy' ? (
                                        <th>Lý do hủy</th>
                                    ) : (
                                        <></>
                                    )}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
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
                                        {/* {
                                            order.tenTrangThai === 'Đã Hủy' ? (
                                            <td>{order.lyDoHuy}</td>
                                            ) : (
                                            <></>
                                            )
                                        } */}
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
                                                }
                                                {order.tenTrangThai === 'Đã đặt hàng' ? (
                                                    <button className="btn btn-sm btn-danger ms-1 me-1"
                                                    onClick={() => clickHuy(order)}
                                                    >Hủy đơn hàng
                                                    </button>
                                                ) : (
                                                    <></>
                                                )
                                                } */}
                                                <button
                                                    onClick={() => clickXemChiTiet(order.invoiceID)}
                                                    className="btn btn-info btn-sm ms-1 me-1"
                                                >
                                                    Xem Chi Tiết
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
        </>
    );
};

export default OrderHistory;