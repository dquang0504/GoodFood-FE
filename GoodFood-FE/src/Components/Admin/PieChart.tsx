import { Chart } from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../Services/AxiosInstance';

const PieChart = () => {

    type pieChart = {
        Label: string,
        Value: number
    }

    const [dataPC,setDataPC] = useState<pieChart[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null); // thay vì Chart

    const fetchData = async()=>{
        try {
            const response = await axiosInstance.get(`admin/piechart`);
            setDataPC(response.data.data)
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
            type: 'pie',
            data:{
                labels: dataPC.map(item => item.Label),
                datasets: [{
                    data: dataPC.map(item => item.Value),
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
                cutout: 75
            }
        })
    },[dataPC])

    return (
        <div className="chart chart-xs">
            <canvas id="chartjs-dashboard-pie" ref={canvasRef}></canvas>
        </div>
    );
};

export default PieChart;