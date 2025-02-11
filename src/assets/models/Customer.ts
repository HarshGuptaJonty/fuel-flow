export interface Customer {
    data?: {
        fullName?: string,
        phoneNumber?: string,
        address?: string,
        shippingAddress?: string,
        extraNote?: string
    },
    others: {
        createdBy?: string,
        createdTime?: number
    }
}