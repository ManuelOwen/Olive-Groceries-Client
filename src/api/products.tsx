// Product interfaces
export interface TProduct {
    id: number;
    product_name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    rating?: number;
    inStock: boolean;
    stock_quantity?: number;
    created_at?: string;
    updated_at?: string;
}

export interface TProductCreate {
    product_name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    inStock: boolean;
    stock_quantity?: number;
}

import { authenticatedFetch } from "@/lib/utils";

const url = "http://localhost:8000/api/v1";

// Helper functions
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
};

// Temporary function to test API without authentication
export const getAllProductsWithoutAuth = async (): Promise<TProduct[]> => {
    console.log('Making unauthenticated request to products API...');
    console.log('URL:', `${url}/products`);
    
    try {
        const response = await fetch(`${url}/products`);
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
                console.log('Extracting products from data property');
                return data.data;
            } else if (data && Array.isArray(data.products)) {
                // If the API returns { products: [...] }
                return data.products;
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
};

// Get all products
export const getAllProducts = async (): Promise<TProduct[]> => {
    const response = await authenticatedFetch(`${url}/products`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        // If the API returns { success: true, message: "...", data: [...] }
        return data.data;
    } else if (data && Array.isArray(data.products)) {
        // If the API returns { products: [...] }
        return data.products;
    } else {
        console.error('Unexpected data format:', data);
        throw new Error('API returned unexpected data format');
    }
};

// Get product by product id 
export const getProductById = async (id: number | string): Promise<TProduct> => {
    const response = await authenticatedFetch(`${url}/products/${id}`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (data && data.data) {
        return data.data;
    }
    return data;
};

// Create a new product
export const createProduct = async (productData: TProductCreate): Promise<TProduct> => {
    const response = await authenticatedFetch(`${url}/products`, {
        method: 'POST',
        body: JSON.stringify(productData),
    });
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (data && data.data) {
        return data.data;
    }
    return data;
};

// Update a product
export const updateProduct = async (id: number | string, productData: Partial<TProduct>): Promise<TProduct> => {
    const response = await authenticatedFetch(`${url}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
    });
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (data && data.data) {
        return data.data;
    }
    return data;
};

// Delete a product
export const deleteProduct = async (id: number | string): Promise<void> => {
    const response = await authenticatedFetch(`${url}/products/${id}`, {
        method: 'DELETE',
    });
    await handleResponseApi(response);
    const data = await response.json();
    return data;
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<TProduct[]> => {
    const response = await authenticatedFetch(`${url}/products/category/${category}`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.products)) {
        return data.products;
    }
    return data;
};

// Search products by name
export const searchProductsByName = async (name: string): Promise<TProduct[]> => {
    const response = await authenticatedFetch(`${url}/products/search?name=${encodeURIComponent(name)}`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.products)) {
        return data.products;
    }
    return data;
};

// Get products by price range
export const getProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<TProduct[]> => {
    const response = await authenticatedFetch(`${url}/products/price-range?min=${minPrice}&max=${maxPrice}`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.products)) {
        return data.products;
    }
    return data;
};

// Update product stock
export const updateProductStock = async (id: number | string, stock_quantity: number): Promise<TProduct> => {
    const response = await authenticatedFetch(`${url}/products/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock_quantity }),
    });
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (data && data.data) {
        return data.data;
    }
    return data;
};

// Update product status (in stock/out of stock)
export const updateProductStatus = async (id: number | string, inStock: boolean): Promise<TProduct> => {
    const response = await authenticatedFetch(`${url}/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ inStock }),
    });
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (data && data.data) {
        return data.data;
    }
    return data;
};

// Get products with low stock
export const getLowStockProducts = async (threshold: number = 10): Promise<TProduct[]> => {
    const response = await authenticatedFetch(`${url}/products/low-stock?threshold=${threshold}`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.products)) {
        return data.products;
    }
    return data;
};

// Get featured products
export const getFeaturedProducts = async (): Promise<TProduct[]> => {
    const response = await authenticatedFetch(`${url}/products/featured`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.products)) {
        return data.products;
    }
    return data;
};