export interface DeliveryBoy {
    data?: {
        fullName?: string,
        phoneNumber?: string,
        address?: string,
        extraNote?: string,
        userId?: string
    },
    others?: {
        createdBy?: string,
        createdTime?: number,
    }
}