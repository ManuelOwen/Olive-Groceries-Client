import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore';
import { useDriverDeliveries, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { useEffect, useState } from 'react';
import type { TOrders } from '@/interfaces/orderInterface';

export const Route = createFileRoute('/driver/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuthStore();
  const driverId = user?.id;
  const isDriverIdValid = typeof driverId === 'string' || typeof driverId === 'number';
  const { isLoading, isError, error } = useDriverDeliveries(isDriverIdValid ? driverId : '');
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [driverOrders, setDriverOrders] = useState<TOrders[]>([]);

  useEffect(() => {
    // Fetch user from local storage
    const userStr = localStorage.getItem('auth');
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr).user : null;
    } catch (e) {
      user = null;
    }
    if (user && user.role === 'driver') {
      // Fetch all orders from local storage (simulate API or use actual API if available)
      const ordersStr = localStorage.getItem('orders');
      let orders: TOrders[] = [];
      try {
        orders = ordersStr ? JSON.parse(ordersStr) : [];
      } catch (e) {
        orders = [];
      }
      // Filter orders assigned to this driver
      const assignedOrders = orders.filter((order: any) => order.assigned_driver_id === user.id);
      setDriverOrders(assignedOrders);
    }
  }, []);

  // Group orders by status
  const toDeliver = driverOrders.filter((order: TOrders) => order.status !== 'delivered' && order.status !== 'cancelled');
  const delivered = driverOrders.filter((order: TOrders) => order.status === 'delivered');
  const existing = driverOrders; // All orders

  const handleEdit = (order: TOrders) => {
    setEditId(order.id);
    setEditForm({
      status: order.status,
      shipping_address: order.shipping_address,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = (id: number) => {
    updateOrder.mutate({ id: String(id), order: editForm });
    setEditId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder.mutate(String(id));
    }
  };

  if (isLoading) return <div className="p-6">Loading orders...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {error?.message || 'Failed to load orders.'}</div>;

  const renderOrderCard = (order: TOrders) => (
    <div key={order.id} className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-bold">Order #</span> {order.order_number}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Shipping Address:</span> {editId === order.id ? (
          <input
            type="text"
            name="shipping_address"
            value={editForm.shipping_address}
            onChange={handleEditChange}
            className="border rounded px-2 py-1 ml-2"
          />
        ) : (
          order.shipping_address
        )}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Total Amount:</span> ${order.total_amount}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Created At:</span> {new Date(order.created_at).toLocaleString()}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Priority:</span> {order.priority}
      </div>
      <div className="flex space-x-2 mt-2">
        {editId === order.id ? (
          <>
            <select
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              className="border rounded px-2 py-1"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => handleEditSave(order.id)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              disabled={updateOrder.isPending}
            >
              Save
            </button>
            <button
              onClick={() => setEditId(null)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleEdit(order)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(order.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={deleteOrder.isPending}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Orders To Deliver</h2>
        {toDeliver.length === 0 ? <div className="text-gray-500">No orders to deliver.</div> : toDeliver.map(renderOrderCard)}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Delivered Orders</h2>
        {delivered.length === 0 ? <div className="text-gray-500">No delivered orders.</div> : delivered.map(renderOrderCard)}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">All Orders</h2>
        {existing.length === 0 ? <div className="text-gray-500">No orders found.</div> : existing.map(renderOrderCard)}
      </div>
    </div>
  );
}
    
   
