import Paystack from '@paystack/inline-js'
import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/stores/cartStore'
// import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

export const SidebarDashboard = () => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    products: false,
    orders: false,
    users: false,
  })
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (!isMobile && mobileOpen) setMobileOpen(false)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile, mobileOpen])

  const toggleMenu = (menuName: string) => {
    if (collapsed) {
      // If sidebar is collapsed, expand it and open the menu
      setCollapsed(false)
      setTimeout(() => {
        setExpandedMenus((prev) => ({
          ...prev,
          [menuName]: true,
        }))
        setActiveMenu(menuName)
      }, 300) // Wait for the sidebar to finish expanding
    } else {
      // Normal behavior when not collapsed
      setExpandedMenus((prev) => ({
        ...prev,
        [menuName]: !prev[menuName],
      }))
      setActiveMenu(menuName)
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
      // Close all menus when collapsing
      if (!collapsed) {
        setExpandedMenus({
          products: false,
          orders: false,
          users: false,
        })
      }
    }
  }

  const navItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard/user',
    },
    {
      name: 'Products',
      icon: Package,
      path: '/dashboard/products',
      subItems: [
        { name: 'All Products', path: '/dashboard/products' },
        { name: 'Categories', path: '/dashboard/products/categories' },
        { name: 'Inventory', path: '/dashboard/products/inventory' },
      ],
    },
    {
      name: 'Orders',
      icon: ShoppingCart,
      path: '/dashboard/orders',
      subItems: [
        { name: 'All Orders', path: '/dashboard/orders' },
        { name: 'Pending', path: '/dashboard/orders/pending' },
        { name: 'Completed', path: '/dashboard/orders/completed' },
      ],
    },
    {
      name: 'Users',
      icon: Users,
      path: '/users',
      subItems: [
        { name: 'Admins', path: '/dashboard/users/admins' },
        { name: 'Customers', path: '/dashboard/users/customers' },
        { name: 'Staff', path: '/dashboard/users/staff' },
      ],
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700 md:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
          ${collapsed ? 'w-20' : 'w-64'}
          ${isMobile && !mobileOpen ? '-translate-x-full' : 'translate-x-0'}
          bg-white shadow-lg flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 min-w-max"
          >
            <div className="bg-orange-400 text-white p-2 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            {!collapsed && (
              <h1 className="text-xl font-bold text-orange-400">
                Olive Groceries
              </h1>
            )}
          </Link>
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name.toLowerCase())}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-400 transition-colors ${
                        expandedMenus[item.name.toLowerCase()]
                          ? 'bg-green-50 text-orange-400'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                      </div>
                      {!collapsed &&
                        (expandedMenus[item.name.toLowerCase()] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        ))}
                    </button>

                    {(!collapsed || activeMenu === item.name.toLowerCase()) &&
                      expandedMenus[item.name.toLowerCase()] && (
                        <ul
                          className={`${collapsed ? 'ml-2' : 'ml-8'} mt-1 space-y-1`}
                        >
                          {item.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.path}
                                activeProps={{
                                  className: 'text-orange-400 font-medium',
                                }}
                                className={`block p-2 ${collapsed ? 'pl-2' : 'pl-4'} rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-400 text-sm transition-colors`}
                                onClick={() => {
                                  if (isMobile) setMobileOpen(false)
                                }}
                              >
                                {!collapsed ? subItem.name : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    activeProps={{ className: 'bg-orange-50 text-orange-400' }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-400 transition-colors"
                    onClick={() => {
                      if (isMobile) setMobileOpen(false)
                    }}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Add New Button
        <div className="px-4 pb-4">
          <button className="w-full flex items-center justify-center space-x-2 bg-orange-400 hover:bg-orange-400 text-white py-2 px-4 rounded-lg transition-colors">
            <Plus size={18} />
            {!collapsed && <span>Add New</span>}
          </button>
        </div> */}

        {/* User & Help Section */}
        <div className="border-t border-gray-200 p-4">
          {!collapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-orange-400 font-medium">
                  SA
                </div>
                <div>
                  {/* <p className="font-medium text-sm"></p> */}
                  <p className="text-xs text-gray-500">
                    Olivegrocerystores.com
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-gray-500">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <HelpCircle size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bell size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 font-medium">
                SA
              </div>
              <div className="flex flex-col space-y-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <HelpCircle size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bell size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
          
    </>
  )
}
// cart functionality
export function CartSidebar({ onClose }: { onClose?: () => void }) {
  const { items, removeFromCart, clearCart, addToCart, decrementFromCart } =
    useCartStore()
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const popup = new Paystack()
   popup.resumeTransaction('hbvks8r9mgr0zbc')
  // Prevent background scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <aside
      className={
        'fixed top-0 right-0 w-full sm:w-96 max-w-full bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 transform translate-x-0'
      }
      style={{
        boxShadow: '0 8px 32px rgba(34,197,94,0.18)',
        maxHeight: '100vh',
      }}
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold">Shopping Cart</h2>
        <div className="flex gap-2">
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:underline"
          >
            Clear
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-xl px-2"
            >
              &times;
            </button>
          )}
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {items.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">
            Your cart is empty.
          </div>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  className="flex items-center gap-3 border-b pb-2"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  layout
                >
                  <img
                    src={item.imageUrl}
                    alt={item.product_name}
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.product_name}</div>
                    <div className="text-sm text-gray-500">
                      KSH {item.price} x {item.quantity}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
                        onClick={() => decrementFromCart(item.id)}
                        aria-label="Remove one"
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            product_name: item.product_name,
                            price: item.price,
                            imageUrl: item.imageUrl,
                          })
                        }
                        aria-label="Add one"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:underline text-xs ml-2"
                  >
                    Remove
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>KSH {total.toFixed(2)}</span>
        </div>
        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
          Checkout
        </button>
      </div>
    </aside>
  )
}
