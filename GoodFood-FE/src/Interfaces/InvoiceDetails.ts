import { Invoices } from "./Invoices"
import { Products } from "./Products"

export interface InvoiceDetails{
    invoiceDetailID: number,
    quantity: number,
    price: number,
    productID: number,
    product: Products | null
    invoiceID: number,
    invoice: Invoices | null
}