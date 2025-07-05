import { createFileRoute } from '@tanstack/react-router'
import { SidebarDashboard } from '@/components/sidebar'
import { AdminSidebar } from '@/components/Admin/adminSidebar'
import { UserSidebar } from '@/components/user/userSidebar'
import { DriverSidebar } from '@/components/drivers/driverDasboard'
// import { isUserVerified } from '@/lib/utils'
// import { redirect } from '@tanstack/react-router'
import { isAdmin, isUser, isDriver } from '@/stores/authStore'
import { LogoutButton } from '@/components/LogoutButton'
import {
  Bell,
  Search,
  // Package,
  ShoppingCart,
  Star,
  Heart,
} from 'lucide-react'

export const Route = createFileRoute('/products/')({
  // Temporarily comment out authentication check for debugging
  // beforeLoad: () => {
  //   const isVerified = isUserVerified();
  //   console.log('Products page - User verification status:', isVerified);
  //   if (!isVerified) {
  //     throw redirect({ to: '/login' });
  //   }
  // },
  component: ProductsPage,
})

function ProductsPage() {
  console.log('ProductsPage component is rendering');
  
  // Function to render the appropriate sidebar based on user role
  const renderSidebar = () => {
    if (isAdmin()) {
      return <AdminSidebar />;
    } else if (isUser()) {
      return <UserSidebar />;
    } else if (isDriver()) {
      return <DriverSidebar />;
    } else {
      // Fallback to default sidebar
      return <SidebarDashboard />;
    }
  };

  // Function to get page title based on user role
  const getPageTitle = () => {
    if (isAdmin()) {
      return 'Admin Products';
    } else if (isUser()) {
      return 'Products';
    } else if (isDriver()) {
      return 'Driver Products';
    } else {
      return 'Products';
    }
  };

  // Mock products data
  const products = [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      price: 2.99,
      category: 'Vegetables',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop',
      rating: 4.5,
      inStock: true,
    },
    {
      id: 2,
      name: 'Organic Bananas',
      price: 1.99,
      category: 'Fruits',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
      rating: 4.8,
      inStock: true,
    },
    {
      id: 3,
      name: 'Whole Grain Bread',
      price: 3.49,
      category: 'Bakery',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
      rating: 4.2,
      inStock: false,
    },
    {
      id: 4,
      name: 'Fresh Milk',
      price: 4.99,
      category: 'Dairy',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      rating: 4.6,
      inStock: true,
    },
    {
      id: 5,
      name: 'Organic Eggs',
      price: 5.99,
      category: 'Dairy',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=200&fit=crop',
      rating: 4.7,
      inStock: true,
    },
    {
      id: 6,
      name: 'Fresh Spinach',
      price: 2.49,
      category: 'Vegetables',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop',
      rating: 4.3,
      inStock: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Role-based Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
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
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Heart size={16} className="text-gray-600" />
                    </button>
                  </div>
                  {!product.inStock && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{product.category}</span>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">${product.price}</span>
                    <button 
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        product.inStock 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? (
                        <div className="flex items-center">
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </div>
                      ) : (
                        'Out of Stock'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
