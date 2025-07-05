import { useQuery, useMutation, type UseMutationResult, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { createOrder, deleteOrder, getAllOrders, getAllOrdersWithoutAuth, updateOrder } from '../api/orders';
import type { OrderStatus, TOrders } from '@/interfaces/orderInterface';

//  fetch users

export const orderService = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['orders'],
        queryFn: getAllOrdersWithoutAuth, // Temporarily using non-authenticated version
        // refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
}
// update order 
export const useUpdateOrder =(): UseMutationResult<TOrders,unknown,{id:string; order: TOrders}>=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, order}) => updateOrder(id, order),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.setQueryData(['orders', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating order:', error);
        }
    }); 
}
// delete order
export const useDeleteOrder = (): UseMutationResult<void, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
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
export const useGetOrderById = (id:number): UseQueryResult<TOrders | undefined, Error> => {
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
export const useGetOrdersByStatus = (status:OrderStatus): UseQueryResult<TOrders[],
    Error> => {
        return useQuery({
            queryKey: ['orders', 'status', status],
            queryFn: () => getAllOrders().then(orders => orders.filter(order => order.status === status)),
            enabled: !!status, // Only run the query if status is provided
        });
    }
