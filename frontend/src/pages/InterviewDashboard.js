import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/api';
import { FiCalendar, FiClock, FiExternalLink } from 'react-icons/fi';

const InterviewDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getEmployerInterviews();
        setInterviews(response.data.data);
      } catch (err) {
        console.error('Error loading interviews:', err);
        setError('Unable to load interview dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Interview Dashboard</h1>
            <p className="text-gray-600">View all scheduled interviews for your job applicants.</p>
          </div>
          <Link
            to="/my-jobs"
            className="inline-flex items-center rounded-lg border border-blue-600 bg-white px-5 py-3 text-blue-600 hover:bg-blue-50"
          >
            <FiExternalLink className="mr-2" /> Back to My Jobs
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading interviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-4 rounded-lg">
            {error}
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No scheduled interviews yet.</p>
            <p className="mt-2">Schedule interviews from the My Jobs page.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {interviews.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{application.fullName || application.applicant?.fullName}</h2>
                    <p className="text-gray-600">{application.email || application.applicant?.email}</p>
                    <p className="text-gray-600">{application.phone || application.applicant?.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {application.job?.title || 'Job'}
                    </span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm text-gray-700">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FiCalendar /> <span className="font-semibold">Date</span>
                    </div>
                    <p>{application.interviewDate ? new Date(application.interviewDate).toLocaleDateString() : 'TBA'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FiClock /> <span className="font-semibold">Time</span>
                    </div>
                    <p>{application.interviewTime || 'TBA'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="font-semibold">Mode</span>
                    </div>
                    <p>{application.interviewMode || 'TBA'}</p>
                  </div>
                </div>

                {application.interviewLink && (
                  <div className="mt-4 text-sm text-gray-700">
                    <p className="font-semibold">Link / Location</p>
                    <a href={application.interviewLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                      {application.interviewLink}
                    </a>
                  </div>
                )}

                {application.interviewNotes && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-semibold mb-1">Notes</p>
                    <p>{application.interviewNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDashboard;
