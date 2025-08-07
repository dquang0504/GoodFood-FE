import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { formatVND } from '../Services/FormatVND';
import { Invoices } from '../Interfaces/Invoices';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import Footer from './Footer';
import '../assets/css/Payment.css'
import { deleteCartItem, saveCart, saveInvoice, saveInvoiceDetails, saveProduct } from '../Slices/CartSlice';
import axiosInstance from '../Services/AxiosInstance';
import { toast } from 'react-toastify';

const Pay = () => {
    const dispatch = useDispatch<AppDispatch>()
    const queryParams = new URLSearchParams(window.location.search);
    const {invoiceDetails,invoice,cart} = useSelector((state:RootState)=>state.cart); 
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
    const [invoices,setInvoices] = useState(initialInvoice); 
    console.log(invoiceDetails);

    const createInvoice = async()=>{
        if (!invoice) return;

        const updatedInvoice = { ...invoice, status: true };

        const payload = {
            invoice: updatedInvoice,
            invoiceDetails,
        };
        try {
            const response = await axiosInstance.post(`invoice/pay`,payload);
            setInvoices(response.data.data.invoice);
            saveInvoiceDetails(response.data.data.invoiceDetails)
            console.log(response.data.data);
            toast.success(response.data.message);
            // deleting cart item using cart slice
            cart.map(item=>(
                dispatch(deleteCartItem({cartID: item.cartID,accountID: user ? user.accountID : 0}))
            ))
            dispatch(saveCart(null));
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        
        if(queryParams.get("vnp_ResponseCode")==="00"){
            createInvoice();
        }

        // if (invoiceDetails && productDetails) {
        //     const mergedDetails = invoiceDetails.map(detail => {
        //         const matchingProduct = productDetails.find(p => p.productID === detail.productID);
        //         return {
        //             ...detail,
        //             product: matchingProduct || null
        //         };
        //     });
        //     dispatch(saveInvoiceDetails(mergedDetails));
        // }

        return () => {
            dispatch(saveInvoice(null));
            dispatch(saveInvoiceDetails([]));
            dispatch(saveProduct([]));
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
                        {invoices.paymentMethod ? (
                                <li className="breadcrumb-item active" aria-current="page">Ordered successfully!</li>
                            ):(
                                <li className="breadcrumb-item active" aria-current="page">Order paid successfully!</li>
                        )}
                    </ol>
                </nav>
                {invoices.paymentMethod ? (
                    <h3 className="payment-header">Ordered successfully!</h3>
                ):(
                    <h3 className="payment-header">Order paid successfully!</h3>
                )}
                {invoices && (
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
                                            <td className="text-right">{formatVND(invoices.totalPrice - invoices.shippingFee)}</td>  
                                        </tr>
                                        <tr>
                                            <td>Shipping Fee:</td>
                                            <td className="text-right">{formatVND(invoices.shippingFee)}</td>
                                        </tr>
                                        <tr>
                                            <td>Payment Method:</td>
                                            {invoices.paymentMethod ? (
                                                <td className="text-right">Cash on Delivery (COD)</td>
                                            ) : (
                                                <td className="text-right">Online Payment</td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="total-amount">Total:</td>
                                            <td className="text-right total-amount">{formatVND(invoices.totalPrice)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {invoices.note ? (
                                    <p className="note">Notes: {invoices.note}</p>
                                ):(
                                    <p className="note">No notes found.</p>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="order-summary">
                                <h4>Thank you. Your order has been confirmed.</h4>
                                <p><strong>Order ID:</strong> {invoices.invoiceID}</p>
                                <p><strong>Date:</strong> {new Date(invoices.paymentDate).toLocaleString()}</p>
                                <p><strong>Phone Number:</strong> {invoices.receivePhone}</p>
                                <p><strong>Delivery Address:</strong> {invoices.receiveAddress}</p>
                                <p><strong>Payment Method:</strong>
                                    {invoices.paymentMethod ? (
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