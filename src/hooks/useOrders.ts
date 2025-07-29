import { useQuery, useMutation, type UseMutationResult, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { createOrder, deleteOrder, getAllOrders, getAllOrdersWithoutAuth, updateOrder,  getOrdersByUserId } from '../api/orders';
import type { OrderStatus, TOrders } from '@/interfaces/orderInterface';

//  fetch users

export const orderService = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const raw: any = await getAllOrdersWithoutAuth();
            // Defensive: If the API returns an object, try to extract array
            if (Array.isArray(raw)) return raw;
            if (raw && Array.isArray(raw.data)) return raw.data;
            if (raw && Array.isArray(raw.orders)) return raw.orders;
            return [];
        },
    });
    return { data, isLoading, isError, error };
}
// Fetch orders assigned to a driver with better error handling
export const useDriverDeliveries = (user_id: number | string) => {
    return useQuery({
        queryKey: ['driverDeliveries', user_id],
        queryFn: async () => {
            try {
                console.log('[useDriverDeliveries] Fetching orders for user:', user_id);
                return await getOrdersByUserId(user_id);
            } catch (error: any) {
                console.error('[useDriverDeliveries] Error:', error);

                // Handle specific error cases
                if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
                    console.error('[useDriverDeliveries] 403 Forbidden - User may not have permission');
                    throw new Error('Access denied: You do not have permission to view these orders');
                }

                if (error.message?.includes('Unauthorized')) {
                    throw error; // Re-throw our custom authorization error
                }

                // For other errors, provide a generic message
                throw new Error('Failed to fetch delivery orders. Please try again.');
            }
        },
        enabled: !!user_id,
        retry: (failureCount, error: any) => {
            // Don't retry on authorization errors
            if (error.message?.includes('Access denied') || error.message?.includes('Unauthorized')) {
                return false;
            }
            // Retry up to 2 times for other errors
            return failureCount < 2;
        },
    });
};

// update order (ensure driver deliveries are invalidated)
export const useUpdateOrder = (): UseMutationResult<TOrders, unknown, { id: string; order: TOrders }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, order }) => updateOrder(id, order),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.setQueryData(['orders', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating order:', error);
        }
    });
}
// delete order (ensure driver deliveries are invalidated)
export const useDeleteOrder = (): UseMutationResult<void, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
        },
        onError: (error) => {
            console.error('Error deleting order:', error);
        }
    });
}
// create order
export const useCreateOrder = (): UseMutationResult<TOrders, unknown, TOrders> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (order) => createOrder(order),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.setQueryData(['orders', data.id], data);
        },
        onError: (error) => {
            console.error('Error creating order:', error);
        }
    });
}
// get order by id
export const useGetOrderById = (id: number): UseQueryResult<TOrders | undefined, Error> => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => getAllOrders().then(orders => orders.find(order => order.id === id)),
        enabled: !!id, // Only run the query if id is provided
    });
}
// get orders by user id
export const useGetOrdersByUserId = (user_id: number | string): UseQueryResult<TOrders[], Error> => {
    return useQuery({
        queryKey: ['orders', 'user', user_id],
        queryFn: () => getAllOrders().then(orders => orders.filter(order => order.user_id === user_id)),
        enabled: !!user_id, // Only run the query if user_id is provided
    });
}
// get orders by status
export const useGetOrdersByStatus = (status: OrderStatus): UseQueryResult<TOrders[],
    Error> => {
    return useQuery({
        queryKey: ['orders', 'status', status],
        queryFn: () => getAllOrders().then(orders => orders.filter(order => order.status === status)),
        enabled: !!status, // Only run the query if status is provided
    });
}
