import { createFileRoute } from '@tanstack/react-router'
import PaystackPaymentPage from '@/payment/paystack/PaystackPaymentPage'

export const Route = createFileRoute('/payment/paystack')({
  component: PaystackPaymentPage,
}) 