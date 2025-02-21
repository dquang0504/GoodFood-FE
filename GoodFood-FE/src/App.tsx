import { useState } from 'react'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Login from './Components/Login'
import { ToastContainer } from 'react-toastify'
import Product from './Components/Product'
import ProductDetail from './Components/ProductDetail'
import Cart from './Components/Cart'
import { useSelector } from 'react-redux'
import { RootState } from './Store/store'
import Address from './Components/Address'

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
          <Route path='/login' element={<Login></Login>}/>
          <Route path='/home/product' element={<Product></Product>}></Route>
          <Route path='/home/product-details/:productID' element={<ProductDetail></ProductDetail>}></Route>
          <Route path='/home/cart' element={ <PrivateRoute element={Cart}/> }></Route>
          <Route path='/home/address' element={ <PrivateRoute element={Address}></PrivateRoute> }></Route>
        </Routes>
      </div>
      <ToastContainer></ToastContainer>
    </>
    
  )
}

export default App
