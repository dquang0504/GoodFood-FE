import { Products } from "./Products";

export interface Carts{
    cartID: number,
    quantity: number,
    productID: number,
    accountID: number,
    product: Products
}