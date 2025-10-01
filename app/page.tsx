'use client';

import { useEffect, useState } from 'react';
import Toast from './components/UI/Toast';
import ProductModal from './components/Product/ProductModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ isVisible: true, message, type });
    setMessage(''); // Clear the old message display
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const fetchProducts = async () => {
    console.log('Fetching products from:', `${process.env.NEXT_PUBLIC_API_BASE}/api/Product`);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Product`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Products received:', data);
        setProducts(data);
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  console.log('Render state:', { mounted, loading, products: products.length, apiBase: process.env.NEXT_PUBLIC_API_BASE });

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Product Management
            </h1>
            <p className="text-gray-600">
              Loading... (Mounting)
            </p>
          </div>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', image: '' });
    setEditingProduct(null);
    setMessage('');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(formData.price);
    
    if (isNaN(priceValue) || priceValue <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: priceValue,
        image: formData.image || null
      };

      let response;
      if (editingProduct) {
        // Update existing product
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Product/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Create new product
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
      }

      if (response.ok) {
        showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 'success');
        resetForm();
        fetchProducts();
      } else {
        const errorData = await response.text();
        showToast(`Error: ${errorData}`, 'error');
      }
    } catch (error) {
      showToast(`Error: ${error}`, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Product/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showToast('Product deleted successfully!', 'success');
          fetchProducts();
        } else {
          showToast('Error deleting product', 'error');
        }
      } catch (error) {
        showToast(`Error: ${error}`, 'error');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            Add, update, and manage your clothing products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Update Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    maxLength={500}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    max="10000"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    maxLength={200}
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 active:bg-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-[0.98]"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Products ({products.length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Click on any product to view details
                  </p>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading products...</p>
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openProductModal(product)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-green-600">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          {product.image && (
                            <p className="text-xs text-blue-600 mt-1">
                              📷 Has image
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product);
                            }}
                            className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Add your first product using the form on the left</p>
                    </div>
                    {!process.env.NEXT_PUBLIC_API_BASE && (
                      <p className="text-xs text-red-500 mt-2">
                        API base URL not configured. Check your environment variables.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      
      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
