import React, { useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import { StatisticalData } from '../../Interfaces/StatisticalData';
import { toast } from 'react-toastify';

const Statistics = () => {

    const [ngayFrom,setNgayFrom] = useState(new Date());
    const [ngayTo,setNgayTo] = useState(new Date());
    const [statistics,setStatistics] = useState<StatisticalData[]>([]);
    const [filter,setFilter] = useState("");

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value} = event.target
        if (name === "ngayFrom"){
            setNgayFrom(new Date(value))
        }
        else if(name === "ngayTo"){
            setNgayTo(new Date(value))
        }
    }

    const handleSearch = async()=>{
        if(filter === ""){
            toast.error("Please choose a filter first!");
        }
        try {
            
        } catch (error) {
            
        }
    }

    return (
        <div className="wrapper">
            <SideNav></SideNav>
            <div className="main main-admin p-0">
                <HorizontalNav></HorizontalNav>
                <main className="content">
                    <div className="container-fluid p-0">
                        <h1 className="h3 mb-3">Statistical Data</h1>
                        <div className="analyticsList" style={{marginTop:"20px"}}>
                            <form>
                                <div className='row'>
                                    <div className="col-md-3">
                                        <label className="form-label">Ngày bắt đầu:</label>
                                        <input onChange={(e)=>handleDateChange(e)} 
                                            name="ngayFrom" className="form-control"
                                            type="date" placeholder="Nhập vào ngày bắt đầu"
                                            value={ngayFrom.toDateString()}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Ngày kết thúc:</label>
                                        <input onChange={(e)=>handleDateChange(e)} 
                                               name="ngayTo" className="form-control"
                                             type="date" placeholder="Nhập vào ngày kết thúc"
                                                value={ngayTo.toDateString()}
                                             />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Bộ lọc:</label>
                                        <div className="input-group mb-3">
                                            <select value={filter} onChange={(e) => setFilter(e.target.value)} name="select" className="form-select" aria-label="Default select example">
                                                {filter ? (
                                                    <option value={filter} hidden>{filter}</option>
                                                ) : (
                                                    <option disabled value="" hidden>Choose a filter</option>
                                                )}
                                                <option value="Lọc theo doanh thu">Filter by revenue</option>
                                            </select>
                                            <button type='button' onClick={handleSearch} id="searchButton" className="btn btn-success">Tìm kiếm</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Statistics;