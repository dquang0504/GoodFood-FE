import { ProductImages } from "./ProductImages"
import { ProductTypes } from "./ProductTypes"

export interface Products{
    productID: number,
    productName: string,
    price: number,
    coverImage: string,
    description: string,
    status: boolean,
    insertDate: Date,
    productTypeID: number,
    weight: number,
    productType: ProductTypes | null,
    productImages: ProductImages[]
}