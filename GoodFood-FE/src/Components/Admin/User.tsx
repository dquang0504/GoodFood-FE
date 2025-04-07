import React, { useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import { Users } from '../../Interfaces/Users';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import { stringify } from 'querystring';
import axiosInstance from '../../Services/AxiosInstance';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';

type Cards = {
    TotalUsers: number,
    TotalDisabled: number,
}

const User = () => {

    const [cards,setCards] = useState<Cards>({
        TotalUsers: 0,
        TotalDisabled: 0,
    });
    const initialDisplayU = {
        accountID: 0,
        avatar: "",
        email: "",
        fullName: "",
        gender: true,
        password: "",
        phoneNumber: "",
        role: false,
        status: true,
        username: ""
    }
    const [displayU,setDisplayU] = useState<Users>(initialDisplayU)
    const [users,setUsers] = useState<Users[]>([]);
    const [err,setErr] = useState({
        errEmail: "",
        errName: "",
        errPhone: "",
        errUsername: "",
    })
    const [editting,setEditting] = useState(false);
    const [search,setSearch] = useState("");
    const [sort,setSort] = useState("Username");
    const [pageNum,setPageNum] = useState(1);
    const [totalPage,setTotalPage] = useState(0);

    const fetchData = async(page: number, search: string, sort: string)=>{
        try {
            const response = await axiosInstance.get(`admin/user?page=${page}&search=${search}&sort=${sort}`)
            setCards(response.data.cards);
            setUsers(response.data.data);
            setTotalPage(response.data.totalPage);
            console.log(response.data.totalPage);
        } catch (error) {
           console.log(error); 
        }
    }

    useEffect(()=>{
        fetchData(pageNum,search,sort);
    },[])

    const fetchDetail = async(userID: number)=>{
        setEditting(true);
        try {
            const response = await axiosInstance.get(`admin/user/detail?accountID=${userID}`);
            setDisplayU(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const basicValidation = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string)=>{
        if(fieldName==="fullname"){
            if(event.target.value.length<=0){
                setErr({...err,errName:"Please input your full name!"})
            }
            else{
                setErr({...err,errName:""})
            }
            setDisplayU({...displayU,fullName:event.target.value})
        }
        else if(fieldName==="username"){
            if(event.target.value.length<=0){
                setErr({...err,errUsername:"Please input your username!"})
            }
            else{
                setErr({...err,errUsername:""})
            }
            setDisplayU({...displayU,username:event.target.value})
        }
        else if(fieldName==="email"){
            if(event.target.value===""){
                setErr({...err,errEmail:"Please input your email!"})
            }
            else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})?$/.test(event.target.value)){
                setErr({...err,errEmail:"Invalid email!"})
            }
            else{
                setErr({...err,errEmail:""})
            }
            setDisplayU({...displayU,email:event.target.value})
        }
        else if(fieldName==="phone"){
            if(event.target.value===""){
                setErr({...err,errPhone:"Please input your phone number!"})
            }
            else if(!/^(0[3-9])\d{8}$/.test(event.target.value)){
                setErr({...err,errPhone:"Invalid phone number!"})
            }
            else{
                setErr({...err,errPhone:""})
            }
            setDisplayU({...displayU,phoneNumber:event.target.value})
        }
    }

    const handlePost = async()=>{
        if(
            err.errEmail == "" && err.errName == "" &&
            err.errPhone == "" && err.errUsername == ""
        ){
            try {
                const response = await axiosInstance.post("admin/user/create",displayU);
                console.log(response);
                toast.success(response.data.message);
                resetForm();
            } catch (error: any) {
                console.log(error);
                setErr(error.response.data.err);
            }finally{
                fetchData(pageNum,search,sort);
            }
        }else{
            toast.error("Please check the inputs!");
        }
    }

    const handlePut = async()=>{
        if(
            err.errEmail == "" && err.errName == "" &&
            err.errPhone == "" && err.errUsername == ""
        ){
            try {
                const response = await axiosInstance.put(`admin/user/update?accountID=${displayU.accountID}`,displayU);
                console.log(response);
                toast.success(response.data.message);
                resetForm();
            } catch (error: any) {
                console.log(error);
                setErr(error.response.data.err);
            }finally{
                fetchData(pageNum,search,sort);
                setEditting(false);
            }
        }else{
            toast.error("Please check the inputs!");
            console.log(err.errEmail);
        }
    }

    const resetForm = ()=>{
        setDisplayU(initialDisplayU);
        setEditting(false);
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData(pageNum, search, sort);
        }, 500); // debounce 500ms tránh spam gọi API liên tục
        
        return () => clearTimeout(delayDebounce);
    }, [search, sort, pageNum]); // tự động gọi lại mỗi khi search/sort/pageNum thay đổi
        
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(event.target.value);   
    }

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        fetchData(pageNum,sort,search);
    }

    return (
        <div className="wrapper">
            <SideNav></SideNav>
            <div className="main main-admin p-0">
                <HorizontalNav></HorizontalNav>
                <main className="content">
                    <div className="container-fluid p-0">
                        <h1 className="h3 mb-3">User list</h1>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body" style={{borderRadius:8}}>
                                            <div className="row">
                                                <div className="col mt-0">
                                                    <h5 className="card-title">Total users</h5>
                                                </div>

                                                <div className="col-auto">
                                                    <div className="stat text-primary">
                                                        <i className="fa-solid fa-arrow-up-right-dots" style={{color: "#067a38"}}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <h1 className="mt-1 mb-3 fs-2"> {cards.TotalUsers} </h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body" style={{borderRadius:8}}>
                                            <div className="row">
                                                <div className="col mt-0">
                                                    <h5 className="card-title">Total users banned</h5>
                                                </div>

                                                <div className="col-auto">
                                                    <div className="stat text-primary">
                                                        <i className="fa-solid fa-arrow-up-right-dots" style={{color: "#067a38"}}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <h1 className="mt-1 mb-3 fs-2">

                                                {cards.TotalDisabled}

                                            </h1>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="userDetail" style={{marginTop:"20px"}}>
                                <h4> User details </h4>
                                <form>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Fullname:</label>
                                                <input value={displayU?.fullName || ''} name="hoVaTen" type="text"
                                                    className="form-control" placeholder="Nhập vào họ và tên"
                                                    onChange={(e)=>(basicValidation(e,"fullname"))}
                                                    />
                                                <em className='text-danger'>{err?.errName}</em>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Username:</label>
                                                <input id="tenDangNhap" disabled={editting} name="tenDangNhap"
                                                    value={displayU?.username || ''} type="text"
                                                    className="form-control" placeholder="Nhập vào tên tài khoản"
                                                    onChange={(e)=>(basicValidation(e,"username"))}
                                                    />
                                                <em className='text-danger'>{err?.errUsername}</em>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Role:</label>
                                                <div className="form-check">
                                                    <input checked={displayU.role === true} className="form-check-input"
                                                        value={"Admin"} type="radio" name="vaiTro" id="flexRadioDefault1"
                                                        onChange={(e)=>setDisplayU({...displayU,role: e.target.value === 'Admin'})}
                                                        />Admin
                                                </div>
                                                <div className="form-check">
                                                    <input checked={displayU.role === false} className="form-check-input"
                                                        value={"User"} type="radio" name="vaiTro" id="flexRadioDefault2"
                                                        onChange={(e)=>setDisplayU({...displayU,role: e.target.value === 'Admin'})}
                                                        />User
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Status:</label>
                                                <div className="form-check">
                                                    <input checked={displayU.status === true} className="form-check-input"
                                                        type="radio" value={"Hoạt động"} name="trangThai" id="flexRadioDefault3"
                                                        onChange={(e)=>setDisplayU({...displayU,status: e.target.value === 'Hoạt động'})}
                                                        />Hoạt động
                                                </div>
                                                <div className="form-check">
                                                    <input checked={displayU.status === false} className="form-check-input"
                                                        type="radio" value={"Bị khóa"} name="trangThai" id="flexRadioDefault4"
                                                        onChange={(e)=>setDisplayU({...displayU,status: e.target.value === 'Hoạt động'})}
                                                        />Bị khóa
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Gender:</label>
                                                <div className="form-check">
                                                    <input
                                                        checked={displayU.gender === true} 
                                                        className="form-check-input"
                                                        value={"Male"} 
                                                        type="radio"
                                                        name="gioiTinh"
                                                        id="flexRadioDefault5"
                                                        onChange={(e) => setDisplayU({ ...displayU, gender: e.target.value === 'Male' })}
                                                    />Nam
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        checked={displayU.gender === false} 
                                                        className="form-check-input"
                                                        value={"Female"} 
                                                        type="radio"
                                                        name="gioiTinh"
                                                        id="flexRadioDefault6"
                                                        onChange={(e) => setDisplayU({ ...displayU, gender: e.target.value === 'Male' })}
                                                    />Nữ
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Email:</label>
                                                <input id="email" disabled={editting} name="email"
                                                    value={displayU?.email || ''} type="email" className="form-control"
                                                    placeholder="Nhập vào email"
                                                    onChange={(e)=>(basicValidation(e,"email"))}
                                                    />
                                                <em className='text-danger'>{err?.errEmail}</em>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Phone number:</label>
                                                <input id="soDienThoai" disabled={editting}
                                                    value={displayU?.phoneNumber || ''} name="soDienThoai"
                                                    type="text" className="form-control"
                                                    placeholder='Nhập vào số điện thoại'
                                                    onChange={(e)=>(basicValidation(e,"phone"))}
                                                    />
                                                <em className='text-danger'>{err?.errPhone}</em>
                                            </div>
                                        </div>
                                    </div>
                                    <button type='button' disabled={editting} className="btn btn-success me-2" onClick={handlePost}>Thêm</button>
                                    <button type="button" onClick={handlePut} disabled={!editting} className="btn btn-primary me-2">Cập nhật</button>
                                    <button type='button' onClick={resetForm} className="btn me-2" style={{ backgroundColor: '#656565' }}>Làm mới</button>
                                </form>
                            </div>

                            <div className="userList" style={{marginTop:"20px"}}>
                                <h4 className="text-center">Danh sách người dùng</h4>
                                <form onSubmit={(event)=>handleSearchSubmit(event)}>
                                    <div className="row">
                                        <div className="col-md-4 col-xxl-8">
                                            <div className="input-group mb-3">
                                                <select onChange={(event)=> handleSortChange(event)} name="sort" className="form-select" aria-label="Default select example">
                                                    <option value="Username">Username</option>
                                                    <option value="Phone number">Phone number</option>
                                                    <option value="Email">Email</option>
                                                    <option value="Full name">Full name</option>
                                                </select>
                                                <input value={search} name="search" type="search" className="form-control"
                                                    placeholder="Tìm kiếm" aria-describedby="basic-addon2" onChange={handleSearchChange}/>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <table className="table table-striped table-hover table-light">
                                    <thead className="text-center" style={{ backgroundColor: '#067a38', color: '#fff',fontSize:'0.8rem' }}>
                                        <th>Mã tài khoản</th>
                                        <th>Tên tài khoản</th>
                                        <th>Họ và tên</th>
                                        <th>Email</th>
                                        <th>Số ĐT</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Giới tính</th>
                                        <th>Hành động</th>
                                    </thead>
                                    <tbody className='text-center'>
                                        {users && users.length > 0 && users.map((user) => (
                                            <tr key={user.accountID}>
                                                <td>{user.accountID}</td>
                                                <td>{user.username}</td>
                                                <td>{user.fullName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phoneNumber}</td>
                                                <td>{user.role === true ? 'Admin' : 'User'}</td>
                                                <td>
                                                    <span className={`badge ${user.status === true ? 'bg-success' : 'bg-danger' }`}>{user.status
                                                        === true ? 'Active' : 'Banned' }</span>
                                                </td>
                                                <td>{user.gender ? 'Male' : 'Female'}</td>
                                                <td>
                                                    <i className="fa-solid fa-pen-to-square" onClick={()=>fetchDetail(user.accountID)}></i>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="text-center" hidden={totalPage!==0}>
                                    <p className="fw-bold">Không tìm thấy người dùng tương ứng</p>
                                </div>
                                <div hidden={totalPage===0} className="d-flex justify-content-between" style={{marginTop:"25px"}}>
                                    {/* Vị trí hiển thị số trang */}
                                    <p className="fw-bold">Đang xem trang {pageNum} / {totalPage}</p>

                                    
                                    {/* React Paginate */}
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
                                    <p className="fw-bold">6 bản ghi / 1 trang</p>
                                </div> 
                            </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default User;