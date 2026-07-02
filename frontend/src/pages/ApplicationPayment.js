import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCreditCard, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ApplicationPayment = () => {
  const { applicationId } = useParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, waiting, completed, failed
  const [paymentId, setPaymentId] = useState('');
  const [pollingCount, setPollingCount] = useState(0);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const APPLICATION_FEE = 50;
  const MAX_POLLING_ATTEMPTS = 30; // Poll for 3 minutes (30 * 6 seconds)

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
          setTimeout(() => navigate('/applications'), 2000);
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
  }, [paymentStatus, paymentId, pollingCount, navigate]);

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // Ensure it starts with 254
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const initiatePayment = async (e) => {
    e.preventDefault();
    
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
      setLoading(true);
      setError('');
      setPaymentStatus('processing');
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/payments/initiate-application`,
        {
          applicationId,
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
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <FiCreditCard className="mx-auto text-5xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Application Fee</h1>
          <p className="text-gray-600 mt-2">Complete your job application</p>
        </div>

        {/* Status Messages */}
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
              <p className="text-sm">Redirecting...</p>
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
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-gray-600 text-center mb-2">Total Amount Due</p>
              <p className="text-5xl font-bold text-blue-600 text-center">KES {APPLICATION_FEE}</p>
              <p className="text-sm text-gray-500 text-center mt-2">One-time payment</p>
            </div>

            <form onSubmit={initiatePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 0712345678 or 254712345678</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center"
              >
                {loading ? 'Processing...' : (
                  <>
                    <FiLock className="mr-2" />
                    Pay KES {APPLICATION_FEE} with M-Pesa
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/applications')}
                disabled={loading}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Enter your M-Pesa registered phone number</li>
                <li>2. Click "Pay with M-Pesa"</li>
                <li>3. You will receive an M-Pesa prompt on your phone</li>
                <li>4. Enter your M-Pesa PIN to confirm (5-10 seconds)</li>
                <li>5. Payment confirmed automatically</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationPayment;
