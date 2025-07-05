import type { TOrders } from "@/interfaces/orderInterface";
import { getAuthHeaders, authenticatedFetch } from "@/lib/utils";

const url ="http://localhost:8000/api/v1"
// helper functions
const handleResponseApi = async (response: Response) => {
    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } else {
                // If not JSON, try to read as text
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }
        } catch (parseError) {
            // If parsing fails, use the default error message
            console.warn('Failed to parse error response:', parseError);
        }

        throw new Error(errorMessage);
    }
    return response;
} 

// Temporary function to test API without authentication
export const getAllOrdersWithoutAuth = async (): Promise<TOrders[]> => {
    console.log('Making unauthenticated request to orders API...');
    console.log('URL:', `${url}/orders`);
    
    try {
        const response = await fetch(`${url}/orders`);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!response.ok) {
            console.error('API request failed:', response.status, response.statusText);
            console.error('Response body:', responseText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        // Try to parse as JSON
        try {
            const data = JSON.parse(responseText);
            console.log('Parsed response data:', data);
            
            // Check if data is an array (direct response)
            if (Array.isArray(data)) {
                return data;
            } else if (data && Array.isArray(data.data)) {
                // If the API returns { success: true, message: "...", data: [...] }
                console.log('Extracting orders from data property');
                return data.data;
            } else if (data && Array.isArray(data.orders)) {
                // If the API returns { orders: [...] }
                return data.orders;
            } else {
                console.error('Unexpected data format:', data);
                throw new Error('API returned unexpected data format');
            }
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            throw new Error('Invalid JSON response from API');
        }
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

//  get all orders
export const getAllOrders = async (): Promise<TOrders[]>=>{
    const response = await authenticatedFetch(`${url}/orders`)
    await handleResponseApi(response);
    return response.json()
}
// get order by order id 
export const getOrderById = async (id:number | string):Promise<TOrders>=>{
    const response = await authenticatedFetch(`${url}/orders/${id}`)
    await handleResponseApi(response);
    return response.json()
}
// create a new order
export const createOrder = async (orderData: TOrders): Promise<TOrders> => {
    const response = await authenticatedFetch(`${url}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
    await handleResponseApi(response);
    return response.json();
};
// update an order
export const updateOrder = async (id: number | string, orderData: Partial<TOrders
>): Promise<TOrders> => {
    const response = await authenticatedFetch(`${url}/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData),
    });
    await handleResponseApi(response);
    return response.json();
};
// delete an order
export const deleteOrder = async (id: number | string): Promise<void> => {
    const response = await authenticatedFetch(`${url}/orders/${id}`, {
        method: 'DELETE',
    });
    await handleResponseApi(response);
    return response.json();
};
// get orders by user id
export const getOrdersByUserId = async (userId: number | string): Promise<TOrders[]> => {
    const response = await authenticatedFetch(`${url}/orders/user/${userId}`);
    await handleResponseApi(response);
    return response.json();
}
// get orders by status
export const getOrdersByStatus = async (status: string): Promise<TOrders[]> => {
    const response = await authenticatedFetch(`${url}/orders/status/${status}`);
    await handleResponseApi(response);
    return response.json();
}
// get orders by priority
export const getOrdersByPriority = async (priority: number): Promise<TOrders[]> => {
    const response = await authenticatedFetch(`${url}/orders/priority/${priority}`);
    await handleResponseApi(response);
    return response.json();
}