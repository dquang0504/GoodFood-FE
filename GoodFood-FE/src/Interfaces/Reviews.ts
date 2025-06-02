import { Products } from "./Products";
import { Replies } from "./Replies";
import { ReviewImages } from "./ReviewImages";
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
    reviewAccount: Users | null,
    reviewProduct: Products | null
    reviewImages: ReviewImages | null,
    reviewReply: Replies | null
}