import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Contact</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">Get in touch</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Have a question about jobs, employer services, or your account? Our support team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact details</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <FiMail className="mt-1 text-blue-600" />
                  <span>
                    <span className="block font-medium text-gray-900">Email</span>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=lemaiyansamuel901@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      lemaiyansamuel901@gmail.com
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiPhone className="mt-1 text-blue-600" />
                  <span>
                    <span className="block font-medium text-gray-900">Phone</span>
                    <a href="tel:+254700000000" className="text-blue-600 hover:text-blue-700">
                      +254 700 000 000
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiMapPin className="mt-1 text-blue-600" />
                  <span>
                    <span className="block font-medium text-gray-900">Office</span>
                    <span>Nairobi, Kenya</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiClock className="mt-1 text-blue-600" />
                  <span>
                    <span className="block font-medium text-gray-900">Support hours</span>
                    <span>Mon–Fri, 8:00 AM – 6:00 PM</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>

            {submitted && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                Thanks for reaching out! Your message has been received and our team will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <FiSend className="mr-2" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
