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
      <h2 className="text-2xl font-bold mb-4 text-orange-600">My Orders</h2>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-orange-100 to-orange-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider border-b">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider border-b">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider border-b">Shipping Address</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500 bg-orange-50">
                  No orders found.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery: any, idx: number) => (
                <tr key={delivery.id} className={idx % 2 === 0 ? 'bg-orange-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-b">{delivery.order_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${delivery.status === 'pending' ? 'bg-orange-300 text-yellow-800' : delivery.status === 'delivered' ? 'bg-orange-300 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>{delivery.status}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">
                    {editId === delivery.id ? (
                      <input
                        type="text"
                        name="shipping_address"
                        value={editForm.shipping_address}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-700">{delivery.shipping_address}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b space-x-2">
                    {editId === delivery.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(delivery.id)}
                          className="bg-orange-300 text-white px-3 py-1 rounded hover:bg-orange-400"
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
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(delivery.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-orange-600"
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
    </div>
  );
}
