import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';
import { createFileRoute } from '@tanstack/react-router'
import { useGetUsers } from '@/hooks/useUser';
import { productService } from '@/hooks/useProducts';
import { orderService } from '@/hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { authenticatedFetch } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  // Users
  const { data: usersData, isLoading: usersLoading } = useGetUsers() as { data: any, isLoading: boolean };
  // Fix: Extract users array from API response, handle both array and { data: [...] }
  const users: any[] = Array.isArray(usersData)
    ? usersData
    : (usersData && Array.isArray((usersData as any).data) ? (usersData as any).data : []);
  console.log('Fetched usersData:', usersData);
  console.log('users:', users);
  // Products
  const { data: products = [], isLoading: productsLoading } = productService();
  // Orders
  const { data: orders = [], isLoading: ordersLoading } = orderService();
  // Payments (use authenticatedFetch)
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      try {
        const res = await authenticatedFetch(
          'https://groceries-api-m1sq.onrender.com/api/v1/payments',
        )
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
      } catch {
        return [];
      }
    },
  });
  const payments = Array.isArray(paymentsData) ? paymentsData : [];

  // Calculate total payment amount
  const totalPaymentAmount = payments.reduce((sum: number, payment: any) => sum + (Number(payment.amount) || 0), 0);

  // Users Pie Chart (by role)
  const uniqueRoles = Array.from(new Set(users.map((u: any) => u.role || 'unknown')));
  // Generate a color for each role
  const pieColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#B8DE6F', '#C9CBCF', '#F67019', '#F53794', '#A259F7', '#F7B32B', '#2D82B7', '#F72C25', '#2DF7C7'
  ];
  const roleColorMap: Record<string, string> = uniqueRoles.reduce((acc: Record<string, string>, role: string, idx: number) => {
    acc[role] = pieColors[idx % pieColors.length];
    return acc;
  }, {});

  const userRoles = users.reduce((acc: Record<string, number>, user: any) => {
    const role = user.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const userPieData = {
    labels: Object.keys(userRoles),
    datasets: [
      {
        data: Object.values(userRoles),
        backgroundColor: Object.keys(userRoles).map((role: string) => roleColorMap[role]),
      },
    ],
  };

  // Products Bar Chart (by category)
  const productCategories = products.reduce((acc: Record<string, number>, product) => {
    const cat = product.category || 'unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const productBarData = {
    labels: Object.keys(productCategories),
    datasets: [
      {
        label: 'Products by Category',
        data: Object.values(productCategories),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#B8DE6F', '#C9CBCF', '#F67019', '#F53794'
        ],
      },
    ],
  };

  // Orders Line Chart (by created_at date)
  const orderDates = orders.map(o => o.created_at ? new Date(o.created_at).toLocaleDateString() : 'unknown');
  const orderDateCounts = orderDates.reduce((acc: Record<string, number>, date: string) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const orderLineData = {
    labels: Object.keys(orderDateCounts),
    datasets: [
      {
        label: 'Orders Over Time',
        data: Object.values(orderDateCounts),
        fill: false,
        borderColor: '#36A2EB',
        backgroundColor: '#36A2EB',
        tension: 0.1,
      },
    ],
  };

  // Payments Line Chart (by created_at date)
  const paymentDates = payments.map((p: any) => p.created_at ? new Date(p.created_at).toLocaleDateString() : 'unknown');
  const paymentDateCounts = paymentDates.reduce((acc: Record<string, number>, date: string) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const paymentLineData = {
    labels: Object.keys(paymentDateCounts),
    datasets: [
      {
        label: 'Payments Over Time',
        data: Object.values(paymentDateCounts),
        fill: false,
        borderColor: '#FF6384',
        backgroundColor: '#FF6384',
        tension: 0.1,
      },
    ],
  };

  // Orders vs Payments Line Chart (same date labels)
  const allDatesSet = new Set([...Object.keys(orderDateCounts), ...Object.keys(paymentDateCounts)]);
  const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const ordersOverTime = allDates.map(date => orderDateCounts[date] || 0);
  const paymentsOverTime = allDates.map(date => paymentDateCounts[date] || 0);
  const ordersVsPaymentsLineData = {
    labels: allDates,
    datasets: [
      {
        label: 'Orders',
        data: ordersOverTime,
        fill: false,
        borderColor: '#36A2EB',
        backgroundColor: '#36A2EB',
        tension: 0.1,
      },
      {
        label: 'Payments',
        data: paymentsOverTime,
        fill: false,
        borderColor: '#FF6384',
        backgroundColor: '#FF6384',
        tension: 0.1,
      },
    ],
  };

  // Common chart options
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    responsive: true,
  };

  return (
    <LayoutWithSidebar>
      <div className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Total Users</span>
            <span className="text-3xl font-bold text-blue-600">{users.length}</span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Total Products</span>
            <span className="text-3xl font-bold text-orange-600">{products.length}</span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Total Orders</span>
            <span className="text-3xl font-bold text-green-600">{orders.length}</span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Total Payments</span>
            <span className="text-3xl font-bold text-purple-600">{totalPaymentAmount.toLocaleString(undefined, { style: 'currency', currency: 'KES' }).replace('KSh', 'KSH')}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users by Role */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
            <div className="text-4xl font-bold text-center mb-2 text-blue-600">{users.length}</div>
            <div className="flex-grow relative min-h-[300px]">
              {usersLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
              ) : users.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No user data available.</div>
              ) : (
                <>
                  {userPieData.labels.length === 0 || userPieData.datasets[0].data.every((v: any) => v === 0) ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">Pie chart data is empty or invalid.</div>
                  ) : (
                    <Pie 
                      data={userPieData} 
                      options={chartOptions}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {Object.keys(userRoles).map((role: string) => (
                <div key={role} className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: roleColorMap[role] }}></span>
                  <span className="text-sm">{role} ({userRoles[role]})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Category */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Products by Category</h2>
            <div className="flex-grow relative min-h-[300px]">
              {productsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
              ) : products.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No product data available.</div>
              ) : (
                <Bar 
                  data={productBarData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Orders Over Time */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Orders Over Time</h2>
            <div className="flex-grow relative min-h-[300px]">
              {ordersLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No order data available.</div>
              ) : (
                <Line 
                  data={orderLineData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Payments Over Time */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Payments Over Time</h2>
            <div className="text-4xl font-bold text-center mb-2 text-green-600">{totalPaymentAmount.toLocaleString(undefined, { style: 'currency', currency: 'KES' }).replace('KSh', 'KSH')}</div>
            <div className="flex-grow relative min-h-[300px]">
              {paymentsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
              ) : payments.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No payment data available.</div>
              ) : (
                <Line 
                  data={paymentLineData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Orders vs Payments Over Time */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Orders vs Payments Over Time</h2>
            <div className="flex-grow relative min-h-[300px]">
              {(ordersLoading || paymentsLoading) ? (
                <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
              ) : allDates.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No order or payment data available.</div>
              ) : (
                <Line 
                  data={ordersVsPaymentsLineData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}