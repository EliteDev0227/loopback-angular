export class Orders {
    id: number;
    customer_id: number;
    address_id: number;
    delivery_date: string;
    delivery_time_from: string;
    delivery_time_to: string;
    type: number;
    created_date: string;
    delivered_date: string;
    queue_id: number;
    value: number;
    items: any;
    address: any;
}