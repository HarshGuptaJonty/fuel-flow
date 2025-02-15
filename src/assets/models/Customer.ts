export interface Customer {
    data?: {
        fullName?: string,
        phoneNumber?: string,
        address?: string,
        shippingAddress?: string,
        extraNote?: string,
        userId: string
    },
    entry?: {
        pendingCount?: number,
        dueAmount?: number
    },
    others?: {
        createdBy?: string,
        createdTime?: number,
    }
}