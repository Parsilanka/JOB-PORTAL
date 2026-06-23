import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">JobPortal</h3>
            <p className="text-gray-400">
              Find your dream job or hire top talent with our comprehensive job portal platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-white">Post Job</a></li>
              <li><a href="#" className="hover:text-white">For Employers</a></li>
              <li><a href="#" className="hover:text-white">For Job Seekers</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="space-y-2 text-gray-400">
              <p><a href="#" className="hover:text-white">Twitter</a></p>
              <p><a href="#" className="hover:text-white">LinkedIn</a></p>
              <p><a href="#" className="hover:text-white">Facebook</a></p>
              <p><a href="#" className="hover:text-white">Instagram</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 JobPortal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
