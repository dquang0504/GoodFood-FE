import React, { useEffect } from "react";
import { Invoices } from "../Interfaces/Invoices";
import { convertVNDToUSD } from "../Services/FormatVND";
import axios from "axios";

declare global {
  interface Window {
    paypal: any;
  }
}

type PaypalButtonProps = {
  onSuccess: (details:any) => void;
  order: Invoices;
}

const PaypalButton: React.FC<PaypalButtonProps> = ({onSuccess,order}) => {
  const paypalClientID = import.meta.env.VITE_PAYPAL_CLIENT_ID
  let usdValue: string;
  useEffect(()=>{
    const convertVNDToUSD = async (amountVND: number) => {
      const key = import.meta.env.VITE_EXCHANGERATE_KEY
      try {
          const res = await axios(
              `https://api.exchangerate.host/convert?access_key=${key}&from=VND&to=USD&amount=${amountVND}`
          );
          console.log(res);
          usdValue = res.data.result.toFixed(2).toString();
      } catch (error) {
          console.error("Lỗi khi lấy tỉ giá:", error);
          // return (amountVND / 25000).toFixed(2).toString(); // fallback tỉ giá 25k VND = 1 USD
      }
    }
    convertVNDToUSD(order.totalPrice);
  },[])

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientID}&currency=USD`;
    script.async = true;
    script.onload = () => {
      window.paypal.Buttons({
        createOrder: (data: any,actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: usdValue, currency_code: "USD" } // số tiền test
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          console.log("Transaction completed by " + details.payer.name.given_name);
          console.log(details);
          onSuccess(details);
        }
      }).render("#paypal-button-container");
    };
    document.body.appendChild(script);
  }, []);

  return <div id="paypal-button-container">Paypal</div>;
}

export default PaypalButton;