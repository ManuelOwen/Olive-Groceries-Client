import type { TOrders } from '@/interfaces/orderInterface'
import { authenticatedFetch } from '@/lib/utils'

const url = '/api/v1'
export const getOrdersByUserId = async (
  userId: number | string,
): Promise<TOrders[]> => {
  console.log('[getOrdersByUserId] Fetching orders for user ID:', userId)

  // Get current user data to check permissions
  const { getUserData } = await import('@/lib/utils')
  const currentUser = getUserData()
  console.log('[getOrdersByUserId] Current user:', currentUser)
  console.log(
    '[getOrdersByUserId] Current user ID type:',
    typeof currentUser?.id,
  )
  console.log('[getOrdersByUserId] Requested user ID type:', typeof userId)

  // Convert both IDs to numbers for comparison
  const currentUserId = Number(currentUser?.id)
  const requestedUserId = Number(userId)

  console.log('[getOrdersByUserId] Current user ID (number):', currentUserId)
  console.log(
    '[getOrdersByUserId] Requested user ID (number):',
    requestedUserId,
  )
  console.log('[getOrdersByUserId] User role:', currentUser?.role)

  // Check if user is requesting their own orders or is admin
  if (
    currentUser &&
    currentUser.role !== 'admin' &&
    currentUserId !== requestedUserId
  ) {
    console.warn(
      '[getOrdersByUserId] User trying to access another users orders',
    )
    console.warn('[getOrdersByUserId] Permission denied:', {
      currentUserId,
      requestedUserId,
      role: currentUser.role,
      isAdmin: currentUser.role === 'admin',
      isOwnOrders: currentUserId === requestedUserId,
    })
    throw new Error("Unauthorized: Cannot access other user's orders")
  }

  try {
    const response = await authenticatedFetch(`${url}/orders/user/${userId}`)
    console.log('[getOrdersByUserId] Response status:', response.status)
    console.log(
      '[getOrdersByUserId] Response headers:',
      Object.fromEntries(response.headers.entries()),
    )

    if (response.status === 403) {
      console.error(
        '[getOrdersByUserId] 403 Forbidden - Check user permissions',
      )
      console.error('[getOrdersByUserId] User details:', {
        id: currentUserId,
        role: currentUser?.role,
        requestedUserId,
      })

      // Try to get the error details from the response
      try {
        const errorData = await response.json()
        console.error('[getOrdersByUserId] Backend error response:', errorData)
        throw new Error(
          `Access denied: ${errorData.message || 'You do not have permission to view these orders'}`,
        )
      } catch (parseError) {
        throw new Error(
          'Access denied: You do not have permission to view these orders',
        )
      }
    }

    await handleResponseApi(response)
    const data = await response.json()
    console.log('[getOrdersByUserId] Successfully fetched orders:', data)

    // Handle different response formats
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        return data
      } else if (data.data && Array.isArray(data.data)) {
        return data.data
      } else if (data.success && data.data && Array.isArray(data.data)) {
        return data.data
      }
    }

    console.warn('[getOrdersByUserId] Unexpected data format:', data)
    return []
  } catch (error) {
    console.error('[getOrdersByUserId] Error fetching orders:', error)
    throw error
  }
}
// helper functions
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
export const getAllOrdersWithoutAuth = async (): Promise<TOrders[]> => {
  console.log('Making unauthenticated request to orders API...')
  console.log('URL:', `${url}/orders`)

  try {
    const response = await fetch(`${url}/orders`)
    console.log('Response status:', response.status)
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries()),
    )

    const responseText = await response.text()
    console.log('Response text:', responseText)

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText)
      console.error('Response body:', responseText)
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      )
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText)
      console.log('Parsed response data:', data)

      // Check if data is an array (direct response)
      if (Array.isArray(data)) {
        return data
      } else if (data && Array.isArray(data.data)) {
        // If the API returns { success: true, message: "...", data: [...] }
        console.log('Extracting orders from data property')
        return data.data
      } else if (data && Array.isArray(data.orders)) {
        // If the API returns { orders: [...] }
        return data.orders
      } else {
        console.error('Unexpected data format:', data)
        throw new Error('API returned unexpected data format')
      }
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError)
      throw new Error('Invalid JSON response from API')
    }
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
}

//  get all orders
export const getAllOrders = async (): Promise<TOrders[]> => {
  const response = await authenticatedFetch(`${url}/orders`)
  await handleResponseApi(response)
  return response.json()
}
// get order by order id
export const getOrderById = async (id: number | string): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/orders/${id}`)
  await handleResponseApi(response)
  return response.json()
}
// create a new order
export const createOrder = async (orderData: TOrders): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/orders`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
  await handleResponseApi(response)
  return response.json()
}
// update an order
export const updateOrder = async (
  id: number | string,
  orderData: Partial<TOrders>,
): Promise<TOrders> => {
  const { id: _id, user, ...orderDataClean } = orderData

  // Guaranteed removal of forbidden fields
  const { shipped_at, delivered_at, ...safeOrderData } = orderDataClean
  console.log('[UpdateOrder] Final payload sent to backend:', safeOrderData)

  // Validate status and priority
  const validStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]
  const validPriorities = ['low', 'normal', 'high', 'urgent']

  if (safeOrderData.status && !validStatuses.includes(safeOrderData.status)) {
    throw new Error(`Invalid status: ${safeOrderData.status}`)
  }
  if (
    safeOrderData.priority &&
    !validPriorities.includes(safeOrderData.priority)
  ) {
    throw new Error(`Invalid priority: ${safeOrderData.priority}`)
  }

  // Debug: Get token from store
  const { getToken } = await import('@/stores/authStore')
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('[UpdateOrder] Using token:', token)
  } else {
    console.warn('[UpdateOrder] No token found in store!')
  }
  console.log('[UpdateOrder] Headers:', headers)

  const response = await fetch(`${url}/orders/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(safeOrderData),
  })
  await handleResponseApi(response)
  return response.json()
}
// delete an order
export const deleteOrder = async (id: number | string): Promise<void> => {
  const response = await authenticatedFetch(`${url}/orders/${id}`, {
    method: 'DELETE',
  })
  await handleResponseApi(response)
  return response.json()
}
// get orders by status
export const getOrdersByStatus = async (status: string): Promise<TOrders[]> => {
  const response = await authenticatedFetch(`${url}/orders/status/${status}`)
  await handleResponseApi(response)
  return response.json()
}
// get orders by priority
export const getOrdersByPriority = async (
  priority: number,
): Promise<TOrders[]> => {
  const response = await authenticatedFetch(
    `${url}/orders/priority/${priority}`,
  )
  await handleResponseApi(response)
  return response.json()
}

// Fetch deliveries assigned to a driver
export const getDeliveriesByDriverId = async (user_id: number | string) => {
  const response = await authenticatedFetch(`/api/v1/orders/user/${user_id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch deliveries')
  }
  const data = await response.json()
  // Handle wrapped response format
  if (data && data.success && Array.isArray(data.data)) {
    return data.data
  }
  return data
}
