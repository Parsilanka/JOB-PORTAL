import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import DarkModeToggle from './DarkModeToggle';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">JobPortal</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
                <Link to="/search" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Search</Link>
                {user?.accountType === 'job_seeker' && (
                  <>
                    <Link to="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Browse Jobs</Link>
                    <Link to="/applications" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">My Applications</Link>
                    <Link to="/recommendations" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Recommendations</Link>
                    <Link to="/saved-jobs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Saved Jobs</Link>
                  </>
                )}
                {user?.accountType === 'employer' && (
                  <>
                    <Link to="/post-job" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Post Job</Link>
                    <Link to="/my-jobs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">My Jobs</Link>
                    <Link to="/interviews" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Interviews</Link>
                    <Link to="/recruiter-inbox" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Inbox</Link>
                    <Link to="/interview-calendar" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Calendar</Link>
                    <Link to="/hiring-pipeline" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Pipeline</Link>
                  </>
                )}
                {user?.accountType === 'admin' && (
                  <>
                    <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
                    <Link to="/admin/approve-jobs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Approve Jobs</Link>
                    <Link to="/admin/finances" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Finances</Link>
                  </>
                )}
                <Link to="/subscriptions" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Premium</Link>
                <Link to="/analytics" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Analytics</Link>
                <Link to="/messages" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Messages</Link>
                <NotificationBell />
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Profile</Link>
                <DarkModeToggle />
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <FiLogOut /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Browse Jobs</Link>
                <Link to="/search" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Search</Link>
                <DarkModeToggle />
                <Link to="/login" className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800">Login</Link>
                <Link to="/register" className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center space-x-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isAuthenticated && <NotificationBell />}
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 bg-gray-50 dark:bg-gray-700">
            <Link to="/" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Home</Link>
            <Link to="/search" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Search</Link>
            {isAuthenticated ? (
              <>
                {user?.accountType === 'job_seeker' && (
                  <>
                    <Link to="/jobs" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Browse Jobs</Link>
                    <Link to="/applications" className="block py-2 px-4 text-gray-700 dark:text-gray-300">My Applications</Link>
                    <Link to="/recommendations" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Recommendations</Link>
                    <Link to="/saved-jobs" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Saved Jobs</Link>
                  </>
                )}
                {user?.accountType === 'employer' && (
                  <>
                    <Link to="/post-job" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Post Job</Link>
                    <Link to="/my-jobs" className="block py-2 px-4 text-gray-700 dark:text-gray-300">My Jobs</Link>
                    <Link to="/interviews" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Interviews</Link>
                    <Link to="/recruiter-inbox" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Inbox</Link>
                    <Link to="/interview-calendar" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Calendar</Link>
                    <Link to="/hiring-pipeline" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Pipeline</Link>
                  </>
                )}
                {user?.accountType === 'admin' && (
                  <>
                    <Link to="/admin" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Dashboard</Link>
                    <Link to="/admin/approve-jobs" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Approve Jobs</Link>
                    <Link to="/admin/finances" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Finances</Link>
                  </>
                )}
                <Link to="/subscriptions" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Premium Plans</Link>
                <Link to="/analytics" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Analytics</Link>
                <Link to="/messages" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Messages</Link>
                <Link to="/notifications" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Notifications</Link>
                <Link to="/profile" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Profile</Link>
                <button
                  onClick={logout}
                  className="block w-full text-left py-2 px-4 text-red-600 dark:text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Login</Link>
                <Link to="/register" className="block py-2 px-4 text-gray-700 dark:text-gray-300">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
