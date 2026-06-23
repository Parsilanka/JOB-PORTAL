import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiAlertCircle } from 'react-icons/fi';

const AdminFinancialDashboard = () => {
  const [stats, setStats] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [financeRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/finances`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/payments/admin/all?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(financeRes.data.data);
      setPaymentData(paymentsRes.data.data);
    } catch (err) {
      setError('Failed to load financial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const totalRevenue = stats?.totalRevenue || 0;
  const revenueByType = stats?.revenueByType || [];
  const subscriptionStats = stats?.subscriptionStats || [];
  const pendingPayments = stats?.pendingPayments || 0;
  const failedPayments = stats?.failedPayments || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor revenue, payments, and subscriptions</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">KES {totalRevenue?.toLocaleString()}</p>
              </div>
              <FiDollarSign className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-3xl font-bold text-gray-900">{pendingPayments}</p>
              </div>
              <FiCreditCard className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Failed Payments</p>
                <p className="text-3xl font-bold text-gray-900">{failedPayments}</p>
              </div>
              <FiAlertCircle className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {subscriptionStats.reduce((sum, s) => sum + (s.activeCount || 0), 0)}
                </p>
              </div>
              <FiTrendingUp className="text-4xl text-blue-500" />
            </div>
          </div>
        </div>

        {/* Revenue by Type */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Revenue by Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueByType.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded p-4">
                <p className="text-gray-600 capitalize">{item._id}</p>
                <p className="text-2xl font-bold text-gray-900">KES {item.amount?.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{item.count} transactions</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Plan</th>
                  <th className="text-left py-2 px-4">Total Subscribers</th>
                  <th className="text-left py-2 px-4">Active</th>
                  <th className="text-left py-2 px-4">Monthly Revenue</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionStats.map((plan) => (
                  <tr key={plan._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 capitalize font-semibold">{plan._id}</td>
                    <td className="py-3 px-4">{plan.count}</td>
                    <td className="py-3 px-4">{plan.activeCount || 0}</td>
                    <td className="py-3 px-4">KES {(plan.activeCount * 999)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">User</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((payment) => (
                  <tr key={payment._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{payment.user?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 capitalize">{payment.transactionType?.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-semibold">KES {payment.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialDashboard;
