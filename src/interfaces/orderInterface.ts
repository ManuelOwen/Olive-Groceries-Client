export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4
}
export enum OrderPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent'
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