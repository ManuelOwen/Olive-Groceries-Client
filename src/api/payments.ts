import { useAuthStore } from '@/stores/authStore'

export const createPayment = async (paymentData: any) => {
  // Get the token from the auth store
  const token = useAuthStore.getState().token
  const response = await fetch('https://groceries-api-m1sq.onrender.com/api/v1/payments', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
    body: JSON.stringify(paymentData),
  });
if (!response.ok) throw new Error('Failed to create payment');
return response.json();
}; 