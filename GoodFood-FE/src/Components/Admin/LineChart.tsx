import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../Services/AxiosInstance';
import Chart from 'chart.js/auto';

const LineChart = () => {
    type lineChart = {
        Month: number;
        TotalIncome: number;
    };

    const [dataLC, setDataLC] = useState<lineChart[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get(`admin/linechart`);
            setDataLC(response.data.data);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Destroy chart cũ nếu có
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 225);
        gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
        gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ],
                datasets: [{
                    label: "Doanh thu (VNĐ)",
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: "#067a38",
                    data: Array.from({ length: 12 }, (_, i) => {
                        const monthData = dataLC.find(item => item.Month === i + 1);
                        return monthData ? monthData.TotalIncome : 0;
                    })
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    filler: {
                        propagate: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(0,0,0,0.0)"
                        }
                    },
                    y: {
                        ticks: {
                            stepSize: 1000
                        },
                        grid: {
                            color: "rgba(0,0,0,0.0)"
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }, [dataLC]); // ← Gắn vào dependency để chart render lại khi có data

    return (
        <div className="chart chart-sm">
            <canvas id="chartjs-dashboard-line" ref={canvasRef}></canvas>
        </div>
    );
};

export default LineChart;
