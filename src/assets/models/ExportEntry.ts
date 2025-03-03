export interface InventoryExportEntry {
    Date: string;
    'Customer Name'?: string;
    // 'Customer Phone': string;
    'Shipping Address'?: string;
    'Delivery Person Name': string;
    // 'Delivery Person Phone'?: string;
    'Sent Quantity'?: number;
    'Received Quantity'?: number;
    'Pending Units'?: number;
    'Rate/Unit'?: number;
    'Total Amount'?: number;
    'Payment Amount'?: number;
    'Due Amount'?: number;
}