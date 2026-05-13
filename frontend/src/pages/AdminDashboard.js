import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { FiUsers, FiBriefcase, FiFileText, FiTrendingUp } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers({ page: 1, limit: 20 });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleApproveUser = async (userId, isApproved) => {
    try {
      await adminService.approveUser(userId, { isApproved });
      fetchUsers();
      alert('User updated successfully');
    } catch (error) {
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
        alert('User deleted successfully');
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => {
              setSelectedTab('overview');
              fetchStats();
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setSelectedTab('users');
              fetchUsers();
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Users
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            {loading ? (
              <p>Loading statistics...</p>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <FiUsers className="text-4xl text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Job Seekers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalJobSeekers}</p>
                    </div>
                    <FiFileText className="text-4xl text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Employers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalEmployers}</p>
                    </div>
                    <FiBriefcase className="text-4xl text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Jobs</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                    </div>
                    <FiTrendingUp className="text-4xl text-orange-600" />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Additional Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Jobs Status</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Active:</span> {stats.activeJobs}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Total:</span> {stats.totalJobs}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Closed:</span> {stats.totalJobs - stats.activeJobs}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Applications</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Total:</span> {stats.totalApplications}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Application Status</h3>
                  <div className="space-y-2">
                    {stats.applicationStats?.map((stat, idx) => (
                      <p key={idx} className="text-gray-700">
                        <span className="font-semibold capitalize">{stat._id}:</span> {stat.count}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700">{user.fullName}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {!user.isApproved && (
                        <button
                          onClick={() => handleApproveUser(user._id, true)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs mr-2 hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
