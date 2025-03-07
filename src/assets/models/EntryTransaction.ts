import { ProductQuantity } from "./Product";

export interface EntryTransaction {
    data: {
        date?: string,
        customer?: UserData,
        deliveryBoy?: UserData,
        total?: number,
        payment?: number,
        transactionId: string,
        extraDetails?: string,
        shippingAddress?: string,
        selectedProducts?: ProductQuantity[]
    }, others?: {
        createdBy?: string,
        createdTime?: number,
        editedBy?: string,
        editedTime?: number;
    }
}

export interface UserData {
    fullName?: string,
    phoneNumber?: string,
    userId: string
}