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
      <div>
        <h2 className="text-xl font-semibold mb-4">Cart (Pending Orders)</h2>
        {ordersLoading ? (
          <p>Loading cart...</p>
        ) : pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map((order: TOrders) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-orange-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-lg text-gray-800">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">{(order as any).created_at ? new Date((order as any).created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Total: <span className="font-bold text-green-600">KSH {order.total_amount}</span></p>
                  {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-700 space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <li key={item.id + '-' + idx} className="flex justify-between items-center">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span className="text-gray-500">KSH {item.price}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center text-gray-500">No items in cart</div>
        )}
      </div>

      {/* All Orders */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Orders</h2>
        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order: TOrders) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-orange-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-lg text-gray-800">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">{(order as any).created_at ? new Date((order as any).created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Total: <span className="font-bold text-green-600">KSH {order.total_amount}</span></p>
                  {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-700 space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <li key={item.id + '-' + idx} className="flex justify-between items-center">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span className="text-gray-500">KSH {item.price}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center text-gray-500">No orders found</div>
        )}
      </div>

      {/* Payments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payments</h2>
        {paymentsLoading ? (
          <p>Loading payments...</p>
        ) : payments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payments.map((payment: Payment) => (
              <div key={payment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-green-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-lg text-gray-800">Payment #{payment.id}</p>
                      <p className="text-xs text-gray-500">{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <span className="text-green-600 font-semibold text-lg">KSH {payment.amount}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Method: <span className="font-medium text-gray-800">{payment.payment_method}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center text-gray-500">No payment history</div>
        )}
      </div>
    </div>
  );
}
  