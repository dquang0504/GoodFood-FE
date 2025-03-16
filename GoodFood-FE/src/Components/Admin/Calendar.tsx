import React, { useEffect } from 'react';
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css"; // Import CSS of flatpickr

const Calendar = () => {
    useEffect(()=>{

        // Kiểm tra nếu element tồn tại và flatpickr được gắn thành công
        const calendarElement = document.getElementById("datetimepicker-dashboard");

        if (calendarElement) {
            // Sử dụng flatpickr để tạo calendar
            flatpickr(calendarElement, {
                inline: true,
                prevArrow: "<span title=\"Previous month\">&laquo;</span>",
                nextArrow: "<span title=\"Next month\">&raquo;</span>",
                defaultDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 ngày trước
            });
        }else {
            console.error("Calendar element không tìm thấy");
        }
    },[])

    return (
        <div className="chart">
            <div id="datetimepicker-dashboard"></div>
        </div>
    );
};

export default Calendar;