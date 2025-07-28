import { useQuery, useMutation, type UseMutationResult, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
    // getAllDeliveries,
    getAllDeliveriesWithoutAuth,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    getDeliveriesByDriverId,
    getDeliveriesByStatus,
    getDeliveriesByPriority,
    getDeliveriesByUserId,
    assignDeliveryToDriver,
    markDeliveryAsPickedUp,
    markDeliveryAsInTransit,
    markDeliveryAsDelivered,
    markDeliveryAsFailed,
    updateDeliveryLocation,
    getActiveDeliveriesForDriver,
    getCompletedDeliveriesForDriver,
    getDeliveryRoute
} from '../api/deliveries';
import type { TOrders } from '@/interfaces/orderInterface';

// Fetch all deliveries
export const useDeliveries = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['deliveries'],
        queryFn: getAllDeliveriesWithoutAuth, // Temporarily using non-authenticated version
        // refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};

// Fetch deliveries assigned to a specific driver
export const useDriverDeliveries = (driverId: number | string) => {
    return useQuery({
        queryKey: ['driverDeliveries', driverId],
        queryFn: () => getDeliveriesByDriverId(driverId),
        enabled: !!driverId,
    });
};

// Fetch active deliveries for a driver (currently assigned and in progress)
export const useActiveDriverDeliveries = (driverId: number | string) => {
    return useQuery({
        queryKey: ['activeDriverDeliveries', driverId],
        queryFn: () => getActiveDeliveriesForDriver(driverId),
        enabled: !!driverId,
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    });
};

// Fetch completed deliveries for a driver with optional date filtering
export const useCompletedDriverDeliveries = (
    driverId: number | string,
    dateFrom?: string,
    dateTo?: string
) => {
    return useQuery({
        queryKey: ['completedDriverDeliveries', driverId, dateFrom, dateTo],
        queryFn: () => getCompletedDeliveriesForDriver(driverId, dateFrom, dateTo),
        enabled: !!driverId,
    });
};

// Get delivery by ID
export const useGetDeliveryById = (id: number | string): UseQueryResult<TOrders | undefined, Error> => {
    return useQuery({
        queryKey: ['deliveries', id],
        queryFn: () => getDeliveryById(id),
        enabled: !!id, // Only run the query if id is provided
    });
};

// Get deliveries by user/customer ID
export const useGetDeliveriesByUserId = (userId: number | string): UseQueryResult<TOrders[], Error> => {
    return useQuery({
        queryKey: ['deliveries', 'user', userId],
        queryFn: () => getDeliveriesByUserId(userId),
        enabled: !!userId, // Only run the query if userId is provided
    });
};

// Get deliveries by status
export const useGetDeliveriesByStatus = (status: string): UseQueryResult<TOrders[], Error> => {
    return useQuery({
        queryKey: ['deliveries', 'status', status],
        queryFn: () => getDeliveriesByStatus(status),
        enabled: !!status, // Only run the query if status is provided
    });
};

// Get deliveries by priority
export const useGetDeliveriesByPriority = (priority: string): UseQueryResult<TOrders[], Error> => {
    return useQuery({
        queryKey: ['deliveries', 'priority', priority],
        queryFn: () => getDeliveriesByPriority(priority),
        enabled: !!priority, // Only run the query if priority is provided
    });
};

// Get delivery route/directions
export const useGetDeliveryRoute = (id: number | string) => {
    return useQuery({
        queryKey: ['deliveryRoute', id],
        queryFn: () => getDeliveryRoute(id),
        enabled: !!id,
    });
};

// Create delivery
export const useCreateDelivery = (): UseMutationResult<TOrders, unknown, TOrders> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (delivery) => createDelivery(delivery),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error creating delivery:', error);
        }
    });
};

// Update delivery
export const useUpdateDelivery = (): UseMutationResult<TOrders, unknown, { id: string; delivery: Partial<TOrders> }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, delivery }) => updateDelivery(id, delivery),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['completedDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating delivery:', error);
        }
    });
};

// Delete delivery
export const useDeleteDelivery = (): UseMutationResult<void, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteDelivery(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['completedDriverDeliveries'] });
        },
        onError: (error) => {
            console.error('Error deleting delivery:', error);
        }
    });
};

// Assign delivery to driver
export const useAssignDeliveryToDriver = (): UseMutationResult<TOrders, unknown, { deliveryId: string; driverId: string }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deliveryId, driverId }) => assignDeliveryToDriver(deliveryId, driverId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error assigning delivery to driver:', error);
        }
    });
};

// Mark delivery as picked up
export const useMarkDeliveryAsPickedUp = (): UseMutationResult<TOrders, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => markDeliveryAsPickedUp(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error marking delivery as picked up:', error);
        }
    });
};

// Mark delivery as in transit
export const useMarkDeliveryAsInTransit = (): UseMutationResult<TOrders, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => markDeliveryAsInTransit(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error marking delivery as in transit:', error);
        }
    });
};

// Mark delivery as delivered
export const useMarkDeliveryAsDelivered = (): UseMutationResult<TOrders, unknown, { id: string; deliveryNote?: string }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, deliveryNote }) => markDeliveryAsDelivered(id, deliveryNote),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['completedDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error marking delivery as delivered:', error);
        }
    });
};

// Mark delivery as failed
export const useMarkDeliveryAsFailed = (): UseMutationResult<TOrders, unknown, { id: string; failureReason: string }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, failureReason }) => markDeliveryAsFailed(id, failureReason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['completedDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error marking delivery as failed:', error);
        }
    });
};

// Update delivery location (GPS tracking)
export const useUpdateDeliveryLocation = (): UseMutationResult<TOrders, unknown, { id: string; latitude: number; longitude: number }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, latitude, longitude }) => updateDeliveryLocation(id, latitude, longitude),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['driverDeliveries'] });
            queryClient.invalidateQueries({ queryKey: ['activeDriverDeliveries'] });
            queryClient.setQueryData(['deliveries', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating delivery location:', error);
        }
    });
};