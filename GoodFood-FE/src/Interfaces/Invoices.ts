import { InvoiceStatuses } from "./InvoicesStatuses";

export interface Invoices{
    invoiceID: number,
    shippingFee: number,
    totalPrice: number,
    createdAt: Date | string,
    paymentMethod: boolean,
    status: boolean,
    note: string,
    cancelReason: string,
    receiveAddress: string,
    receiveName: string,
    receivePhone: string,
    accountID: number,
    invoiceStatusID: number,
    invoiceStatus: InvoiceStatuses | null
}