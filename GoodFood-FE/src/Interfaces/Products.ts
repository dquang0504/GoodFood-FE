import { ProductTypes } from "./ProductTypes"

export interface Products{
    productID: number,
    productName: string,
    price: number,
    coverImage: string,
    description: string,
    status: boolean,
    insertDate: Date,
    productTypeID: number
}