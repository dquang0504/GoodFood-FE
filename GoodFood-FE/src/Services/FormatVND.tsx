import axios from "axios";

export const formatVND = (value: number) => {
    return value ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '';
}

export const convertVNDToUSD = async (amountVND: number) => {
    const key = import.meta.env.VITE_EXCHANGERATE_KEY
    try {
        const res = await axios(
            `https://api.exchangerate.host/convert?access_key=${key}&from=VND&to=USD&amount=${amountVND}`
        );
        console.log(res);
        return res.data.result.toFixed(2).toString();
    } catch (error) {
        console.error("Lỗi khi lấy tỉ giá:", error);
        // return (amountVND / 25000).toFixed(2).toString(); // fallback tỉ giá 25k VND = 1 USD
    }
}