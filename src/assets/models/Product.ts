export interface Product {
    data: {
        name: string;
        rate?: number;
        extraNote?: string;
        productId: string;
    },
    others?: {
        createdBy?: string,
        createdTime?: number,
        editedBy?: string,
        editedTime?: number;
    }
}