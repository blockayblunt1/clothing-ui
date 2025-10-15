'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header/Header';
import Toast from '../components/UI/Toast';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  productImage?: string;
  quantity: number;
  price: number;
  createdAt: string;
}

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string | number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' });
  
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ isVisible: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Order`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        showToast('Failed to fetch orders', 'error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error loading orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newStatus),
      });

      if (response.ok) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders(); // Refresh orders
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error updating order status', 'error');
    }
  };

  const getNextStatuses = (currentStatus: string | number) => {
    const statusString = String(currentStatus).toLowerCase();
    switch (statusString) {
      case 'pending':
      case '0':
        return [{ value: 'Paid', label: 'Mark as Paid' }];
      case 'paid':
      case '1':
        return [{ value: 'Shipped', label: 'Mark as Shipped' }];
      case 'shipped':
      case '2':
        return [{ value: 'Delivered', label: 'Mark as Delivered' }];
      case 'delivered':
      case '3':
        return [{ value: 'Cancelled', label: 'Cancel Order' }];
      default:
        return [];
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'pending':
      case '0':
        return 'Pending';
      case 'paid':
      case '1':
        return 'Paid';
      case 'shipped':
      case '2':
        return 'Shipped';
      case 'delivered':
      case '3':
        return 'Delivered';
      case 'cancelled':
      case '4':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'pending':
      case '0':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case '1':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case '2':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case '3':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
      case '4':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track your order history and status</p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 mb-6">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0V3a1 1 0 011-1h2a1 1 0 011 1v2m-4 0h4" />
                </svg>
                <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                <p className="text-sm">Start shopping to see your orders here</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.productDescription}
                            </p>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatPrice(item.price)} each
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        {order.stripePaymentIntentId && (
                          <span className="ml-4">
                            Payment ID: {order.stripePaymentIntentId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {(String(order.status).toLowerCase() === 'pending' || order.status === 0) && (
                          <button
                            onClick={() => router.push(`/checkout?orderId=${order.id}`)}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                          >
                            Complete Payment
                          </button>
                        )}
                        
                        {/* Status update buttons */}
                        {getNextStatuses(order.status).map((statusOption) => (
                          <button
                            key={statusOption.value}
                            onClick={() => updateOrderStatus(order.id, statusOption.value)}
                            className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                          >
                            {statusOption.label}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </>
  );
}