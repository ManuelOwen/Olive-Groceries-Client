import { createFileRoute } from '@tanstack/react-router'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';
// import { SidebarDashboard } from '@/components/sidebar'
// import { AdminSidebar } from '@/components/Admin/adminSidebar'
// import { UserSidebar } from '@/components/user/userSidebar'
// import { DriverSidebar } from '@/components/drivers/driverDasboard'
// import { isAdmin, isUser, isDriver } from '@/stores/authStore'
import { LogoutButton } from '@/components/LogoutButton'
import {
  Bell,
  Search,
  ShoppingCart,
  Star,
  Heart,
} from 'lucide-react'
import { productService } from '@/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  console.log('ProductsPage component is rendering');
  const { data: products, isLoading, isError, error } = productService();

  // Debug: Log products data to inspect image property
  console.log('Fetched products:', products);

  // Function to get page title based on user role
  // (Optional: you can keep this or hardcode 'Products')
  const getPageTitle = () => 'Products';

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (isError) {
    return <div>Error loading products: {error?.message}</div>;
  }

  return (
    <LayoutWithSidebar>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Products</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <LogoutButton />
        </div>
      </header>
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {/* Products Grid with animation */}
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            key="products-grid"
          >
            {products && products.length > 0 ? (
              products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow"
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 30 }}
                  transition={{ delay: idx * 0.07, duration: 0.4, type: 'spring', stiffness: 80 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: '0 12px 32px rgba(34,197,94,0.18)',
                    zIndex: 2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  layout
                >
                  <div className="relative">
                    <motion.img
                      src={product.imageUrl || product.image}
                      alt={product.product_name}
                      className="w-full h-48 object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    />
                    <div className="absolute top-2 right-2">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Heart size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">{product.category}</span>
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{product.product_name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                      <button 
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                      >
                        <div className="flex items-center">
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                No products found.
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </LayoutWithSidebar>
  );
}
