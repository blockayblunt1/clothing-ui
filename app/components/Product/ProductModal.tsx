'use client';

import { useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductModal({ product, isOpen, onClose, onEdit, onDelete }: ProductModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal - Instagram-like full layout */}
      <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl transform transition-all max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row z-10">
        
        {/* Image Section - Left Side */}
        <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[400px] md:min-h-[600px]">
          {/* Close button - positioned over image */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'flex items-center justify-center text-gray-400 text-center';
                  errorDiv.innerHTML = `
                    <div>
                      <svg class="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p class="text-lg">Failed to load image</p>
                    </div>
                  `;
                  parent.appendChild(errorDiv);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section - Right Side */}
        <div className="md:w-2/5 flex flex-col max-h-[90vh]">
          
          {/* Header with product name */}
          <div className="border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">Product Details</p>
              </div>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              
              {/* Price */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>

              {/* Product metadata */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-500">Product ID</span>
                  <span className="text-sm text-gray-900 font-mono">#{product.id}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <span className="text-sm text-gray-700">{formatDate(product.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-sm text-gray-700">{formatDate(product.updatedAt)}</span>
                </div>
                
                {product.image && (
                  <div className="pt-2">
                    <span className="text-sm font-medium text-gray-500">Image URL</span>
                    <p className="text-xs text-gray-600 break-all mt-1 bg-gray-50 p-2 rounded font-mono">
                      {product.image}
                    </p>
                  </div>
                )}
              </div>

              {/* Like Instagram - add some interaction elements */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onEdit(product);
                  onClose();
                }}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}