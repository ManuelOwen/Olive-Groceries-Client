import React, { useEffect, useState } from 'react'
import PaystackDemoButton from './PaystackDemoButton'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { createOrder } from '@/api/orders'
import { OrderStatus } from '@/interfaces/orderInterface'
import { createPayment } from '@/api/payments'

const PaystackPaymentPage: React.FC = () => {
  const [location, setLocation] = useState<any>(null)
  const items = useCartStore((state) => state.items)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const stored = localStorage.getItem('selectedLocation')
    if (stored) {
      setLocation(JSON.parse(stored))
    }
  }, [])

  const handlePaymentSuccess = async (transaction: any) => {
    // Check if user is authenticated
    if (!user || !user.id || !user.email) {
      alert('You must be logged in to place an order.');
      window.location.href = '/login'; // Redirect to login page
      return;
    }
    // Prepare order data
    const orderData = {
      user_id: user?.id,
      items: items.map(item => ({
        id: item.id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      total_amount: total,
      status: OrderStatus.CONFIRMED,
      shipping_address: location?.shippingAddress || '',
    }
    try {
      const order = await createOrder(orderData as any)
      // Now create payment record with correct fields
      await createPayment({
        user_id: user?.id,
        amount: total,
        payment_method: 'card', // Use 'card' for Paystack
        email: user?.email,
        reference_number: transaction.reference,
        order_id: order.id,
        status: 'completed',
      })
      clearCart()
      alert('Payment complete! Reference: ' + transaction.reference + '\nOrder confirmed, payment recorded, and cart cleared.')
      // Optionally, redirect or show a success page here
    } catch (err: any) {
      // Check for 403 Forbidden error
      if (err?.message?.includes('403') || err?.message?.toLowerCase().includes('forbidden')) {
        alert('You are not authorized to create an order. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
      } else {
        alert('Order created, but payment record failed. Please contact support.');
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Payment</h2>
      {location && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Delivery Details</h3>
          {user && (
            <>
              <p className="text-gray-700">Full Name: <span className="font-bold">{user.fullName || '-'}</span></p>
              <p className="text-gray-700">Email: <span className="font-bold">{user.email || '-'}</span></p>
              <p className="text-gray-700">Phone: <span className="font-bold">{user.phoneNumber || '-'}</span></p>
            </>
          )}
          <p className="text-gray-700">County: <span className="font-bold">{location.county}</span></p>
          <p className="text-gray-700">Locality: <span className="font-bold">{location.locality}</span></p>
          <p className="text-gray-700">Area: <span className="font-bold">{location.area}</span></p>
          <p className="text-gray-700">Shipping Address: <span className="font-bold">{location.shippingAddress}</span></p>
        </div>
      )}
      <div className="mb-8 text-center">
        <p className="text-lg font-semibold text-gray-800 mb-2">Amount to Pay:</p>
        <p className="text-2xl font-bold text-green-600 mb-4">KSH {total}</p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            onClick={() => window.history.back()}
          >
            Back
          </button>
          <PaystackDemoButton email={user?.email || ''} amount={total} onSuccess={handlePaymentSuccess} />
        </div>
      </div>
    </div>
  )
}

export default PaystackPaymentPage 