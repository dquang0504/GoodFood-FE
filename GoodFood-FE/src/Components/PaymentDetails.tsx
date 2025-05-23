import React, { useEffect, useReducer, useRef, useState } from 'react';
import '../assets/css/PaymentDetails.css'
import Navbar from './Navbar';
import { NavLink, useLocation } from 'react-router-dom';
import { Addresses } from '../Interfaces/Addresses';
import { useDispatch, useSelector } from 'react-redux';
import { rootCertificates } from 'tls';
import { AppDispatch, RootState } from '../Store/store';
import axiosInstance from '../Services/AxiosInstance';
import { toast } from 'react-toastify';
import { Invoices } from '../Interfaces/Invoices';
import { Carts } from '../Interfaces/Carts';
import { formatVND } from '../Services/FormatVND';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import Footer from './Footer';
import { format } from 'date-fns';
import { InvoiceDetails } from '../Interfaces/InvoiceDetails';
import { deleteCartItem } from '../Slices/CartSlice';

const PaymentDetails = () => {

    const apiKey = import.meta.env.VITE_API_GHN;
    const dispatch = useDispatch<AppDispatch>()
    const {state} = useLocation();
    const [listItemClickChon,setListItemClickChon] = useState<Carts[]>(state.listChosenItems)
    console.log(listItemClickChon);
    const {user} = useSelector((state:RootState)=>state.login);
    const initialInvoice = {
        accountID: user ? user.accountID : 0,
        cancelReason: "",
        invoiceID: 0,
        invoiceStatusID: 1,
        note: "",
        paymentDate: new Date().toISOString(),
        paymentMethod: true,
        receiveAddress: "",
        receiveName: "",
        receivePhone: "",
        shippingFee: 0,
        status: false,
        totalPrice: 0,
        invoiceStatus: null
    }
    const initialAddress = {
        accountID: user ? user.accountID : 0,
        address: "",
        addressID: 0,
        deleteStatus: false,
        districtID: 0,
        fullName: "",
        phoneNumber: "",
        provinceID: 0,
        specificAddress: "",
        status: false,
        wardCode: "",
        wardID: 0
    }
    const initialInvoiceDetails = listItemClickChon.map(item=>({
        invoiceDetailID: 0,
        productID: item.productID,
        quantity: item.quantity,
        price: item.product.price * item.quantity,
        invoiceID: 0,
        product: null,
        invoice: null
    }))
    const [address,setAddress] = useState<Addresses>(initialAddress)
    const [invoice,setInvoice] = useState<Invoices>(initialInvoice)
    const [invoiceDetails,setInvoiceDetails] = useState<InvoiceDetails[]>(initialInvoiceDetails)
    const totalTemp = useRef(listItemClickChon.reduce((acc,item) => acc + (item.product.price * item.quantity),0))
    const [showModal,setShowModal] = useState(false);
    const [listAddress, setListAddress] = useState<Addresses[]>([]);

    const fetchAddress = async()=>{
        try {
            const response = await axiosInstance.get(`address/fill?accountID=${user?.accountID}`)
            setAddress(response.data.data);
            const trimmed: string = response.data.data.specificAddress
            const addr = trimmed.trim() + ", " + response.data.data.address;
            setInvoice({...invoice,receiveAddress: addr, receiveName: response.data.data.fullName, receivePhone: response.data.data.phoneNumber})
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    }

    const fetchListDiaChi = async(page: number)=>{
        try {
            const response = await axiosInstance.get(`address/fetch?page=${page}&accountID=${user?.accountID}`)
            setListAddress(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const clickChonThayDoiDiaChi = async(item: Addresses)=>{
        try {
            const response = await axiosInstance.put(`address/quickChange?accountID=${user?.accountID}&addressID=${item.addressID}&toBeDisabled=${address.addressID}`);
            setAddress(response.data.data);
            calculateFee();
            toast.success(response.data.message);
        } catch (error) {
            console.log(error);
        }
        finally{
            setShowModal(false);
        }
    }

    const calculateFee = async()=>{
        console.log(listItemClickChon);
        const totalWeight = listItemClickChon.reduce((acc,item)=> acc + (item.product.weight * item.quantity),0)
        try {
            const data = {
                from_district_id: 1573,
                from_ward_code: "550201",
                service_id: 53320,
                service_type_id: 2,
                to_district_id: address.districtID,
                to_ward_code: address.wardCode,
                weight: totalWeight,
            }
            const response = await axios.post(`https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`,data,{
                headers:{
                    "Token": apiKey,
                    "Content-Type": "application/json",
                    "ShopId": 5154280,
                }
            })
            console.log(totalWeight)
            setInvoice({...invoice,shippingFee: response.data.data.service_fee, totalPrice: response.data.data.service_fee + totalTemp.current})
        } catch (error) {
            console.log(error);
        }
        
    }

    useEffect(()=>{
        fetchAddress();
    },[])

    useEffect(()=>{
        calculateFee();
        fetchListDiaChi(1);
    },[address])

    const clickDatHang = async()=>{
        const payload = {
            invoice: invoice,
            invoiceDetails: invoiceDetails
        }
        console.log(invoiceDetails);
        try {
            const response = await axiosInstance.post(`invoice/pay`,payload);
            console.log(response);
            toast.success(response.data.message);
        } catch (error) {
            console.log(error)
        }finally{
            listItemClickChon.map(item=>(
                dispatch(deleteCartItem({cartID: item.cartID,accountID: user ? user.accountID : 0}))
            ))
        }
    }

    return (
        <>
           < Navbar/> 
            <div className='container-pay-details ' style={{paddingTop:60}}>
                <div className="container pt-2 pb-5">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><NavLink to={"/home/cart"}>Giỏ hàng</NavLink></li>
                            <li className="breadcrumb-item"><span>Chi tiết thanh toán</span></li>
                        </ol>
                    </nav>

                    <h3 className="section-header">Thông tin thanh toán</h3>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="order-details">
                                <h4>Thông Tin Thanh Toán</h4>
                                <span>Thay đổi địa chỉ <span className='text-danger fw-bold' style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>Tại đây</span> </span>
                                <div className='mt-1'>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="text" className="form-control" id="soDienThoai" value={address.phoneNumber} placeholder="Nhập địa chỉ số điện thoại" disabled={true} />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và Tên</label>
                                        <input type="text" className="form-control" id="name" value={address.fullName} placeholder="Nhập họ và tên" disabled={true} />
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ</label>
                                        <input type="text" className="form-control" id="address" value={address.address + ", " + address.specificAddress} placeholder="Nhập địa chỉ" disabled={true} />
                                    </div>
                                    <h4 className='mt-2'>Thông Tin Bổ Sung</h4>
                                    <div className="form-group">
                                        <label>Ghi chú đơn hàng (tùy chọn)</label>
                                        <textarea className="form-control" id="note" rows={3} placeholder="Nhập ghi chú về đơn hàng" onChange={(event) => setInvoice({...invoice,note: event.target.value})} ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="order-summary">
                                <h4>Đơn Hàng Của Bạn</h4>
                                <table className="table table-borderless">
                                    <tbody>
                                        {
                                            listItemClickChon.map((item) => {
                                                return (
                                                    <tr key={item.cartID}>
                                                        <td>{item.product.productName} × {item.quantity}</td>
                                                        <td className="text-right"><span className='d-flex justify-content-end me-2'>{formatVND(item.product.price * item.quantity)}</span></td>
                                                    </tr>
                                                )
                                            })
                                        }

                                        <tr>
                                            <td>Tổng tiền sản phẩm</td>
                                            <td className="text-right"><span className='d-flex justify-content-end me-2'>{formatVND(totalTemp.current)}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Phí vận chuyển</td>
                                            <td className="text-right"><span className='d-flex justify-content-end me-2'>{formatVND(invoice.shippingFee)}</span></td>
                                        </tr>
                                        <tr>
                                            <td className="total-amount">Tổng thanh toán</td>
                                            <td className="text-right total-amount"><span className='d-flex justify-content-end me-2'>{formatVND(totalTemp.current + invoice.shippingFee)}</span></td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="paymentMethod" id="cod" value="cod" checked={invoice.paymentMethod} onChange={() => setInvoice({...invoice,paymentMethod: true})} />
                                    <label className="form-check-label" htmlFor="cod">
                                        Thanh toán khi nhận hàng (COD)
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="paymentMethod" id="online" checked={!invoice.paymentMethod} value="online" onChange={() => setInvoice({...invoice,paymentMethod: false})} />
                                    <label className="form-check-label" htmlFor="online">
                                        Thanh toán online
                                    </label>
                                    {
                                        invoice.paymentMethod === false ? (
                                            <div className='ps-3'>
                                                <div>
                                                    <input className="form-check-input" type="radio" name="paymentMethodType" id="vnpay" value="vnpay" checked={true} onChange={() => setInvoice({...invoice,paymentMethod: false})} />
                                                    <label className="form-check-label" htmlFor="vnpay">
                                                        <img width={43} alt='' src='https://firebasestorage.googleapis.com/v0/b/fivefood-datn-8a1cf.appspot.com/o/AnhLogo%2FLogo-VNPAY-QR-1.webp?alt=media&token=46e719a7-72ac-4de4-b6fc-118a16c3ab1b' /> VNPAY
                                                    </label>
                                                </div>
                                                {/* <div>
                                                    <input className="form-check-input" type="radio" name="paymentMethodType" id="qrcode" value="qrcode" checked={!invoice.paymentMethod} onChange={() => setInvoice({...invoice,paymentMethod: false})} />
                                                    <label className="form-check-label" htmlFor="qrcode">
                                                        <img width={43} alt='' src='https://firebasestorage.googleapis.com/v0/b/fivefood-datn-8a1cf.appspot.com/o/AnhLogo%2Fpayos.png?alt=media&token=d61454d9-1abf-4a09-ba5a-3c382e7bf27c' /> Pay OS
                                                    </label>
                                                </div> */}
                                            </div>
                                        ) : (
                                            <></>
                                        )
                                    }

                                </div>
                                <button type="button" className="btn btn-success btn-block mt-4" id="xac-nhan-dat-hang" disabled={invoice.shippingFee === 0 ? true : false} onClick={() => clickDatHang()}>Đặt Hàng</button>
                                <p className="note mt-3">Bằng cách nhấp vào Đặt hàng, bạn đồng ý với <a href="https://www.google.com.vn/?hl=vi">điều khoản và điều kiện</a> và <a href="https://www.google.com.vn/?hl=vi">chính sách riêng tư</a> của chúng tôi.</p>

                            </div>
                        </div>

                    </div>

                </div>
           </div>

           <Modal size='xl' show={showModal} onHide={()=> setShowModal(false)} dialogClassName="modal-90w" aria-labelledby="example-custom-modal-styling-title">
                <Modal.Header closeButton className='d-flex justify-content-end me-3'>
                    <Modal.Title className='fw-bold fs-3'>Thay đổi địa chỉ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='ms-4 me-4 mt-2 mb-2'>
                        {listAddress && listAddress.length > 0 &&
                            listAddress.map((item, index) => {
                                return (
                                    <div className="row mt-2" key={`address-${index}`}>
                                        <div className="col-md-2 text-center ">{item.fullName}</div>
                                        <div className="col-md-2 text-center ">{item.phoneNumber}</div>
                                        <div className="col-md-6 text-center ">{item.specificAddress + ', ' + item.address}</div>
                                        <div className="col-md-2 text-center ">
                                            <button className="btn btn-info" onClick={() => { clickChonThayDoiDiaChi(item) }} >Thay đổi</button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>

                </Modal.Body>
            </Modal>
            <Footer />
        </>
    );
};

export default PaymentDetails;