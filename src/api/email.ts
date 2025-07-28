import { authenticatedFetch } from '@/lib/utils'

export interface OrderConfirmationEmailData {
  userEmail: string
  userName: string
  orderNumber: string
  orderItems: Array<{
    product_name: string
    price: number
    quantity: number
  }>
  totalAmount: number
  shippingAddress: string
  estimatedDeliveryTime: string
}

export const sendOrderConfirmationEmail = async (emailData: OrderConfirmationEmailData) => {
  const response = await authenticatedFetch('https://groceries-api-m1sq.onrender.com/api/v1/email/order-confirmation', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
  },
    body: JSON.stringify(emailData),
  })

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'Failed to send order confirmation email')
}

return response.json()
}

export const sendPaymentConfirmationEmail = async (emailData: {
  userEmail: string
  userName: string
  orderNumber: string
  paymentReference: string
  totalAmount: number
  estimatedDeliveryTime: string
}) => {
  const response = await authenticatedFetch('https://groceries-api-m1sq.onrender.com/api/v1/email/payment-confirmation', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
  },
    body: JSON.stringify(emailData),
  })

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'Failed to send payment confirmation email')
}

return response.json()
} 