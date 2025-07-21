import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/components/api/url';
import { OrderStatus } from '@/interfaces/orderInterface';
import type { TOrders } from '@/interfaces/orderInterface';

interface Payment {
  id: number | string;
  amount: number;
  payment_method: string;
  created_at?: string;
}

function fetchUserOrders(userId: string | number, token: string): Promise<TOrders[]> {
  return fetch(`${API_URL}/orders/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => (Array.isArray(data) ? data : data.data || []));
}

function fetchUserPayments(userId: string | number, token: string): Promise<Payment[]> {
  return fetch(`${API_URL}/payments/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => (Array.isArray(data) ? data : data.data || []));
}

export const Route = createFileRoute('/user/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, token } = useAuthStore();
  const userId = user?.id as string | number | undefined;

  // Fetch all orders for the user
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery<TOrders[]>({
    queryKey: ['userOrders', userId],
    queryFn: () => fetchUserOrders(userId as string | number, token as string),
    enabled: !!userId && !!token,
  });

  // Fetch all payments for the user
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery<Payment[]>({
    queryKey: ['userPayments', userId],
    queryFn: () => fetchUserPayments(userId as string | number, token as string),
    enabled: !!userId && !!token,
  });

  // Pending orders = cart
  const pendingOrders = orders.filter((order: TOrders) => order.status === OrderStatus.PENDING);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Cart (Pending Orders) */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cart (Pending Orders)</h2>
        {ordersLoading ? (
          <p>Loading cart...</p>
        ) : pendingOrders.length > 0 ? (
          <div className="space-y-4">
            {pendingOrders.map((order: TOrders) => (
              <div key={order.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {(order as any).created_at ? new Date((order as any).created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total: KSH {order.total_amount}
                </p>
                {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-700">
                    {order.items.map((item: any, idx: number) => (
                      <li key={item.id + '-' + idx}>
                        {item.product_name} x {item.quantity} (KSH {item.price})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No items in cart</p>
        )}
      </div>

      {/* All Orders */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">All Orders</h2>
        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: TOrders) => (
              <div key={order.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {(order as any).created_at ? new Date((order as any).created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === OrderStatus.PENDING
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === OrderStatus.DELIVERED
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total: KSH {order.total_amount}
                </p>
                {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-700">
                    {order.items.map((item: any, idx: number) => (
                      <li key={item.id + '-' + idx}>
                        {item.product_name} x {item.quantity} (KSH {item.price})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No orders found</p>
        )}
      </div>

      {/* Payments */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payments</h2>
        {paymentsLoading ? (
          <p>Loading payments...</p>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment: Payment) => (
              <div key={payment.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Payment #{payment.id}</p>
                    <p className="text-sm text-gray-600">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <span className="text-green-600 font-semibold">
                    KSH {payment.amount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Method: {payment.payment_method}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No payment history</p>
        )}
      </div>
    </div>
  );
}
  