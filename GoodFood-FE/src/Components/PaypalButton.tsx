import { useEffect } from "react";

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PayPalButton() {
  const paypalClientID = import.meta.env.VITE_PAYPAL_CLIENT_ID
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientID}&currency=USD`;
    script.async = true;
    script.onload = () => {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: "10.00" } // số tiền test
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          console.log("Transaction completed by " + details.payer.name.given_name);
        }
      }).render("#paypal-button-container");
    };
    document.body.appendChild(script);
  }, []);

  return <div id="paypal-button-container">Paypal</div>;
}
