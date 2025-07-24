import { authenticatedFetch } from '@/lib/utils'

const url = '/api/v1'

// Product interfaces
export interface TProduct {
  id: number
  product_name: string
  description?: string
  price: number
  category: string
  image?: string
  imageUrl?: string
  rating?: number
  inStock: boolean
  stock_quantity?: number
  created_at?: string
  updated_at?: string
  phoneNumber?: string
  quantity: number
}

export interface TProductCreate {
  product_name: string
  description?: string
  price: number
  category: string
  image?: string
  imageUrl?: string
  inStock: boolean
  stock_quantity?: number
  phoneNumber?: string
  quantity: number
}

// Helper functions
const handleResponseApi = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        // If not JSON, try to read as text
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
      }
    } catch (parseError) {
      // If parsing fails, use the default error message
      console.warn('Failed to parse error response:', parseError)
    }

    throw new Error(errorMessage)
  }
  return response
}

// Temporary function to test API without authentication
// Get all products
export const getAllProducts = async (): Promise<TProduct[]> => {
  console.log('Fetching products from API...')

  try {
    // Try the API first
    const response = await fetch(`${url}/products`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      mode: 'cors',
    })

    console.log('API Response status:', response.status)
    console.log('API Response ok:', response.ok)

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    console.log('API response data:', data)

    // Handle the API response format
    if (data && data.success && Array.isArray(data.data)) {
      console.log(
        '✅ Successfully fetched products from API:',
        data.data.length,
      )
      return data.data
    } else if (Array.isArray(data)) {
      // Direct array response
      console.log(
        '✅ Successfully fetched products from API (direct array):',
        data.length,
      )
      return data
    } else if (data && Array.isArray(data.products)) {

      console.log(
        '✅ Successfully fetched products from API (products array):',
        data.products.length,
      )
      return data.products
    } else {
      console.error('Unexpected API response format:', data)
      throw new Error('API returned unexpected data format')
    }
  } catch (error) {
    console.error('❌ Failed to fetch products from API:', error)

    // If it's a CORS error, throw a specific error
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error(
        'Network error: Unable to connect to the server. Please check if the backend is running and CORS is configured.',
      )
    }

    // Re-throw other errors
    throw error
  }
}

// Get product by product id
export const getProductById = async (
  id: number | string,
): Promise<TProduct> => {
  console.log('Fetching product by ID from API:', id)

  try {
    const response = await fetch(`${url}/products/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    console.log('API response data for product:', data)

    // Handle the API response format
    if (data && data.success && data.data) {
      return data.data
    } else if (data && !data.success) {
      throw new Error(data.message || 'Product not found')
    } else {
      return data
    }
  } catch (error) {
    console.error('❌ Failed to fetch product by ID:', error)

    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error('Network error: Unable to connect to the server.')
    }

    throw error
  }
}

// Create a new product
export const createProduct = async (
  productData: TProductCreate | FormData,
): Promise<TProduct> => {
  let options: RequestInit = { method: 'POST' }

  if (productData instanceof FormData) {
    options.body = productData
    // Do not set Content-Type header; browser will handle it
  } else {
    options.body = JSON.stringify(productData)
    options.headers = { 'Content-Type': 'application/json' }
  }

  const response = await authenticatedFetch(`${url}/products`, options)
  await handleResponseApi(response)
  const data = await response.json()

  if (data && data.data) {
    return data.data
  }
  return data
}

// Update a product
export const updateProduct = async (
  id: number | string,
  productData: Partial<TProduct>,
): Promise<TProduct> => {
  const response = await authenticatedFetch(`${url}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  })
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (data && data.data) {
    return data.data
  }
  return data
}

// Delete a product
export const deleteProduct = async (id: number | string): Promise<void> => {
  const response = await authenticatedFetch(`${url}/products/${id}`, {
    method: 'DELETE',
  })
  await handleResponseApi(response)
  const data = await response.json()
  return data
}

// Get products by category
export const getProductsByCategory = async (
  category: string,
): Promise<TProduct[]> => {
  const response = await authenticatedFetch(
    `${url}/products/category/${category}`,
  )
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (Array.isArray(data)) {
    return data
  } else if (data && Array.isArray(data.data)) {
    return data.data
  } else if (data && Array.isArray(data.products)) {
    return data.products
  }
  return data
}

// Search products by name
export const searchProductsByName = async (
  name: string,
): Promise<TProduct[]> => {
  const response = await authenticatedFetch(
    `${url}/products/search?name=${encodeURIComponent(name)}`,
  )
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (Array.isArray(data)) {
    return data
  } else if (data && Array.isArray(data.data)) {
    return data.data
  } else if (data && Array.isArray(data.products)) {
    return data.products
  }
  return data
}

// Get products by price range
export const getProductsByPriceRange = async (
  minPrice: number,
  maxPrice: number,
): Promise<TProduct[]> => {
  const response = await authenticatedFetch(
    `${url}/products/price-range?min=${minPrice}&max=${maxPrice}`,
  )
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (Array.isArray(data)) {
    return data
  } else if (data && Array.isArray(data.data)) {
    return data.data
  } else if (data && Array.isArray(data.products)) {
    return data.products
  }
  return data
}

// Update product stock
export const updateProductStock = async (
  id: number | string,
  stock_quantity: number,
): Promise<TProduct> => {
  const response = await authenticatedFetch(`${url}/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock_quantity }),
  })
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (data && data.data) {
    return data.data
  }
  return data
}

// Update product status (in stock/out of stock)
export const updateProductStatus = async (
  id: number | string,
  inStock: boolean,
): Promise<TProduct> => {
  const response = await authenticatedFetch(`${url}/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ inStock }),
  })
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (data && data.data) {
    return data.data
  }
  return data
}

// Get products with low stock
export const getLowStockProducts = async (
  threshold: number = 10,
): Promise<TProduct[]> => {
  const response = await authenticatedFetch(
    `${url}/products/low-stock?threshold=${threshold}`,
  )
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (Array.isArray(data)) {
    return data
  } else if (data && Array.isArray(data.data)) {
    return data.data
  } else if (data && Array.isArray(data.products)) {
    return data.products
  }
  return data
}

// Get featured products
export const getFeaturedProducts = async (): Promise<TProduct[]> => {
  const response = await authenticatedFetch(`${url}/products/featured`)
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (Array.isArray(data)) {
    return data
  } else if (data && Array.isArray(data.data)) {
    return data.data
  } else if (data && Array.isArray(data.products)) {
    return data.products
  }
  return data
}
