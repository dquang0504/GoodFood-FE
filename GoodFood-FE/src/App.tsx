import { useState } from 'react'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Login from './Components/Login'
import { ToastContainer } from 'react-toastify'
import Product from './Components/Product'

/* eslint-disable @typescript-eslint/no-explicit-any */

export const ENDPOINT = "http://localhost:8080/api"

interface PrivateRouteProps{
  element: React.ComponentType<any>
  [key:string]: any
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({element:Element,...rest})=>{
  const taiKhoan = JSON.parse(sessionStorage.getItem("taiKhoan") || "null");
  return taiKhoan ? (
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
        </Routes>
      </div>
      <ToastContainer></ToastContainer>
    </>
    
  )
}

export default App
