import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUsers, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Job Today
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>

          {!isAuthenticated ? (
            <div className="flex justify-center space-x-4">
              <Link
                to="/jobs"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
              >
                Browse Jobs <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                Get Started
              </Link>
            </div>
          ) : user?.accountType === 'employer' ? (
            <div className="flex justify-center space-x-4">
              <Link
                to="/post-job"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
              >
                Post a Job <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/my-jobs"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                My Jobs
              </Link>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link
                to="/jobs"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
              >
                Browse Jobs <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/applications"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                My Applications
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <FiBriefcase className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thousands of Jobs</h3>
            <p className="text-gray-600">
              Explore thousands of job listings from top companies across various industries.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <FiUsers className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Employers</h3>
            <p className="text-gray-600">
              Connect with verified employers looking for talented professionals like you.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <FiTrendingUp className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Career Growth</h3>
            <p className="text-gray-600">
              Advance your career with opportunities that align with your professional goals.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-lg shadow-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-lg mb-8">Join thousands of job seekers and employers on our platform.</p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Create Your Account Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
