export interface EntryTransaction {
    data: {
        date?: string,
        customer?: UserData,
        deliveryBoy?: UserData,
        sent?: number,
        recieved?: number,
        rate?: number,
        payment?: number,
        transactionId: string,
        extraDetails?: string
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