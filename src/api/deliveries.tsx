import type { TOrders } from '@/interfaces/orderInterface'
import { authenticatedFetch } from '@/lib/utils'

const url = '/api/v1'

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
export const getAllDeliveriesWithoutAuth = async (): Promise<TOrders[]> => {
  console.log('Making unauthenticated request to deliveries API...')
  console.log('URL:', `${url}/deliveries`)

  try {
    const response = await fetch(`${url}/deliveries`)
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
        console.log('Extracting deliveries from data property')
        return data.data
      } else if (data && Array.isArray(data.deliveries)) {
        // If the API returns { deliveries: [...] }
        return data.deliveries
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

// Get all deliveries
export const getAllDeliveries = async (): Promise<TOrders[]> => {
  const response = await authenticatedFetch(`${url}/deliveries`)
  await handleResponseApi(response)
  return response.json()
}

// Get delivery by delivery id
export const getDeliveryById = async (
  id: number | string,
): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}`)
  await handleResponseApi(response)
  return response.json()
}

// Create a new delivery
export const createDelivery = async (
  deliveryData: TOrders,
): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/deliveries`, {
    method: 'POST',
    body: JSON.stringify(deliveryData),
  })
  await handleResponseApi(response)
  return response.json()
}

// Update a delivery
export const updateDelivery = async (
  id: number | string,
  deliveryData: Partial<TOrders>,
): Promise<TOrders> => {
  const { id: _id, user, ...deliveryDataClean } = deliveryData

  // Guaranteed removal of forbidden fields
  const { shipped_at, delivered_at, ...safeDeliveryData } = deliveryDataClean
  console.log(
    '[UpdateDelivery] Final payload sent to backend:',
    safeDeliveryData,
  )

  // Validate status and priority for deliveries
  const validStatuses = [
    'pending',
    'assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'failed',
    'cancelled',
  ]
  const validPriorities = ['low', 'normal', 'high', 'urgent']

  if (
    safeDeliveryData.status &&
    !validStatuses.includes(safeDeliveryData.status)
  ) {
    throw new Error(`Invalid delivery status: ${safeDeliveryData.status}`)
  }
  if (
    safeDeliveryData.priority &&
    !validPriorities.includes(safeDeliveryData.priority)
  ) {
    throw new Error(`Invalid priority: ${safeDeliveryData.priority}`)
  }

  // Debug: Get token from store
  const { getToken } = await import('@/stores/authStore')
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('[UpdateDelivery] Using token:', token)
  } else {
    console.warn('[UpdateDelivery] No token found in store!')
  }
  console.log('[UpdateDelivery] Headers:', headers)

  const response = await fetch(`${url}/deliveries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(safeDeliveryData),
  })
  await handleResponseApi(response)
  return response.json()
}

// Delete a delivery
export const deleteDelivery = async (id: number | string): Promise<void> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}`, {
    method: 'DELETE',
  })
  await handleResponseApi(response)
  return response.json()
}

// Get deliveries by driver id
export const getDeliveriesByDriverId = async (
  driverId: number | string,
): Promise<TOrders[]> => {
  const response = await authenticatedFetch(
    `${url}/drivers/${driverId}/deliveries`,
  )
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (data && data.success && Array.isArray(data.data)) {
    return data.data
  }
  return data
}

// Get deliveries by status
export const getDeliveriesByStatus = async (
  status: string,
): Promise<TOrders[]> => {
  const response = await authenticatedFetch(
    `${url}/deliveries/status/${status}`,
  )
  await handleResponseApi(response)
  return response.json()
}

// Get deliveries by priority
export const getDeliveriesByPriority = async (
  priority: string,
): Promise<TOrders[]> => {
  const response = await authenticatedFetch(
    `${url}/deliveries/priority/${priority}`,
  )
  await handleResponseApi(response)
  return response.json()
}

// Get deliveries by user/customer id
export const getDeliveriesByUserId = async (
  userId: number | string,
): Promise<TOrders[]> => {
  const response = await authenticatedFetch(`${url}/deliveries/user/${userId}`)
  await handleResponseApi(response)
  return response.json()
}

// Assign delivery to a driver
export const assignDeliveryToDriver = async (
  deliveryId: number | string,
  driverId: number | string,
): Promise<TOrders> => {
  const response = await authenticatedFetch(
    `${url}/deliveries/${deliveryId}/assign`,
    {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    },
  )
  await handleResponseApi(response)
  return response.json()
}

// Mark delivery as picked up
export const markDeliveryAsPickedUp = async (
  id: number | string,
): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}/pickup`, {
    method: 'PUT',
  })
  await handleResponseApi(response)
  return response.json()
}

// Mark delivery as in transit
export const markDeliveryAsInTransit = async (
  id: number | string,
): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}/transit`, {
    method: 'PUT',
  })
  await handleResponseApi(response)
  return response.json()
}

// Mark delivery as delivered
export const markDeliveryAsDelivered = async (
  id: number | string,
  deliveryNote?: string,
): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}/deliver`, {
    method: 'PUT',
    body: JSON.stringify({ deliveryNote }),
  })
  await handleResponseApi(response)
  return response.json()
}

// Mark delivery as failed
export const markDeliveryAsFailed = async (
  id: number | string,
  failureReason: string,
): Promise<TOrders> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}/fail`, {
    method: 'PUT',
    body: JSON.stringify({ failureReason }),
  })
  await handleResponseApi(response)
  return response.json()
}

// Get delivery route/directions
export const getDeliveryRoute = async (id: number | string): Promise<any> => {
  const response = await authenticatedFetch(`${url}/deliveries/${id}/route`)
  await handleResponseApi(response)
  return response.json()
}

// Update delivery location (GPS tracking)
export const updateDeliveryLocation = async (
  id: number | string,
  latitude: number,
  longitude: number,
): Promise<TOrders> => {
  const response = await authenticatedFetch(
    `${url}/deliveries/${id}/location`,
    {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    },
  )
  await handleResponseApi(response)
  return response.json()
}

// Get active deliveries for a driver (currently assigned and in progress)
export const getActiveDeliveriesForDriver = async (
  driverId: number | string,
): Promise<TOrders[]> => {
  const response = await authenticatedFetch(
    `${url}/drivers/${driverId}/deliveries/active`,
  )
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (data && data.success && Array.isArray(data.data)) {
    return data.data
  }
  return data
}

// Get completed deliveries for a driver
export const getCompletedDeliveriesForDriver = async (
  driverId: number | string,
  dateFrom?: string,
  dateTo?: string,
): Promise<TOrders[]> => {
  let endpoint = `${url}/drivers/${driverId}/deliveries/completed`

  if (dateFrom || dateTo) {
    const params = new URLSearchParams()
    if (dateFrom) params.append('from', dateFrom)
    if (dateTo) params.append('to', dateTo)
    endpoint += `?${params.toString()}`
  }

  const response = await authenticatedFetch(endpoint)
  await handleResponseApi(response)
  const data = await response.json()

  // Handle wrapped response format
  if (data && data.success && Array.isArray(data.data)) {
    return data.data
  }
  return data
}
