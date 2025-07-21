import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductsByCategory,
  searchProductsByName,
  getProductsByPriceRange,
  updateProductStock,
  updateProductStatus,
  getLowStockProducts,
  getFeaturedProducts,
  type TProduct,
  type TProductCreate
} from '@/api/products';
import { useMutation, type UseMutationResult, useQueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';

// Hook to fetch all products (using the new API)
export const productService = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['products'],
        queryFn: getAllProducts,
        // refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};

// Create product hook
export const useCreateProduct = (): UseMutationResult<TProduct, unknown, TProductCreate> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product) => createProduct(product),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.setQueryData(['products', data.id], data);
        },
        onError: (error) => {
            console.error('Error creating product:', error);
            console.log('error')
        }
    });
};

// Update product hook
export const useUpdateProduct = (): UseMutationResult<TProduct, unknown, {id: string | number; product: Partial<TProduct>}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, product}) => updateProduct(id, product),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.setQueryData(['products', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating product:', error);
        }
    }); 
};

// Delete product hook
export const useDeleteProduct = (): UseMutationResult<void, unknown, string | number> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
        }
    });
};

// Get product by id hook
export const useGetProductById = (id: string | number): UseQueryResult<TProduct | undefined, Error> => {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => getProductById(id),
        enabled: !!id, // Only run the query if id is provided
    });
};

// Get products by category hook
export const useGetProductsByCategory = (category: string): UseQueryResult<TProduct[], Error> => {
    return useQuery({
        queryKey: ['products', 'category', category],
        queryFn: () => getProductsByCategory(category),
        enabled: !!category, // Only run the query if category is provided
    });
};

// Search products by name hook
export const useSearchProductsByName = (name: string): UseQueryResult<TProduct[], Error> => {
    return useQuery({
        queryKey: ['products', 'search', name],
        queryFn: () => searchProductsByName(name),
        enabled: !!name && name.length > 0, // Only run the query if name is provided and not empty
    });
};

// Get products by price range hook
export const useGetProductsByPriceRange = (minPrice: number, maxPrice: number): UseQueryResult<TProduct[], Error> => {
    return useQuery({
        queryKey: ['products', 'price-range', minPrice, maxPrice],
        queryFn: () => getProductsByPriceRange(minPrice, maxPrice),
        enabled: minPrice >= 0 && maxPrice > minPrice, // Only run if valid price range
    });
};

// Update product stock hook
export const useUpdateProductStock = (): UseMutationResult<TProduct, unknown, {id: string | number; stock_quantity: number}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, stock_quantity}) => updateProductStock(id, stock_quantity),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.setQueryData(['products', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating product stock:', error);
        }
    });
};

// Update product status hook
export const useUpdateProductStatus = (): UseMutationResult<TProduct, unknown, {id: string | number; inStock: boolean}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, inStock}) => updateProductStatus(id, inStock),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.setQueryData(['products', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating product status:', error);
        }
    });
};

// Get low stock products hook
export const useGetLowStockProducts = (threshold: number = 10): UseQueryResult<TProduct[], Error> => {
    return useQuery({
        queryKey: ['products', 'low-stock', threshold],
        queryFn: () => getLowStockProducts(threshold),
        enabled: threshold >= 0, // Only run if threshold is valid
    });
};

// Get featured products hook
export const useGetFeaturedProducts = (): UseQueryResult<TProduct[], Error> => {
    return useQuery({
        queryKey: ['products', 'featured'],
        queryFn: getFeaturedProducts,
    });
};

// Bulk update products hook (for multiple operations)
export const useBulkUpdateProducts = (): UseMutationResult<TProduct[], unknown, {ids: (string | number)[]; updates: Partial<TProduct>}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ids, updates}) => {
            const promises = ids.map(id => updateProduct(id, updates));
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error bulk updating products:', error);
        }
    });
};

// Toggle product status hook (convenience wrapper)
export const useToggleProductStatus = (): UseMutationResult<TProduct, unknown, {id: string | number; currentStatus: boolean}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, currentStatus}) => updateProductStatus(id, !currentStatus),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.setQueryData(['products', data.id], data);
        },
        onError: (error) => {
            console.error('Error toggling product status:', error);
        }
    });
};

// Re-export types for convenience
export type { TProduct, TProductCreate } from '@/api/products';