import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  productService,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type TProduct,
  type TProductCreate,
} from '@/hooks/useProducts'
import { useAuthStore, isAdmin, getToken } from '@/stores/authStore'
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Package,
  // DollarSign,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';
import { productCategory } from '@/interfaces/orderInterface';

export const Route = createFileRoute('/admin/products')({
  component: AdminProductsComponent,
})

function AdminProductsComponent() {
  const { data: products = [], isLoading, isError, error } = productService()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  // Get authentication state
  const { user, token, isAuthenticated } = useAuthStore()

  // Debug authentication state
  console.log('Admin Products - Auth State:', {
    isAuthenticated,
    hasToken: !!token,
    isAdmin: isAdmin(),
    userId: user?.id,
    userRole: user?.role,
  })

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(null)

  // State for form data
  const [formData, setFormData] = useState<Partial<TProductCreate & TProduct>>({
    product_name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    inStock: true,
    stock_quantity: 0,
  })

  // Add to component state:
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Filter and search products
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch =
          product.product_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory =
          categoryFilter === 'all' ||
          product.category?.toLowerCase() === categoryFilter.toLowerCase()
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in-stock' && product.inStock) ||
          (stockFilter === 'out-of-stock' && !product.inStock)

        return matchesSearch && matchesCategory && matchesStock
      })
    : []

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  )

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Helper functions
  const getStockBadge = (product: TProduct) => {
    if (product.inStock) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      )
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-yellow-100 text-yellow-800',
    ]
    const colorIndex = category.length % colors.length

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[colorIndex]}`}
      >
        {category}
      </span>
    )
  }

  // CRUD Operations
  const handleCreate = async () => {
    if (!formData.product_name || typeof formData.product_name !== 'string' || formData.product_name.trim() === '') {
      toast.error('Product name is required and must be a non-empty string.');
      return;
    }
    if (typeof formData.price !== 'number' || isNaN(formData.price)) {
      toast.error('Price is required and must be a number.');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price must not be less than 0.');
      return;
    }
    if (!formData.category || typeof formData.category !== 'string' || formData.category.trim() === '') {
      toast.error('Category is required and must be a non-empty string.');
      return;
    }
    // Phone number validation (if phoneNumber is present)
    if (formData.phoneNumber) {
      const phoneRegex = /^\+2547\d{8}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        toast.error('Phone number must be in the format +2547xxxxxxxx');
        return;
      }
    }
    if (!imageFile) {
      toast.error('Please select an image.');
      return;
    }
    const formPayload = new FormData();
    formPayload.append('product_name', formData.product_name);
    if (typeof formData.price === 'number' && !isNaN(formData.price)) {
      formPayload.append('price', String(formData.price));
    }
    formPayload.append('category', formData.category);
    formPayload.append('inStock', String(formData.inStock ?? true));
    formPayload.append('image', imageFile);
    if (formData.phoneNumber) {
      formPayload.append('phoneNumber', formData.phoneNumber);
    }

    console.log('formData:', formData);
    console.log('formPayload:', [...formPayload.entries()]);

    try {
      await createProductMutation.mutateAsync(formPayload as any);
      setShowCreateModal(false);
      setFormData({
        product_name: '',
        price: 0,
        category: '',
        image: '',
        inStock: true,
        phoneNumber: '',
      });
      setImageFile(null);
      toast.success('Product created successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create product');
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    if (!isAuthenticated || !token) {
      toast.error('Please log in to perform this action');
      return;
    }
    // Remove 'image' from the update payload, use 'imageUrl' if updating image
    const { image, ...rest } = formData;
    const updatePayload: any = { ...rest };
    if (image) {
      updatePayload.imageUrl = image;
    }
    try {
      await updateProductMutation.mutateAsync({
        id: selectedProduct.id,
        product: updatePayload,
      });
      setShowEditModal(false);
      setSelectedProduct(null);
      toast.success('Product updated successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update product';
      if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401')
      ) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(errorMessage);
      }
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return

    if (!isAuthenticated || !token) {
      toast.error('Please log in to perform this action')
      return
    }

    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id)
      setShowDeleteModal(false)
      setSelectedProduct(null)
      toast.success('Product deleted successfully!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete product'
      if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401')
      ) {
        toast.error('Authentication failed. Please log in again.')
      } else {
        toast.error(errorMessage)
      }
      console.error('Delete error:', error)
    }
  }

  const openEditModal = (product: TProduct) => {
    setSelectedProduct(product)
    setFormData({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock: product.inStock,
      stock_quantity: product.stock_quantity,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (product: TProduct) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (isError) {
    return (
      <LayoutWithSidebar>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-600">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      </LayoutWithSidebar>
    )
  }

  // Check if products is not an array (API returned unexpected data)
  if (!Array.isArray(products)) {
    return (
      <LayoutWithSidebar>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Unexpected Data Format
          </h3>
          <p className="text-yellow-600">
            The API returned unexpected data. Expected an array of products, but
            got: {typeof products}
          </p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(products, null, 2)}
          </pre>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <>
        <Toaster position="top-right" richColors closeButton />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Products</h1>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600">Manage your product inventory</p>
              {/* Authentication Debug Info */}
              <div className="text-xs text-gray-500 mt-1">
                Auth: {isAuthenticated ? '✅' : '❌'} | Token:{' '}
                {token ? '✅' : '❌'} | Admin: {isAdmin() ? '✅' : '❌'} | User:{' '}
                {user?.email || 'None'}
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              disabled={!isAuthenticated || !token}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Stock Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:border-orange-200 hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.product_name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center transition-all duration-300">
                    <Package className="h-12 w-12 text-gray-400 group-hover:text-gray-500 transition-colors duration-300" />
                  </div>
                  <div className="absolute top-3 right-3 backdrop-blur-sm bg-white/80 rounded-full p-1 shadow-md">
                    {getStockBadge(product)}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-600 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
                      {product.product_name}
                    </h3>
                    <div className="flex-shrink-0 ml-2">
                      {getCategoryBadge(product.category)}
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {/* <DollarSign className="h-5 w-5 text-green-600 mr-1" /> */}
                      <span className="text-xl font-bold text-green-600">
                        Kes{product.price}
                      </span>
                    </div>
                    {product.stock_quantity !== undefined && (
                      <div className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        Stock: {product.stock_quantity}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between space-x-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredProducts.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{filteredProducts.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <Package className="w-full h-full" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating a new product.'}
              </p>
            </div>
          )}
        </div>

        {/* Create Product Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New Product
                </h3>
                <div className="space-y-4">
                  {/* Product Name, Price, Category, Image, In Stock fields only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.product_name || ''}
                      required
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price ?? ''}
                      required
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({
                          ...formData,
                          price: value === '' ? undefined : parseFloat(value),
                        });
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select category</option>
                      {Object.values(productCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.inStock || false}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      In Stock
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={createProductMutation.isPending}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Product: {selectedProduct.product_name}
                </h3>
                <div className="space-y-4">
                  {/* Product Name, Price, Category, Image, In Stock fields only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.product_name || ''}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select category</option>
                      {Object.values(productCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, image: file.name }); // Optionally update for display
                          setImageFile(file); // Store the file for upload if needed
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.inStock || false}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      In Stock
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateProductMutation.isPending}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  Delete Product
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete product "
                    {selectedProduct.product_name}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteProductMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </LayoutWithSidebar>
  )
}

export default AdminProductsComponent
