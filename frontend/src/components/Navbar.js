import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">JobPortal</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                {user?.accountType === 'job_seeker' && (
                  <>
                    <Link to="/jobs" className="text-gray-700 hover:text-blue-600">Browse Jobs</Link>
                    <Link to="/applications" className="text-gray-700 hover:text-blue-600">My Applications</Link>
                  </>
                )}
                {user?.accountType === 'employer' && (
                  <>
                    <Link to="/post-job" className="text-gray-700 hover:text-blue-600">Post Job</Link>
                    <Link to="/my-jobs" className="text-gray-700 hover:text-blue-600">My Jobs</Link>
                  </>
                )}
                {user?.accountType === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600">Admin Panel</Link>
                )}
                <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <FiLogOut /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/jobs" className="text-gray-700 hover:text-blue-600">Browse Jobs</Link>
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</Link>
                <Link to="/register" className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 text-gray-700">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2 text-gray-700">Profile</Link>
                <button
                  onClick={logout}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700">Login</Link>
                <Link to="/register" className="block py-2 text-gray-700">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
