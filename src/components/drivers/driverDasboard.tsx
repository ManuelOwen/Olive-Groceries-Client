import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ShoppingCart,
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

export const DriverSidebar = () => {
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
      path: '/driver/dashboard',
    },
    {
      name: 'Products',
      icon: Package,
      path: '/products',
      subItems: [
        { name: 'All Products', path: '/products' },
        // { name: "My Deliveries", path: "/driver/dashboard" },
        // { name: "Categories", path: "/products" },
      ],
    },

    {
      name: 'Deliveries',
      icon: ShoppingCart,
      path: '/driver/dashboard',
      subItems: [
        // { name: 'My Deliveries', path: '/driver/deliveries' },
        { name: 'My Orders', path: '/driver/orders' },
      ],
    },

    {
      name: 'Settings',
      icon: Settings,
      path: '/driver/dashboard',
      subItems: [{ name: 'Profile', path: '/driver/profile' }],
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
            to="/driver/dashboard"
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

        <div className="border-t border-gray-200 p-4">
          {!collapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-medium">
                  SA
                </div>
                <div>
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
