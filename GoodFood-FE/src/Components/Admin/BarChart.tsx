import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../Services/AxiosInstance';
import { Chart } from 'chart.js';

const BarChart = () => {

    type barChart = {
        Month: number,
        Value: number
    }
    
    const [dataBC,setDataBC] = useState<barChart[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null); // thay vì Chart

    const fetchData = async()=>{
        try {
            const response = await axiosInstance.get(`admin/barchart`);
            setDataBC(response.data.data)
            console.log(response.data.data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    useEffect(()=>{
            if (!canvasRef.current) return;
    
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;
    
            //destroy existing chart
            if(chartInstanceRef.current){
                chartInstanceRef.current.destroy();
            }
    
            chartInstanceRef.current = new Chart(ctx,{
                type: 'bar',
                data:{
                    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
                    datasets: [{
                        data: Array.from({length: 12},(_,i)=>{
                            const monthData = dataBC.find(item => item.Month === i + 1);
                            return monthData ? monthData.Value : 0;
                        }),
                        backgroundColor: [
                            "#007bff",
                            "#17a2b8",
                            "#ffc107",
                            "#dc3545",
                            "#17a2b8"
                        ],
                        borderWidth: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins:{
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                          grid: {
                            display: false
                          },
                          stacked: false,
                          ticks: {
                            stepSize: 20
                          }
                        },
                        x: {
                          stacked: false,
                          grid: {
                            color: "transparent"
                          }
                        }
                      }
                }
            })
    },[dataBC])

    return (
        <div className="align-self-center chart chart-lg">
            <canvas id="chartjs-dashboard-bar" ref={canvasRef}></canvas>
        </div>
    );
};

export default BarChart;