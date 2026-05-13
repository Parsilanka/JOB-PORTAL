import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationService, getResumeUrl } from '../services/api';
import { FiChevronLeft, FiCalendar, FiClock, FiLink, FiEdit3, FiFileText } from 'react-icons/fi';

const ScheduleInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewMode: 'Zoom',
    interviewLink: '',
    interviewNotes: ''
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getApplication(id);
        setApplication(response.data.data);
        setFormData((prev) => ({
          ...prev,
          interviewDate: response.data.data.interviewDate || '',
          interviewTime: response.data.data.interviewTime || '',
          interviewMode: response.data.data.interviewMode || 'Zoom',
          interviewLink: response.data.data.interviewLink || '',
          interviewNotes: response.data.data.interviewNotes || ''
        }));
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Unable to load application details.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await applicationService.updateApplicationStatus(id, {
        status: 'shortlisted',
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        interviewMode: formData.interviewMode,
        interviewLink: formData.interviewLink,
        interviewNotes: formData.interviewNotes
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/interviews');
      }, 2000);
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading interview details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Application not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/my-jobs')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiChevronLeft className="mr-2" /> Back to My Jobs
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Schedule Interview</h1>
          <p className="text-gray-600 mb-6">Use this form to schedule an interview for the selected applicant.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Applicant</p>
              <p className="text-lg font-semibold text-gray-900">{application.fullName || application.applicant?.fullName}</p>
              <p className="text-sm text-gray-600">{application.email || application.applicant?.email}</p>
              <p className="text-sm text-gray-600">{application.phone || application.applicant?.phone}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Job</p>
              <p className="text-lg font-semibold text-gray-900">{application.job?.title || 'Job title'}</p>
              <p className="text-sm text-gray-600">{application.job?.location}</p>
              <p className="text-sm text-gray-600">Status: {application.status}</p>
            </div>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
              Interview scheduled successfully. Returning to My Jobs...
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-blue-600" /> Interview Date
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="date"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiClock className="text-blue-600" /> Interview Time
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="time"
                    name="interviewTime"
                    value={formData.interviewTime}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiEdit3 className="text-blue-600" /> Interview Mode
              </label>
              <div className="relative rounded-md shadow-sm">
                <select
                  name="interviewMode"
                  value={formData.interviewMode}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option>Zoom</option>
                  <option>Phone</option>
                  <option>In-person</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiLink className="text-blue-600" /> Interview Link / Location
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="interviewLink"
                  value={formData.interviewLink}
                  onChange={handleChange}
                  placeholder="Zoom link, phone number, or address"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiEdit3 className="text-blue-600" /> Notes
              </label>
              <textarea
                name="interviewNotes"
                value={formData.interviewNotes}
                onChange={handleChange}
                rows="4"
                placeholder="Any instructions or notes for the candidate"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/interviews')}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {application.resume && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <FiFileText />
                <span className="font-semibold">Applicant Resume</span>
              </div>
              <a
                href={getResumeUrl(application.resume)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View resume
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterview;
