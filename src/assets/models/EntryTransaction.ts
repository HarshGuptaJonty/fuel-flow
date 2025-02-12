export interface EntryTransaction {
    data: {
        date?: string,
        customer?: UserData,
        deliveryBoy?: UserData,
        sent?: number,
        recieved?: number,
        rate?: number,
        payment?: number,
        transactionId: string;
    }, others?: {
        createdBy?: string,
        createdTime?: number,
        editedBy?: string,
        editedTime?: number;
    }
}

interface UserData {
    fullName?: string,
    phoneNumber?: string,
    userId?: string
}