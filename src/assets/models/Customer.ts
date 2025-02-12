export interface Customer {
    data?: {
        fullName?: string,
        phoneNumber?: string,
        address?: string,
        shippingAddress?: string,
        extraNote?: string,
        userId?: string
    },
    others: {
        createdBy?: string,
        createdTime?: number
    }
}