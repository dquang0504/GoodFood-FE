import { useEffect, useState } from 'react';
import SideNav from './SideNav';
import HorizontalNav from './HorizontalNav';
import Footer from './Footer';
// import '../../assets/css/Admin/app.css.map';
import '../../assets/css/Admin/app.css'
import '../../assets/css/Admin/pagination.css';
import '../../assets/css/Admin/test.css';
import axiosInstance from '../../Services/AxiosInstance';
import { DashboardTS } from '../../Interfaces/Admin/DashboardTS';
import { formatVND } from '../../Services/FormatVND';
import LineChart from './LineChart';
import PieChart from './PieChart';
import BarChart from './BarChart';
import Calendar from './Calendar';

const Dashboard = () => {

    type pieChart = {
        Label: string,
        Value: number
    }
    const [dataPC,setDataPC] = useState<pieChart[]>([]);

    const [dashboard,setDashboard] = useState<DashboardTS>({
        TotalIncome: 0,
        TotalInvoice: 0,
        TotalProductSold: 0,
        TotalUser: 0
    });

    const fetchValues = async()=>{
        try {
            const response = await axiosInstance.get(`admin/dashboard`);
            setDashboard(response.data.data);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchData = async()=>{
        try {
            const response = await axiosInstance.get(`admin/piechart`);
            setDataPC(response.data.data)
            console.log(response.data.data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        fetchValues();
        fetchData();
    },[])

    return (
        <div className="wrapper">

            <SideNav></SideNav>

            <div className="main main-admin p-0">

                <HorizontalNav></HorizontalNav>

                <main className="content">
                    <div className="container-fluid p-0">
                        <h1 className="h3 mb-3">
                            <strong>Analytics</strong>
                        </h1>

                        <div className="row">
                            <div className="col-xl-6 col-xxl-5 d-flex">
                                <div className="w-100">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="card">
                                                <div className="card-body"  style={{borderRadius:8}}>
                                                    <div className="row">
                                                        <div className="col mt-0">
                                                            <h5 className="card-title">Total product sales</h5>
                                                        </div>

                                                        <div className="col-auto">
                                                            <div className="stat text-primary">
                                                                <i className="fa-solid fa-truck" style={{color: '#067a38'}} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h1 className="mt-1 mb-3 fs-2"> {dashboard.TotalProductSold}</h1>
                                                    <div className="mb-0">

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-body"  style={{borderRadius:8}}>
                                                    <div className="row">
                                                        <div className="col mt-0">
                                                            <h5 className="card-title">Registered users</h5>
                                                        </div>

                                                        <div className="col-auto">
                                                            <div className="stat text-primary">
                                                                <i className="fa-solid fa-users" style={{color: '#067a38'}}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h1 className="mt-1 mb-3 fs-2"> {dashboard.TotalUser} </h1>
                                                    <div className="mb-0">

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="card">
                                                <div className="card-body"  style={{borderRadius:8}}>
                                                    <div className="row">
                                                        <div className="col mt-0">
                                                            <h5 className="card-title">Revenue</h5>
                                                        </div>

                                                        <div className="col-auto">
                                                            <div className="stat text-primary">
                                                                <i className="fa-solid fa-dollar-sign" style={{color: '#067a38'}}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h1 className="mt-1 mb-3 fs-2">
                                                        {formatVND(dashboard.TotalIncome)}
                                                    </h1>
                                                    <div className="mb-0">

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-body" style={{borderRadius:8}}>
                                                    <div className="row">
                                                        <div className="col mt-0">
                                                            <h5 className="card-title">Total orders placed</h5>
                                                        </div>

                                                        <div className="col-auto">
                                                            <div className="stat text-primary">
                                                                <i className="fa-solid fa-shopping-cart" style={{color: '#067a38'}}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h1 className="mt-1 mb-3 fs-2">{dashboard.TotalInvoice}</h1>
                                                    <div className="mb-0">

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-xxl-7 col-sm-6">
                                <div className="card flex-fill w-100">
                                    <div className="card-header">

                                        <h5 className="card-title mb-0">Sales revenue chart</h5>
                                    </div>
                                    <div className="card-body py-3" style={{borderRadius:8}}>
                                        <div className="chart chart-sm">
                                            <LineChart />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row d-flex justify-content-center">
                            <div className="col-12 col-md-6 col-xxl-3 d-flex order-2 order-xxl-3">
                                <div className="card flex-fill w-100">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">Distribution of purchases by product type</h5>
                                    </div>
                                    <div className="card-body d-flex" style={{borderRadius:8}}>
                                        <div className="align-self-center w-100">
                                            <div className="py-3">
                                                <div className="chart chart-xs">
                                                    <PieChart></PieChart>
                                                </div>
                                            </div>
                                            <table className="table mb-0">
                                                <tbody>
                                                    {dataPC.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.Label}</td>
                                                            <td className="text-end">{item.Value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-lg-4 col-xxl-3 d-flex">
                                <div className="card flex-fill w-100">
                                    <div className="card-header">

                                        <h5 className="card-title mb-0">Monthly product sales</h5>
                                    </div>
                                    <div className="card-body d-flex w-100" style={{borderRadius:8}}>
                                        <div className="align-self-center chart chart-lg">
                                            <BarChart ></BarChart>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-6 col-xxl-3 d-flex order-1 order-xxl-1">
                                <div className="card flex-fill">
                                    <div className="card-header">

                                        <h5 className="card-title mb-0">Calendar</h5>
                                    </div>
                                    <div className="card-body d-flex" style={{borderRadius:8}}>
                                        <div className="align-self-center w-100">
                                            <div className="chart">
                                                <Calendar></Calendar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
                <Footer></Footer>

            </div>
        </div>
    );
};

export default Dashboard;