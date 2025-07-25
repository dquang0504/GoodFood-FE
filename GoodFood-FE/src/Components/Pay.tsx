import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { InvoiceDetails } from '../Interfaces/InvoiceDetails';
import { formatVND } from '../Services/FormatVND';
import { Invoices } from '../Interfaces/Invoices';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import { Products } from '../Interfaces/Products';
import Footer from './Footer';
import '../assets/css/Payment.css'

const Pay = () => {
    const {state} = useLocation();
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails[]>(
        state?.invoiceDetails ?? []
    );    
    const {user} = useSelector((state:RootState)=>state.login);
    const initialInvoice: Invoices = {
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
    const [invoice,setInvoice] = useState<Invoices>(state?.invoice ?? initialInvoice)
    const [productDetails,setProductDetails] = useState<Products[]>(state?.product ?? []);
    const navigate = useNavigate();

    useEffect(() => {
        if (invoiceDetails && productDetails) {
            const mergedDetails = invoiceDetails.map(detail => {
                const matchingProduct = productDetails.find(p => p.productID === detail.productID);
                return {
                    ...detail,
                    product: matchingProduct || null
                };
            });
            setInvoiceDetails(mergedDetails);
        }
    }, []);

    return (
        <>
            <Navbar />
            <div className="container container-pay pt-2 pb-5" style={{ minHeight: 510, marginTop:60 }}>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="/home/cart">Cart</a></li>
                        <li className="breadcrumb-item "><a href='#'>Payment Details</a></li>
                        {invoice.paymentMethod ? (
                                <li className="breadcrumb-item active" aria-current="page">Ordered successfully!</li>
                            ):(
                                <li className="breadcrumb-item active" aria-current="page">Order paid successfully!</li>
                        )}
                    </ol>
                </nav>
                {invoice.paymentMethod ? (
                    <h3 className="payment-header">Ordered successfully!</h3>
                ):(
                    <h3 className="payment-header">Order paid successfully!</h3>
                )}
                {invoice && (
                    <div className="row d-flex justify-content-center mx-auto">
                        <div className="col-md-8">
                            <div className="order-details">
                                <h4>RECEIPT DETAILS</h4>
                                <table className="table table-borderless">
                                    <tbody>
                                        {invoiceDetails.map(item => (
                                            <tr key={item.invoiceDetailID}>
                                                <td>{item.product?.productName} × {item.quantity}</td>
                                                <td className="text-right">{formatVND(item.price)}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td>Subtotal:</td>
                                            <td className="text-right">{formatVND(invoice.totalPrice - invoice.shippingFee)}</td>  
                                        </tr>
                                        <tr>
                                            <td>Shipping Fee:</td>
                                            <td className="text-right">{formatVND(invoice.shippingFee)}</td>
                                        </tr>
                                        <tr>
                                            <td>Payment Method:</td>
                                            {invoice.paymentMethod ? (
                                                <td className="text-right">Cash on Delivery (COD)</td>
                                            ) : (
                                                <td className="text-right">Online Payment</td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="total-amount">Total:</td>
                                            <td className="text-right total-amount">{formatVND(invoice.totalPrice)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {invoice.note ? (
                                    <p className="note">Notes: {invoice.note}</p>
                                ):(
                                    <p className="note">No notes found.</p>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="order-summary">
                                <h4>Thank you. Your order has been confirmed.</h4>
                                <p><strong>Order ID:</strong> {invoice.invoiceID}</p>
                                <p><strong>Date:</strong> {new Date(invoice.paymentDate).toLocaleString()}</p>
                                <p><strong>Phone Number:</strong> {invoice.receivePhone}</p>
                                <p><strong>Delivery Address:</strong> {invoice.receiveAddress}</p>
                                <p><strong>Payment Method:</strong>
                                    {invoice.paymentMethod ? (
                                        <span className="text-right">Cash on Delivery (COD)</span>
                                    ) : (
                                        <span className="text-right">Online Payment</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer></Footer>
        </>
    );
};

export default Pay;