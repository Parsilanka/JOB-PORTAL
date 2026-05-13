import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getSeekerApplications();
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FiCheckCircle className="text-green-600" />;
      case 'rejected':
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiClock className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600 mb-8">Track and manage your job applications</p>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading applications...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <FiBriefcase className="mr-2" />
                      {app.job?.title || 'Job Title'}
                    </h3>
                    <p className="text-gray-600">{app.job?.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(app.status)}
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <div>
                    <p className="font-semibold">Applied</p>
                    <p>{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  {app.reviewedAt && (
                    <div>
                      <p className="font-semibold">Reviewed</p>
                      <p>{new Date(app.reviewedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {app.rating && (
                    <div>
                      <p className="font-semibold">Rating</p>
                      <p>{'⭐'.repeat(app.rating)}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Salary</p>
                    <p>{app.job?.salary?.min ? `${app.job?.salary?.currency || 'Ksh'} ${app.job?.salary?.min}` : 'N/A'}</p>
                  </div>
                </div>

                {app.comments && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <p className="font-semibold text-gray-900 mb-2">Employer Comments</p>
                    <p className="text-gray-700">{app.comments}</p>
                  </div>
                )}

                {(app.interviewDate || app.interviewLink || app.interviewNotes) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded">
                    <h3 className="font-semibold text-gray-900 mb-3">Interview Details</h3>
                    {app.interviewDate && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Date:</span> {new Date(app.interviewDate).toLocaleDateString()}
                      </p>
                    )}
                    {app.interviewTime && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Time:</span> {app.interviewTime}
                      </p>
                    )}
                    {app.interviewMode && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Mode:</span> {app.interviewMode}
                      </p>
                    )}
                    {app.interviewLink && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Link:</span>{' '}
                        <a href={app.interviewLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                          {app.interviewLink}
                        </a>
                      </p>
                    )}
                    {app.interviewNotes && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Notes:</span> {app.interviewNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't applied for any jobs yet</p>
            <a href="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold">
              Browse available jobs
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
