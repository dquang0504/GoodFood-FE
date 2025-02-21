import { Users } from "./Users";

export interface Reviews{
    reviewID: number,
    reviewDate: Date,
    stars: number,
    comment: string,
    status: boolean,
    productID: number,
    accountID: number,
    invoiceID: number,
    reviewAccount: Users
}