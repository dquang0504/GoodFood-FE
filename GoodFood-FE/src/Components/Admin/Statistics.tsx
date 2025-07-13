import React, { useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import { StatisticalData } from '../../Interfaces/StatisticalData';
import { toast } from 'react-toastify';
import { formatVND } from '../../Services/FormatVND';
import Footer from './Footer';
import axiosInstance from '../../Services/AxiosInstance';
import { access } from 'fs';

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

    const handleSearch = async(ngayFrom: Date, ngayTo: Date, filterString: string)=>{
        if(filterString === ""){
            toast.error("Please choose a filter first!");
        }
        try {
            const response = await axiosInstance.get(`/admin/statistic?filter=${filterString}&ngayFrom=${ngayFrom.toISOString().slice(0, 10)}&ngayTo=${ngayTo.toISOString().slice(0, 10)}`);
            setStatistics(response.data.data);
            if(response.data.data == null){
                toast.info("There is no data within that time range!");
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message)
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
                                        <label className="form-label">From date:</label>
                                        <input onChange={(e)=>handleDateChange(e)} 
                                            name="ngayFrom" className="form-control"
                                            type="date" placeholder="Input starting date"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">To date:</label>
                                        <input onChange={(e)=>handleDateChange(e)} 
                                               name="ngayTo" className="form-control"
                                             type="date" placeholder="Input ending date"
                                             />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Filter:</label>
                                        <div className="input-group mb-3">
                                            <select value={filter} onChange={(e) => setFilter(e.target.value)} name="select" className="form-select" aria-label="Default select example">
                                                {filter ? (
                                                    <option value={filter} hidden>{filter}</option>
                                                ) : (
                                                    <option disabled value="" hidden>Choose a filter</option>
                                                )}
                                                <option value="Filter by revenue">Filter by revenue</option>
                                            </select>
                                            <button type='button' onClick={()=>handleSearch(ngayFrom,ngayTo,filter)} id="searchButton" className="btn btn-success">Search</button>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {statistics && statistics.length > 0 && (
                                <div>
                                    <table id="dataTable" className="table table-striped table-hover table-light">
                                        <thead className="text-center" style={{ backgroundColor: '#067a38', color: '#fff',fontSize:'0.8rem' }}>
                                            <th>Product type</th>
                                            <th>Total sales</th>
                                            <th>Revenue</th>
                                        </thead>
                                        <tbody className="text-center">
                                            {statistics.map((item,index)=>(
                                                <tr key={index}>
                                                    <td>{item.productType}</td>
                                                    <td>{item.totalSale}</td>
                                                    <td>{formatVND(item.totalRevenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <h2 className="text-success">Total Revenue:<span> {formatVND(statistics.reduce((acc,total)=> acc + total.totalRevenue,0))}</span>
                                    </h2>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
                <Footer></Footer>
            </div>
        </div>
    );
};

export default Statistics;