import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'

import type { TOrders } from '@/interfaces/orderInterface'
import { getOrdersByUserId } from '@/api/orders'
import { useState } from 'react'
import type { CartItem } from '@/stores/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import modalBg from '@/images/bg.jpeg'
import {  getDriverForOrder } from '@/api/users'
import { useEffect } from 'react'

export const Route = createFileRoute('/user/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, token } = useAuthStore()
  const userId = user?.id as string | number | undefined
  const [selectedOrder, setSelectedOrder] = useState<TOrders | null>(null)
  const [driverInfo, setDriverInfo] = useState<any>(null)

  console.log('RouteComponent user/token:', { user, token, userId }) // Debug log

  // Fetch all orders for the user using shared API utility
  const { data: orders = [], isLoading: ordersLoading } = useQuery<TOrders[]>({
    queryKey: ['userOrders', userId],
    queryFn: () => (userId ? getOrdersByUserId(userId) : Promise.resolve([])),
    enabled: !!userId,
  })

  // Fetch driver info when selectedOrder changes and has assigned_driver_id
  useEffect(() => {
    if (selectedOrder && selectedOrder.assigned_driver_id) {
      console.log('Fetching driver info for driver ID:', selectedOrder.assigned_driver_id, 'order ID:', selectedOrder.id)
      // Fallback to API call
      const driverId = selectedOrder.assigned_driver_id
      getDriverForOrder(driverId, selectedOrder.id)
        .then((response) => {
          console.log('Driver info response:', response)
          if (response.success && response.data) {
            setDriverInfo(response.data)
          } else if (response && typeof response === 'object') {
            // Handle case where response might be the driver data directly
            setDriverInfo(response)
          } else {
            console.log('No driver data in response')
            setDriverInfo(null)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch driver info:', error)
          setDriverInfo(null)
        })
    } else {
      setDriverInfo(null)
    }
  }, [selectedOrder])

  // Helper functions for item details
  const getProductName = (item: CartItem) => {
    if (!item) return 'Unknown Product'
    console.log('Processing item for name:', item)
    return item.product_name || 'Unknown Product'
  }

  const getPrice = (item: CartItem) => {
    if (!item) return 0
    console.log('Processing item for price:', item)
    const price =
      typeof item.price === 'string' ? parseFloat(item.price) : item.price
    return isNaN(price) ? 0 : price
  }

  const getQuantity = (item: CartItem) => {
    if (!item) return 1
    console.log('Processing item for quantity:', item)
    return item.quantity || 1
  }

  // Get shipping address from user profile if not set in order
  const getShippingAddress = (order: TOrders) => {
    if (order.shipping_address && order.shipping_address.trim() !== '') {
      return order.shipping_address
    }
    // Fallback to user's address from profile
    return user?.address || 'No address provided'
  }

  // Format currency
  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return 'KSH 0.00'
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(numericAmount) ? 'KSH 0.00' : `KSH ${numericAmount.toFixed(2)}`
  }

  // Debug: Log the orders data
  console.log('Orders data:', orders)
  if (selectedOrder) {
    console.log('Selected order:', selectedOrder)
    console.log('Selected order items:', selectedOrder.items)
    console.log('Selected order assigned_driver_id:', selectedOrder.assigned_driver_id)
    console.log('Current driver info state:', driverInfo)
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {(!userId || !token) && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          You must be logged in to view your orders.
        </div>
      )}
      {ordersLoading ? (
        <p>Loading orders...</p>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                  Order Number #
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-b">
                    {order.order_number || order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 border-b">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize border-b">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 border-b">
                    KSH {order.total_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No orders found</p>
      )}

      {/* Order Details Modal/Section */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: `url(${modalBg}) center center / cover no-repeat`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative border-2 border-orange-400"
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Order Details (#{selectedOrder.order_number || selectedOrder.id}
                )
              </h2>

              {/* Order Status */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedOrder.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {/* Order Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Shipping Address:</span>
                  <p className="mt-1 font-medium">
                    {getShippingAddress(selectedOrder)}
                  </p>
                </div>
              </div>

              {/* Assigned Driver Info (always show section) */}
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-600 mb-2">
                  Assigned Driver
                </h4>
                {selectedOrder.assigned_driver_id ? (
                  driverInfo ? (
                    <>
                      <div className="text-gray-800">
                        Name:{' '}
                        <span className="font-bold">
                          {driverInfo.fullName || driverInfo.name || driverInfo.email || 'N/A'}
                        </span>
                      </div>
                      <div className="text-gray-800">
                        Phone:{' '}
                        <span className="font-bold">
                          {driverInfo.phoneNumber || driverInfo.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="text-gray-800">
                        Email:{' '}
                        <span className="font-bold">{driverInfo.email || 'N/A'}</span>
                      </div>
                      {/* Debug info - remove in production */}
                      <div className="text-xs text-gray-500 mt-2">
                        Driver ID: {selectedOrder.assigned_driver_id}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">Loading driver information...</div>
                  )
                ) : (
                  <div className="text-gray-500">No driver assigned yet.</div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">
                  Items in this Order:
                </h3>
                {(() => {
                  // Get items from the order
                  let orderItems: CartItem[] = []

                  try {
                    // Try to parse items if they're stored as a string
                    if (typeof selectedOrder.items === 'string') {
                      orderItems = JSON.parse(selectedOrder.items)
                    }
                    // If items is already an array
                    else if (Array.isArray(selectedOrder.items)) {
                      orderItems = selectedOrder.items
                    }

                    console.log('Parsed order items:', orderItems)
                  } catch (error) {
                    console.error('Error parsing order items:', error)
                  }

                  if (orderItems && orderItems.length > 0) {
                    return (
                      <div className="divide-y divide-gray-200">
                        {orderItems.map((item: CartItem, idx: number) => {
                          console.log(`Processing order item ${idx}:`, item)

                          const itemPrice = getPrice(item)
                          const itemQuantity = getQuantity(item)
                          const totalPrice = itemPrice * itemQuantity
                          const unitPrice = itemQuantity > 0 ? itemPrice : 0

                          return (
                            <div key={`order-item-${idx}`} className="py-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {getProductName(item)}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {itemQuantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">
                                    {formatCurrency(totalPrice)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    per unit: {formatCurrency(unitPrice)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  } else {
                    return (
                      <p className="text-gray-500">
                        No items found in this order.
                      </p>
                    )
                  }
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
