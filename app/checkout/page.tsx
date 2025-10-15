'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header/Header';
import Toast from '../components/UI/Toast';
import CheckoutForm from '../components/Checkout/CheckoutForm';

// Initialize Stripe
let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    try {
      // Get the publishable key from the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Payment/config`);
      const config = await response.json();
      
      if (config.publishableKey) {
        stripePromise = loadStripe(config.publishableKey);
      } else {
        throw new Error('Stripe publishable key not found');
      }
    } catch (error) {
      console.error('Failed to load Stripe config:', error);
      throw error;
    }
  }
  return stripePromise;
};

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
}

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

export default function CheckoutPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' });
  
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();
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
    if (isAuthenticated && (!cart || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cart, isAuthenticated, router]);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe();
        setStripe(stripeInstance);
      } catch (error) {
        showToast('Failed to initialize payment system', 'error');
      }
    };
    
    initializeStripe();
  }, []);

  const createOrder = async () => {
    if (!token) return null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Order/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  const createPaymentIntent = async (orderId: number) => {
    if (!token) return null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  };

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    
    try {
      // Create order from cart
      const createdOrder = await createOrder();
      if (!createdOrder) {
        showToast('Failed to create order', 'error');
        return;
      }

      setOrder(createdOrder);

      // Create payment intent
      const paymentIntent = await createPaymentIntent(createdOrder.id);
      if (!paymentIntent) {
        showToast('Failed to initialize payment', 'error');
        return;
      }

      setClientSecret(paymentIntent.clientSecret);
    } catch (error) {
      showToast('Failed to proceed to payment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    showToast('Payment successful! Redirecting to orders...', 'success');
    setTimeout(() => {
      router.push('/orders');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    showToast(`Payment failed: ${error}`, 'error');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your order with secure payment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              
              {!clientSecret ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Click below to proceed with secure payment processing.
                  </p>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              ) : (
                stripe && (
                  <Elements 
                    stripe={stripe} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                      }
                    }}
                  >
                    <CheckoutForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      totalAmount={getTotalPrice()}
                      order={order}
                    />
                  </Elements>
                )
              )}
            </div>
          </div>
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