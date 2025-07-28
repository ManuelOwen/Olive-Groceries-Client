import { createFileRoute } from '@tanstack/react-router'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'
import { LogoutButton } from '@/components/LogoutButton'
import { Search, ShoppingCart, Star, Heart, ChevronDown } from 'lucide-react'
import { productService, type TProduct } from '@/hooks/useProducts'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
// Remove CartSidebar import
// import { CartSidebar } from '@/components/sidebar'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router';

// Product categories from the backend enum
const PRODUCT_CATEGORIES = [
  { value: 'fruit', label: 'Fruits' },
  { value: 'vegetable', label: 'Vegetables' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'meat', label: 'Meat' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'beverage', label: 'Beverages' },
  { value: 'snack', label: 'Snacks' },
]

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  console.log('ProductsPage component is rendering')
  const { data: products, isLoading, isError, error } = productService()

  // Debug: Log products data to inspect image property
  console.log('Fetched products:', products)



  const { addToCart, items} = useCartStore()
  const [cartIconClicked, setCartIconClicked] = useState<
    Record<string | number, boolean>
  >({})
  const [liked, setLiked] = useState<Record<string | number, boolean>>(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('likedProducts')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  // Add search query state
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    // Persist to localStorage
    localStorage.setItem('likedProducts', JSON.stringify(liked))
  }, [liked])

  const handleAddToCart = (product: TProduct) => {
    setCartIconClicked((prev) => ({ ...prev, [product.id]: true }))
    // Always add one item to cart (since quantities state is removed)
    addToCart({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      imageUrl: product.imageUrl || product.image,
    })
    toast.success(`${product.product_name} added to cart!`)
    setTimeout(() => {
      setCartIconClicked((prev) => ({ ...prev, [product.id]: false }))
    }, 400)
  }

  const handleLike = async (id: string | number) => {
    setLiked((prev) => {
      const newLiked = { ...prev, [id]: !prev[id] }
      // Placeholder for backend sync
      syncLikeWithBackend(id, newLiked[id])
      return newLiked
    })
  }

  // Placeholder for backend sync
  const syncLikeWithBackend = async (
    productId: string | number,
    isLiked: boolean,
  ) => {
  
    console.log(`Syncing like for product ${productId}: ${isLiked}`)
  }

  // Filter products by selected category and search query
  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || []

  // For sidebar width, compute a class based on items.length
  // const getSidebarWidth = () => {
  //   // Only use w-64 and max-w-xs for a slim, card-like sidebar
  //   return 'w-64 max-w-xs';
  // };

  if (isLoading) {
    return <div>Loading products...</div>
  }

  if (isError) {
    return <div>Error loading products: {error?.message}</div>
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          
          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedCategory === 'all' 
                  ? 'All Categories' 
                  : PRODUCT_CATEGORIES.find(cat => cat.value === selectedCategory)?.label || 'All Categories'
                }
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setIsCategoryDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedCategory === 'all' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value)
                        setIsCategoryDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedCategory === category.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full relative"
            onClick={() => navigate({ to: '/products/cart' })}
            aria-label="Show cart"
          >
            <ShoppingCart size={24} className="text-gray-600" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
          <LogoutButton />
        </div>
      </header>
      {/* Content Area */}
      <main
        className="flex-1 overflow-y-auto p-6 bg-gray-50 -all duration-300 hide-scrollbar"
      >
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
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow"
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 30 }}
                  transition={{
                    delay: idx * 0.07,
                    duration: 0.4,
                    type: 'spring',
                    stiffness: 80,
                  }}
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
                      <motion.button
                        className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition cursor-pointer ${liked[product.id] ? 'text-red-500' : 'text-gray-600'}`}
                        onClick={() => handleLike(product.id)}
                        aria-label={liked[product.id] ? 'Unlike' : 'Like'}
                        type="button"
                        whileTap={{
                          scale: 1.3,
                          rotate: liked[product.id] ? 0 : 15,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <motion.span
                          animate={
                            liked[product.id]
                              ? { scale: 1.2, rotate: -10 }
                              : { scale: 1, rotate: 0 }
                          }
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                          }}
                          style={{ display: 'inline-block' }}
                        >
                          <Heart
                            size={16}
                            fill={liked[product.id] ? 'currentColor' : 'none'}
                          />
                        </motion.span>
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {product.category}
                      </span>
                      <div className="flex items-center">
                        <Star
                          size={14}
                          className="text-yellow-400 fill-current"
                        />
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {product.product_name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        KSH {product.price}
                      </span>
                      {product.quantity === 0 && (
                        <span className="ml-2 px-2 py-1 rounded bg-red-100 text-red-600 text-xs font-semibold">Out of Stock</span>
                      )}
                      <button
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-orange-300 text-white hover:bg-orange-500 focus:ring-2 focus:ring-orange-400 focus:outline-none cursor-pointer shadow-md hover:shadow-lg"
                        onClick={() => product.quantity > 0 && handleAddToCart(product)}
                        disabled={product.quantity === 0}
                      >
                        <div className="flex items-center">
                          <motion.span
                            animate={
                              cartIconClicked[product.id]
                                ? { y: -10 }
                                : { y: 0 }
                            }
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 10,
                            }}
                            style={{ display: 'inline-block' }}
                          >
                            <ShoppingCart size={16} className="mr-2" />
                          </motion.span>
                          Add to Cart
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No products found.
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </LayoutWithSidebar>
  )
}
