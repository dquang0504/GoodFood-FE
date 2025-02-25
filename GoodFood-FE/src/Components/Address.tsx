import React, { useEffect, useState } from 'react';
import '../assets/css/Address.css'
import '../assets/css/pagination.css'
import Navbar from './Navbar';
import { Addresses } from '../Interfaces/Addresses';
import { Districts } from '../Interfaces/Districts';
import { Provinces } from '../Interfaces/Provinces';
import { RootState } from '../Store/store';
import { useSelector } from 'react-redux';
import { Wards } from '../Interfaces/Wards';
import ReactPaginate from 'react-paginate';
import axiosInstance from '../Services/AxiosInstance';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';

const Address = () => {
    const apiKey = import.meta.env.VITE_API_GHN;
    const {user} = useSelector((state:RootState)=>state.login)
    const [pageNum,setPageNum] = useState(1);
    const [totalPage,setToTalPage] = useState(0);
    const [showModal,setShowModal] = useState(false);
    const [address,setAddress] = useState({
        wardName: "",
        districtName: "",
        provinceName: "Cần Thơ"
    })
    const initialAddressForm = {
        address: "Cần Thơ",
        addressID: 0,
        districtID: 0,
        fullName: "",
        phoneNumber: "",
        provinceID: 0,
        specificAddress: "",
        status: false,
        wardID: 0,
        deleteStatus: false,
        accountID: user?.accountID || 0,
        wardCode: "",
    }
    const [addressForm,setAddressForm] = useState<Addresses>(initialAddressForm);
    const [errorMessages,setErrorMessages] = useState({
        fullNameError: "",
        phoneError: "",
        specificAddressError: "",
        districtError: "",
        wardError: "",
    })
    const [editting,setEditting] = useState(false);
    //Address info
    const [province,setProvince] = useState<Provinces>(
        { provinceID: 220, provinceName: "Cần Thơ", provinceCode: 0}
    )
    const [listDistrict,setListDistrct] = useState<Districts[]>([
        {DistrictCode: 0, DistrictID:1572, DistrictName: "Quận Ninh Kiều",ProvinceID:220},
        {DistrictCode: 0, DistrictID:1573, DistrictName: "Quận Bình Thủy",ProvinceID:220},
        {DistrictCode: 0, DistrictID:1574, DistrictName: "Quận Cái Răng",ProvinceID:220},
    ]);
    const [listWard, setListWard] = useState<Wards[]>([]);
    const [listAddress,setListAddress] = useState<Addresses[]>([]);

    const fetchAddresesByPage = async(page: number)=>{
        try {
            const response = await axiosInstance.get(`address/fetch?page=${page}&accountID=${user?.accountID}`)
            setToTalPage(response.data.totalPage);
            setListAddress(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchWard = async(districtID: number, selectedWard: string)=>{
        try {
            const response = await axios.post("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",{district_id:districtID},{
                headers:{
                    "token": apiKey,
                    "Content-Type": "application/json"
                }
            })
            setListWard(response.data.data);
            const copy: Wards[] = response.data.data;
            if (selectedWard){
                const ward = copy.find(item => item.WardCode == selectedWard)
                console.log(listWard);
                if (ward){
                    setAddress(prev=>({
                        ...prev,
                        wardName: ward.WardName
                    }))
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleChangeInput = (fieldName: string,event: React.ChangeEvent<HTMLInputElement>)=>{
        setAddressForm(prev=>({
            ...prev,
            [fieldName]: event.target.value
        }))
    }

    const handleChangeSelect = (fieldName:string, event: React.ChangeEvent<HTMLSelectElement>)=>{
        const selectedValue = JSON.parse(event.target.value); // Chuyển JSON về object

        switch(fieldName){
            case "districtID":
                setAddress(prev=>({
                    ...prev,
                    districtName: selectedValue.districtName
                }))
                setAddressForm(prev => ({
                    ...prev,
                    [fieldName]: selectedValue[fieldName] // Cập nhật đúng trường
                }));
                break;
            case "wardCode":
                setAddress(prev=>({
                    ...prev,
                    wardName: selectedValue.wardName
                }))
                setAddressForm(prev => ({
                    ...prev,
                    [fieldName]: selectedValue[fieldName] // Cập nhật đúng trường
                }));
                break;    
        }
            
        if(fieldName === 'districtID'){
            setAddress(prev=>({
                ...prev,
                wardName: ""
            }))
            fetchWard(selectedValue[fieldName],"");
        }
    }
    
    useEffect(()=>{
        fetchAddresesByPage(pageNum);
    },[])

    useEffect(()=>{
        console.log(listWard)
    },[listWard])

    useEffect(()=>{
        console.log(address)
    },[addressForm,address])

    useEffect(()=>{
        fetchAddresesByPage(pageNum);
    },[pageNum])

    const clickAddNewAddress = async()=>{
        const updatedAddressForm = {
            ...addressForm,
            address: address.wardName + ", " + address.districtName + ", " + address.provinceName
        }
        setAddressForm(updatedAddressForm);
        if (basicValidation()){
            try {
                const response = await axiosInstance.post(`address/insert`,updatedAddressForm); 
                toast.success(response.data.message);
            } catch (error) {
                console.log(error);
            }
            finally{
                clickResetAddress();
                fetchAddresesByPage(pageNum);
                setErrorMessages({districtError:"",fullNameError:"",phoneError:"",specificAddressError:"",wardError:""})
            }
        }
    }

    const clickUpdateAddress = async()=>{
        const updatedAddressForm = {
            ...addressForm,
            address: address.wardName + ", " + address.districtName + ", " + address.provinceName
        }
        setAddressForm(updatedAddressForm);
        if (basicValidation()){
            try {
                const response = await axiosInstance.put(`address/update?accountID=${user?.accountID}&addressID=${addressForm.addressID}`,updatedAddressForm); 
                toast.success(response.data.message);
            } catch (error) {
                console.log(error);
            }
            finally{
                setEditting(false);
                fetchAddresesByPage(pageNum);
                setErrorMessages({districtError:"",fullNameError:"",phoneError:"",specificAddressError:"",wardError:""})
                clickResetAddress();
            }
        }
    }

    const clickResetAddress = ()=>{
        if(user){
            setAddressForm(initialAddressForm)
            setErrorMessages({districtError:"",fullNameError:"",phoneError:"",specificAddressError:"",wardError:""})
            setEditting(false);
        }
    }

    const clickEditAddress = async(address: Addresses)=>{
        setEditting(true);
        try {
            const response = await axiosInstance.get(`address/detail?addressID=${address.addressID}&accountID=${address.accountID}`);
            setAddressForm(response.data.data);
            const selectedDistrict = listDistrict.find(district => district.DistrictID === response.data.data.districtID)
            console.log(selectedDistrict)
            if (selectedDistrict){
                setAddress(prev=>({
                    ...prev,
                    districtName: selectedDistrict.DistrictName
                }))
            }

            fetchWard(response.data.data.districtID,response.data.data.wardCode);
        } catch (error) {
           console.log(error); 
        }
    }

    const clickDeleteAddress = async()=>{
        setShowModal(true);
        try {
            const response = await axiosInstance.delete(`address/delete?accountID=${user?.accountID}&addressID=${addressForm.addressID}`)
            toast.success(response.data.message);
        } catch (error) {
            console.log(error);
        }finally{
            setShowModal(false);
            fetchAddresesByPage(pageNum)
            clickResetAddress();
        }
    }

    const basicValidation = () => {
        let validated = true;
        let newErrors: typeof errorMessages = {
            fullNameError: "",
            districtError:"",
            phoneError:"",
            specificAddressError:"",
            wardError:""
        }; // Tạo object tạm để chứa tất cả lỗi
    
        if (addressForm.fullName === "") {
            newErrors.fullNameError = "Please provide your full name!";
            validated = false;
        }
        if (addressForm.phoneNumber === "") {
            newErrors.phoneError = "Please provide your mobile number";
            validated = false;
        }
        if (address.districtName === "") {
            newErrors.districtError = "Please select your district!";
            validated = false;
        }
        if (address.wardName === "") {
            newErrors.wardError = "Please select your ward!";
            validated = false;
        }
        if(addressForm.specificAddress === ""){
            newErrors.specificAddressError = "Please provide your specific address!"
            validated = false;
        }
    
        setErrorMessages(newErrors); // Cập nhật lỗi một lần duy nhất
        return validated;
    };

    return (
        <>
            <Navbar></Navbar>
            <main className='main-address' style={{marginTop:50}}>
                <div className="row pt-5 ms-5 me-5">
                    <div className="col-md-8 d-flex justify-content-center mt-4">
                        <div className="card card-form">
                            <div className="card-body">
                                <div className="text-center fs-2 fw-bold">Địa chỉ</div>
                                <div className="mt-4">
                                    <div>
                                        <div className="d-flex justify-content-center">
                                            <div className="d-flex justify-content-between div-input">
                                                <div className="input-box-address">
                                                    <div className="input-dau">
                                                        <i className="fa-solid fa-user"></i>
                                                        <input className='input-address' type="text" placeholder="Họ và tên" name="hoVaTen" value={addressForm?.fullName} onChange={(e)=>handleChangeInput("fullName",e)} /><br />
                                                        <span className="text-danger">{errorMessages.fullNameError}</span>
                                                    </div>
                                                </div>
                                                <div className="input-box-address ">
                                                    <div className="input-dau">
                                                        <i className="fa-solid fa-phone"></i>
                                                        <input className='input-address' type="text" placeholder="Số điện thoại" name="soDienThoai" value={addressForm?.phoneNumber} onChange={(e)=>handleChangeInput("phoneNumber",e)} /><br />
                                                        <span className="text-danger">{errorMessages.phoneError}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center ">
                                            <div className="d-flex justify-content-between div-input">
                                                <div className="input-box-address">
                                                    <div className="input-giua">
                                                        <select className="form-select" id="province" onChange={(e)=>handleChangeSelect("provinceID",e)}>
                                                            <option value={JSON.stringify(province)}>{province.provinceName}</option>
                                                            {/* {
                                                                listProvince.map((item, index) => {
                                                                    return (
                                                                        <option
                                                                            key={item.provinceID}
                                                                            value={JSON.stringify({ "provinceID": item.provinceID, "provinceName": item.provinceName })}
                                                                        >{item.provinceName}
                                                                        </option>
                                                                    )
                                                                })
                                                            } */}
                                                        </select>
                                                        <input type="hidden" name="province" id="inputProvince" />
                                                        <span className="text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="input-box-address ">
                                                    <div className="input-giua">
                                                        <select className="form-select" id="district" value={JSON.stringify({ "districtID": addressForm.districtID, "districtName": address.districtName })} onChange={(e)=>handleChangeSelect("districtID",e)} >
                                                            <option selected hidden={true} value={JSON.stringify({ "districtID": "", "districtName": "" })}>Quận/Huyện</option>
                                                            {
                                                                listDistrict.map((item, index) => {
                                                                    return (
                                                                        <option key={item.DistrictID} value={JSON.stringify({ "districtID": item.DistrictID, "districtName": item.DistrictName })} >{item.DistrictName}</option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                        <input type="hidden" name="district" id="inputDistrict" />
                                                        <span className="text-danger">{errorMessages.districtError}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <div className="d-flex justify-content-between div-input">
                                                <div className="input-box-address ">
                                                    <div className="input-giua">
                                                        <select className="form-select" id="ward" value={JSON.stringify({ "wardCode": addressForm.wardCode, "wardName": address.wardName })} onChange={(e)=>handleChangeSelect("wardCode",e)}>
                                                            <option selected hidden={true} value={JSON.stringify({ "wardCode": "", "wardName": "" })}>Xã/Phường</option>
                                                            {
                                                                listWard.map((item, index) => {
                                                                    return (
                                                                        <option key={item.WardCode} value={JSON.stringify({ "wardCode": item.WardCode, "wardName": item.WardName })} >{item.WardName}</option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                        <input type="hidden" name="ward" id="inputWard" />
                                                        <span className="text-danger">{errorMessages.wardError}</span>
                                                    </div>
                                                </div>
                                                <div className="input-box-address ">
                                                    <div className="input-dau">
                                                        <i className="fa-solid fa-house"></i>
                                                        <input className='input-address' type="text" placeholder="Địa chỉ cụ thể" name="diaChiCuThe" value={addressForm.specificAddress} onChange={(e)=>handleChangeInput("specificAddress",e)} /><br />
                                                        <span className="text-danger">{errorMessages.specificAddressError}</span>
                                                    </div>
                                                </div>               
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <div style={{ width: '750px' }}>
                                                <input id='checkDefault' type="checkbox" name="macDinhDC"
                                                   checked={addressForm.status === true} onChange={(e)=> setAddressForm({...addressForm,status:e.target.checked})}
                                                /> <label htmlFor='checkDefault'>Đặt làm địa chỉ mặc định</label>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-3 mb-3 div-button">
                                            <div className="d-flex justify-content-start">
                                                <button className="btn btn-success" disabled={editting} onClick={clickAddNewAddress}>Thêm mới</button>
                                                <button className="btn btn-primary" disabled={!editting} onClick={clickUpdateAddress} >Cập nhật</button>
                                                <button className="btn text-light" style={{ backgroundColor: '#656565' }} onClick={clickResetAddress}>Làm mới</button>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 d-flex justify-content-center align-items-center">
                        <div className="">
                            <img className='img-logo-address' src="https://firebasestorage.googleapis.com/v0/b/fivefood-datn-8a1cf.appspot.com/o/AnhLogo%2Fmap-google-removebg-preview.png?alt=media&token=cd424f82-437d-46fb-a98c-19b421fea23c" alt="" />
                        </div>
                    </div>

                    <div className="col-md-12 ms-5 me-4 p-0 mt-4 mb-5 d-flex justify-content-center">
                        <div className="card card-list">
                            <div className="fs-2 d-flex  d-flex justify-content-center ">Danh sách địa chỉ </div>
                            <div className="card-body">
                                <table className="table table-address">
                                    <thead>
                                        <tr className="row">
                                            <th className="col-md-3 text-center">Họ và Tên</th>
                                            <th className="col-md-2 text-center">Số điện thoại</th>
                                            <th className="col-md-4 text-center">Địa chỉ</th>
                                            <th className="col-md-1 text-center"></th>
                                            <th className="col-md-2 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listAddress && listAddress.length > 0 &&
                                            listAddress
                                                .filter(item => item.deleteStatus === false)
                                                .map((item, index) => {
                                                    return (
                                                        <tr className="row" key={`address-${index}`}>
                                                            <td className="col-md-3 text-center ">{item.fullName}</td>
                                                            <td className="col-md-2 text-center ">{item.phoneNumber}</td>
                                                            <td className="col-md-4 text-center ">{item.specificAddress + ", " + item.address}</td>
                                                            <td className="col-md-1 text-center ">
                                                                {item.status ? (<button className="btn btn-success">Mặc định</button>) : ''}

                                                            </td>
                                                            <td className="col-md-2 text-center ">
                                                                <span style={{cursor: "pointer"}} onClick={() => { clickEditAddress(item)}}><i className="fa-solid fa-pencil" style={{ color: '#0091ff' }}></i></span> <i>|</i>
                                                                <span style={{cursor: "pointer"}} onClick={() => { setShowModal(true); setAddressForm(item) }}><i className="fa-solid fa-trash-can" style={{ color: '#ff0000' }}></i></span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                        }
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination justify-content-center">
                                <div className='d-flex justify-content-center' >
                                    <ReactPaginate
                                        breakLabel="..."
                                        nextLabel={<i className="fa-solid fa-forward-step"></i>}
                                        onPageChange={(event)=>setPageNum(event.selected + 1)}
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
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Modal show={showModal} onHide={()=>setShowModal(false)}>
                <Modal.Header closeButton className='d-flex justify-content-end '>
                    <Modal.Title className='fw-bold fs-3'>Xóa địa chỉ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='ms-4 me-4 mt-2 mb-2'>
                        Bạn có chắc muốn xóa địa chỉ <span className='fw-bold'>{addressForm.address + ", " + addressForm.specificAddress}</span> này không?
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={()=>setShowModal(false)} style={{ width: '80px' }}>
                        Không
                    </Button>
                    <Button variant="danger" onClick={() => clickDeleteAddress()} style={{ width: '80px' }}>
                        Có
                    </Button>
                </Modal.Footer>
                {/* {
                    loadingDeleteAddress&& (
                        <div className='position-absolute bg-black loading-modal-delete-all d-flex justify-content-center align-items-center' style={{ opacity: 0.4 }}>
                            <div>
                                <OrbitProgress variant="disc" color="#32cd32" size="small" text="" textColor="" />
                            </div>
                        </div>
                    )
                } */}
            </Modal>

        </>
    );
};

export default Address;