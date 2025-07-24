import { Link } from '@tanstack/react-router'
import {  VeganIcon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close sidebar on outside click
  useEffect(() => {
    if (!isSidebarOpen) return
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isSidebarOpen])

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-orange-300 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand and sidebar trigger */}
          <div className="flex items-center gap-2 ">
            {/* Sidebar trigger icon - moved before logo */}
            <button
              className="mr-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              {/* <MenuIcon className="h-6 w-6 text-gray-700" /> */}
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              <VeganIcon className="h-8 w-8 text-red-600" />
              Olive Groceries
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/about"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              activeProps={{ className: 'text-blue-600' }}
            >
              About
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              activeProps={{ className: 'text-blue-600' }}
            >
              Our Store
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              activeProps={{ className: 'text-blue-600' }}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/signin"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-gray-700 hover font-medium transition-colors px-4 py-2 "
            >
              Login
            </Link>
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-full border border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center text-gray-700 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-2 py-1"
                activeProps={{ className: 'text-blue-600' }}
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-2 py-1"
                activeProps={{ className: 'text-blue-600' }}
              >
                Our Store
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-2 py-1"
                activeProps={{ className: 'text-blue-600' }}
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-2 py-1"
                activeProps={{ className: 'text-blue-600' }}
              >
                Contact
              </Link>

              {/* Mobile CTA Buttons */}
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-gray-900 font-medium transition-colors text-center px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors text-center px-4 py-2 rounded shadow"
                >
                  Login
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors text-center px-4 py-2 rounded shadow mt-2"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </nav>
          </div>
        )}








  
      
      </div>
    </header>
  )
}