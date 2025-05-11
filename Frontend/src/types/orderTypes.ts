import { BaseModel } from "./baseType";

export interface Order extends BaseModel {
    user_id: number;
    status: string;
    total_price: number;
    order_items: OrderItem[];
}

export interface OrderItem extends BaseModel {
item_id: number;
item_name: string;
quantity: number;
price: number;
}