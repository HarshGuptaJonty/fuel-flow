import { ProductQuantity } from "./Product";

export interface DataForExportFormat {
    date: string,
    customer: {
        fullName: string,
        phoneNumber: string,
        userId: string
    },
    deliveryBoy: {
        fullName?: string,
        phoneNumber?: string,
        userId: string
    },
    totamAmt: number;
    paymentAmt: number;
    transactionId: string;
    shippingAddress: string;
    productDetail: ProductQuantity[];
}