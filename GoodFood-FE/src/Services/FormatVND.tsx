export const formatVND = (value: number)=>{
    return value?value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'}): '';
}