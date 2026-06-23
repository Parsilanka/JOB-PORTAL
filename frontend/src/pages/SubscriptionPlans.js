import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiCheck, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, waiting, completed, failed
  const [paymentId, setPaymentId] = useState('');
  const [pollingCount, setPollingCount] = useState(0);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const API_URL = 'http://localhost:5000/api';
  const MAX_POLLING_ATTEMPTS = 30; // Poll for 3 minutes

  useEffect(() => {
    fetchPlans();
    if (user?.accountType === 'employer') {
      checkCurrentSubscription();
    }
  }, [user?.accountType]);

  // Poll for payment status
  useEffect(() => {
    if (paymentStatus !== 'waiting' || !paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/payments/${paymentId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.data.status === 'completed') {
          setPaymentStatus('completed');
          clearInterval(pollInterval);
          setTimeout(() => {
            checkCurrentSubscription();
            setSelectedPlan(null);
            setPaymentStatus('idle');
            setPhoneNumber('');
          }, 2000);
        } else if (response.data.data.status === 'failed') {
          setPaymentStatus('failed');
          setError('Payment failed. Please try again.');
          clearInterval(pollInterval);
        }

        setPollingCount(prev => prev + 1);
        if (pollingCount >= MAX_POLLING_ATTEMPTS) {
          clearInterval(pollInterval);
          setPaymentStatus('timeout');
          setError('Payment timeout. Please check your phone and try again.');
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 6000); // Poll every 6 seconds

    return () => clearInterval(pollInterval);
  }, [paymentStatus, paymentId, pollingCount]);

  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/plans`);
      setPlans(response.data.data);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/subscriptions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentSubscription(response.data.data);
    } catch (err) {
      // No active subscription
    }
  };

  const initiatePayment = async (plan) => {
    if (!phoneNumber) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (formattedPhone.length !== 12) {
      setError('Invalid phone number. Please use format: 0712345678 or 254712345678');
      return;
    }

    try {
      setError('');
      setPaymentStatus('processing');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payments/initiate-subscription`,
        {
          plan,
          phoneNumber: formattedPhone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaymentId(response.data.data.paymentId);
      setPaymentStatus('waiting');
      setPollingCount(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setPaymentStatus('failed');
    }
  };

  const completeTestPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/payments/${paymentId}/complete-test`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentStatus('completed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete test payment');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium Subscription Plans</h1>
          <p className="text-xl text-gray-600">Unlock advanced features to grow your business</p>
        </div>

        {currentSubscription && currentSubscription.status === 'active' && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-4 rounded mb-8 text-center">
            <p className="font-semibold">You have an active {currentSubscription.plan} subscription</p>
            <p className="text-sm">Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 ${
                currentSubscription?.plan === plan.slug
                  ? 'ring-4 ring-blue-500 bg-white'
                  : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold">KES {plan.price}</p>
                <p className="text-blue-100">/{plan.period}</p>
              </div>

              {/* Features */}
              <div className="px-6 py-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <FiCheck className="text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                {currentSubscription?.plan === plan.slug ? (
                  <button
                    disabled
                    className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan.slug)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Subscribe Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Subscribe to {plans.find(p => p.slug === selectedPlan)?.name}
              </h3>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
                  <FiAlertCircle className="mr-3 flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {paymentStatus === 'completed' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-start">
                  <FiCheckCircle className="mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Payment Successful!</p>
                    <p className="text-sm">Your subscription has been activated</p>
                  </div>
                </div>
              )}

              {paymentStatus === 'waiting' && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
                  <div className="text-center">
                    <div className="animate-spin mb-4">
                      <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Waiting for M-Pesa Prompt</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Please check your phone <strong>{phoneNumber}</strong> for the M-Pesa prompt
                    </p>
                    <p className="text-xs text-gray-500">If you don't see it in 30 seconds, check your balance and try again</p>
                    
                    {/* Test mode button */}
                    <button
                      onClick={completeTestPayment}
                      className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition"
                    >
                      🧪 Complete Test Payment
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus !== 'waiting' && paymentStatus !== 'completed' && (
                <>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-600">Monthly Cost</p>
                    <p className="text-3xl font-bold text-blue-600">
                      KES {plans.find(p => p.slug === selectedPlan)?.price}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0712345678"
                      disabled={paymentStatus === 'processing'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 0712345678 or 254712345678</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => initiatePayment(selectedPlan)}
                      disabled={paymentStatus === 'processing'}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {paymentStatus === 'processing' ? 'Processing...' : 'Pay with M-Pesa'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(null);
                        setPaymentStatus('idle');
                        setError('');
                        setPhoneNumber('');
                      }}
                      disabled={paymentStatus === 'processing' || paymentStatus === 'waiting'}
                      className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    You will receive an M-Pesa prompt on your phone. Enter your PIN to complete the payment.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
