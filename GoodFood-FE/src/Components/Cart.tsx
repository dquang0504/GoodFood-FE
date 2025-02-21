import React, { useEffect, useRef, useState } from 'react';
import '../assets/css/Cart.css'
import imgCart from '../assets/images/anhgiohang.png'
import Navbar from './Navbar';
import { Carts } from '../Interfaces/Carts';
import { Modal, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Store/store';
import axiosInstance from '../Services/AxiosInstance';
import { formatVND } from '../Services/FormatVND';
import { toast } from 'react-toastify';
import { deleteAllItems, deleteCartItem, modifyQuantityCart } from '../Slices/CartSlice';
import { FourSquare, OrbitProgress } from 'react-loading-indicators';
import Footer from './Footer';

const Cart = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [loading,setLoading] = useState(true);
    const {user} = useSelector((state:RootState)=>state.login)
    const {accessToken} = useSelector((state:RootState)=>state.login)
    const [listCart,setListCart] = useState<Carts[]>([]);
    const {cart} = useSelector((state:RootState)=>state.cart)
    const [totalAmount,setTotalAmount] = useState(0);
    const [totalProductSelect,setTotalProductSelect] = useState(0);
    const [showModalDeleteAll,setShowModalDeleteAll] = useState(false)

    const fetchCartDetail = async()=>{
        try {
            const response = await axiosInstance.get(`cart?accountID=${user?.accountID}`)
            setListCart(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const clickDeleteCart = async(cartItem: Carts) => {
        try {
            dispatch(deleteCartItem(cartItem.cartID))
            setListCart(
                listCart.filter(item=>
                    item.cartID !== cartItem.cartID
                )
            )
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchCartDetail();
    },[])

    const clickChonSanPham = (event: React.MouseEvent<HTMLInputElement, MouseEvent>, cartItem: Carts)=>{
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".checkboxClass");
        const isChecked = (event.target as HTMLInputElement).checked
        setTotalProductSelect(prev=> isChecked ? prev + 1 : prev - 1);
        //calculating the total amount
        setTotalAmount(prev=> isChecked ? prev + (cartItem.product.price * cartItem.quantity) : prev - (cartItem.product.price * cartItem.quantity))
        //checking if checkboxAll is present
        const checkboxAll = document.querySelector<HTMLInputElement>("#checkboxAll");
        if(checkboxAll){
            if (totalProductSelect == 1){
                checkboxAll.checked = false
            }
            if(totalProductSelect == checkboxes.length - 1){
                checkboxAll.checked = true
            }
        }
    }

    const clickSoLuong = async(cartItem: Carts, operator: string)=>{
        let newQuantity = operator === "increase" ? cartItem.quantity + 1 : Math.max(cartItem.quantity - 1,1);
        try {
            const response = await dispatch(modifyQuantityCart({cartID:cartItem.cartID,quantity: newQuantity}))
            //update state listCart
            // Lấy dữ liệu từ action.payload
            if (modifyQuantityCart.fulfilled.match(response)) {
                setListCart(prev => prev.map(item =>
                    item.cartID === cartItem.cartID ? { ...item, quantity: response.payload.quantity } : item
                ));
                //checking if an item is chosen => update totalAmount
                const checkbox = document.querySelector<HTMLInputElement>(`.checkboxClass[data-id="${cartItem.cartID}"]`);
                if(checkbox?.checked){
                    setTotalAmount(prev =>
                        operator === "increase"
                            ? prev + cartItem.product.price
                            : prev - cartItem.product.price
                    )
                }
            } else {
                console.log("Modify failed:", response);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const clickSelectAll = (event: React.MouseEvent<HTMLInputElement,MouseEvent>)=>{
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".checkboxClass");
        const isChecked = (event.target as HTMLInputElement).checked
        let totalPrice = 0;
        checkboxes.forEach(item=>{
            item.checked = isChecked
        })

        if(isChecked){
            totalPrice = listCart.reduce((acc,item)=> acc + item.product.price * item.quantity,0);
        }
        setTotalProductSelect(prev => isChecked ? checkboxes.length : 0);
        setTotalAmount(totalPrice)
    }
    
    const clickAgreeDeleteAll = ()=>{
        if(user){
            dispatch(deleteAllItems({isDelete:true,accountID:user?.accountID}))
            setListCart([]);
            setShowModalDeleteAll(false);
            return;
        }
        console.log("user rỗng");
    }


    return (
        <div style={{ marginTop: 65 }}>
            <Navbar></Navbar>
            {loading ? (
                <>
                    <div className='container mt-5 cart-container' style={{marginBottom:"75px",minHeight:"430px"}}>
                        <h2 className='text-center cart-header pb-2'>Giỏ Hàng</h2>
                        {
                            listCart.length === 0 ? (
                                <div>
                                    <div className='d-flex justify-content-center mt-5'>
                                        <img src={imgCart} alt={imgCart} />
                                    </div>
                                    <div className="text-center fs-4">Chưa có sản phẩm</div>
                                </div>
                            ):(
                                <div>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Sản phẩm</th>
                                                    <th>Đơn Giá</th>
                                                    <th>Số Lượng</th>
                                                    <th>Số Tiền</th>
                                                    <th className="d-flex justify-content-center">Thao Tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    listCart.map((item) => {
                                                        return (
                                                            <tr className="cart-item" key={`cart-${item.cartID}`}>
                                                                <td className="align-content-center">
                                                                    <div className="d-flex justify-content-center">
                                                                        <input type="checkbox"
                                                                            className="checkboxClass"
                                                                            data-id = {item.cartID}
                                                                            onClick={(event) => { clickChonSanPham(event, item) }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="align-content-center">
                                                                    <div className="product-info">
                                                                        <img src={item.product.coverImage} alt="" />
                                                                        {item.product.productName}
                                                                    </div>
                                                                </td>
                                                                <td className="align-content-center">{formatVND(item.product.price)}</td>
                                                                <td className="align-content-center">
                                                                    <div>
                                                                        <div className="quantity-control">
                                                                            <button type="button" className="btn btn-sm" onClick={() => { clickSoLuong(item,"decrease") }} >-</button>
                                                                            <input type="text" className="form-control" name="soLuong" value={item.quantity} min="1" style={{ width: '80px' }} id="soLuong" disabled={true} />
                                                                            <button type="button" className="btn btn-sm" onClick={() => { clickSoLuong(item,"increase") }} >+</button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="align-content-center">{formatVND(item.product.price * item.quantity)}</td>
                                                                <td className="align-content-center "><span onClick={() => { clickDeleteCart(item) }} className="remove-link d-flex justify-content-center"><i className="fa-solid fa-trash-can " style={{ color: '#ff0000', fontSize: '22px' }}></i></span></td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="cart-footer">
                                        <table style={{ width: '100%', padding: '0 20px' }}>
                                            <tbody >
                                                <tr className="row" >
                                                    <td className="col-md-2 align-content-center"><input className="ms-1" type="checkbox" id="checkboxAll" onClick={(event) => { clickSelectAll(event) }} />&nbsp;<label htmlFor='checkboxAll'> Chọn Tất Cả ({totalProductSelect})</label></td>
                                                    <td className="col-md-4 align-content-center">
                                                        <span className='remove-link' onClick={() => setShowModalDeleteAll(true)} >Xóa tất cả</span>
                                                    </td>
                                                    <td className="col-md-4 align-content-center"><div className="d-flex justify-content-end">Tổng thanh toán (<span id="tongSanPhamChon" className="ms-1 me-1">{totalProductSelect}</span> sản phẩm): <span className="total-amount"> <span id="total" className="ms-1 me-1">{totalAmount === 0 ? "0 ₫" : formatVND(totalAmount)}</span> </span> </div> </td>
                                                    <td className="col-md-2 align-content-center d-flex justify-content-center">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-success"
                                                            id="muaHang"
                                                            // onClick={clickMuaHang}
                                                            // disabled={listItemClickChon.length === 0 ? true : false}
                                                        >Mua Hàng
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </>
            ):(
                <>
                    <div className='d-flex justify-content-center align-items-center' style={{ minHeight: 510 }}>
                        <FourSquare color="#067A38" size="large" text="" textColor="" />
                    </div>
                </>
            )}

            <Modal show={showModalDeleteAll} onHide={()=> showModalDeleteAll ? setShowModalDeleteAll(false) : setShowModalDeleteAll(true)}>
                <Modal.Header closeButton className='d-flex justify-content-end '>
                    <Modal.Title className='fw-bold fs-3'>Xóa tất cả sản phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='ms-4 me-4 mt-2 mb-2'>
                        Bạn có chắc muốn xóa tất cả sản phẩm có trong giỏ hàng không?
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={()=> setShowModalDeleteAll(false)} style={{ width: '80px' }}>
                        Không
                    </Button>
                    <Button variant="danger" onClick={() => clickAgreeDeleteAll()} style={{ width: '80px' }}>
                        Có
                    </Button>
                </Modal.Footer>
                {/* <div className='position-absolute bg-black loading-modal-delete-all d-flex justify-content-center align-items-center' style={{ opacity: 0.4 }}>
                    <div>
                        <OrbitProgress variant="disc" color="#32cd32" size="small" text="" textColor="" />
                    </div>
                </div> */}

            </Modal>
            <Footer></Footer>
        </div>
    );
};

export default Cart;