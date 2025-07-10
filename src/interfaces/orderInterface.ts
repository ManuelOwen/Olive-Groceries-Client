export enum OrderStatus {
    Pending = "pending",
    Confirmed = "confirmed",
    Processing = "processing",
    Shipped = "shipped",
    Delivered = "delivered",
    Cancelled = "cancelled"
}
export enum OrderPriority {
    Low = "low",
    Medium = "normal",
    High = "high",
    Urgent = "urgent"
}
export enum userRole {
    Admin = 'admin',
    User = 'user',
    Driver = 'driver'
}
export interface TUser {
    id: number;
    fullName: string;
    email: string;
    password?: string; // Optional for security reasons
    address: string;
    phoneNumber: string;
    role?: userRole; // Optional role property
}

export interface TOrders {
    id: number;
    order_number: string;
    total_amount: number;
    status:OrderStatus;
    priority: string;
    shipping_address: string;
    billing_address: string;
    shipped_at: Date;
    delivered_at: string | null;
    user_id: number;
    user?: {
        id: number;
        fullName: string;
        email: string;
    };
}

export enum productCategory {
    FRUIT = 'fruit',
    VEGETABLE = 'vegetable',
    DAIRY = 'dairy',
    BAKERY = 'bakery',
    MEAT = 'meat',
    SEAFOOD = 'seafood',
    BEVERAGE = 'beverage',
    SNACK = 'snack',
}