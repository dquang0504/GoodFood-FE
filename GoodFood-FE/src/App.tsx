import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Login from './Components/Login'
import { ToastContainer } from 'react-toastify'
import Product from './Components/Product'
import ProductAdmin from './Components/Admin/Product'
import ProductDetail from './Components/ProductDetail'
import Cart from './Components/Cart'
import { useSelector } from 'react-redux'
import { RootState } from './Store/store'
import Address from './Components/Address'
import PaymentDetails from './Components/PaymentDetails'
import Dashboard from './Components/Admin/Dashboard'
import Order from './Components/Admin/Order'
import User from './Components/Admin/User'
import ProductType from './Components/Admin/ProductType'
import Statistics from './Components/Admin/Statistics'
import Review from './Components/ReviewProduct'
// index.tsx hoặc App.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Register from './Components/Register'
import OrderHistory from './Components/OrderHistory'
import ChangePassword from './Components/ChangePassword'
import UpdateAccount from './Components/UpdateAccount'
import ForgotPassword from './Components/ForgotPassword'
import ResetPassword from './Components/ResetPassword'
import Pay from './Components/Pay'
import ReviewProduct from './Components/ReviewProduct'
import EditReviewProduct from './Components/EditReviewProduct'
import ChatBot from './Components/ChatBot'



/* eslint-disable @typescript-eslint/no-explicit-any */

export const ENDPOINT = "http://localhost:8080/api"

interface PrivateRouteProps{
  element: React.ComponentType<any>
  [key:string]: any
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({element:Element,...rest})=>{
  const {user} = useSelector((state:RootState)=>state.login)
  return user ? (
    <Element {...rest}/>
  ):(
    <Navigate to={"/home"}></Navigate>
  )
}

function App() {
  

  return (
    <>
      <div>
        <Routes>
          <Route path='/' element={ <Navigate to="/home"></Navigate> }/>
          <Route path='/home' element={<Home></Home>}/>
          <Route path='/register' element={<Register></Register>}/>
          <Route path='/login' element={<Login></Login>}/>
          <Route path='/home/product' element={<Product></Product>}></Route>
          <Route path='/home/product-details/:productID' element={<ProductDetail></ProductDetail>}></Route>
          <Route path='/home/cart' element={ <PrivateRoute element={Cart}/> }></Route>
          <Route path='/home/address' element={ <PrivateRoute element={Address}></PrivateRoute> }></Route>
          <Route path='/home/payment-details' element={ <PrivateRoute element={PaymentDetails}></PrivateRoute> }></Route>
          <Route path='/home/payment' element={ <PrivateRoute element={Pay}></PrivateRoute> }></Route>
          <Route path='/home/order-history' element={ <PrivateRoute element={OrderHistory}></PrivateRoute> }></Route>
          <Route path='/home/evaluate' element={ <PrivateRoute element={ReviewProduct}></PrivateRoute> }></Route>
          <Route path='/home/edit-evaluate' element={ <PrivateRoute element={EditReviewProduct}></PrivateRoute> }></Route>
          <Route path='/home/change-password' element={ <PrivateRoute element={ChangePassword}></PrivateRoute> }></Route>
          <Route path='/home/edit-profile' element={ <PrivateRoute element={UpdateAccount}></PrivateRoute> }></Route>
          <Route path='/forgot-password' element={<ForgotPassword></ForgotPassword>}></Route>
          <Route path='/reset-password' element={<ResetPassword></ResetPassword>}></Route>


          <Route path='/home-admin' element={ <PrivateRoute element={Dashboard}></PrivateRoute> }></Route>
          <Route path='/home-admin/order' element={ <PrivateRoute element={Order}></PrivateRoute> }></Route>
          <Route path='/home-admin/user' element={ <PrivateRoute element={User}></PrivateRoute> }></Route>
          <Route path='/home-admin/product' element={ <PrivateRoute element={ProductAdmin}></PrivateRoute> }></Route>
          <Route path='/home-admin/product-category' element={ <PrivateRoute element={ProductType}></PrivateRoute> }></Route>
          <Route path='/home-admin/statistics' element={ <PrivateRoute element={Statistics}></PrivateRoute> }></Route>
          <Route path='/home-admin/reviews' element={ <PrivateRoute element={Review}></PrivateRoute> }></Route>

        </Routes>
      </div>
      <ToastContainer></ToastContainer>
      <ChatBot></ChatBot>
    </>
    
  )
}

export default App
