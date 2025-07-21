import { createFileRoute } from '@tanstack/react-router'
import { useDriverDeliveries, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export const Route = createFileRoute('/driver/orders')({
  component: OrdersComponent,
})

function OrdersComponent() {
  const { user } = useAuthStore();
  const driverId = user?.id;
  const isDriverIdValid = typeof driverId === 'string' || typeof driverId === 'number';
  const { data: deliveries = [], isLoading, isError, error } = useDriverDeliveries(isDriverIdValid ? driverId : '');
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Debug logs
  console.log('Driver ID:', driverId);
  console.log('Orders:', deliveries);
  console.log('Loading:', isLoading, 'Error:', isError, 'ErrorMsg:', error);

  if (!isDriverIdValid) return <div>Driver not found.</div>;
  if (isLoading) return <div>Loading orders...</div>;
  if (isError) return <div>Error: {error?.message || 'Failed to load orders.'}</div>;

  const handleEdit = (delivery: any) => {
    setEditId(delivery.id);
    setEditForm({
      status: delivery.status,
      shipping_address: delivery.shipping_address,
    
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2">Order #</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Shipping Address</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No orders found.
              </td>
            </tr>
          ) : (
            deliveries.map((delivery: any) => (
              <tr key={delivery.id} className="border-t">
                <td className="px-4 py-2">{delivery.order_number}</td>
                <td className="px-4 py-2">
                  {editId === delivery.id ? (
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
                  ) : (
                    delivery.status
                  )}
                </td>
                <td className="px-4 py-2">
                  {editId === delivery.id ? (
                    <input
                      type="text"
                      name="shipping_address"
                      value={editForm.shipping_address}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    delivery.shipping_address
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  {editId === delivery.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(delivery.id)}
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
                        onClick={() => handleEdit(delivery)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(delivery.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        disabled={deleteOrder.isPending}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
