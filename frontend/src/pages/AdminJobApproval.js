import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const AdminJobApproval = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/jobs/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingJobs(response.data.data);
    } catch (err) {
      setError('Failed to load pending jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (jobId, isApproved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/jobs/${jobId}/approve`,
        {
          adminApproved: isApproved,
          approvalNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApprovalNotes('');
      setSelectedJob(null);
      fetchPendingJobs();
    } catch (err) {
      alert('Failed to update job approval');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Job Approval Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and approve job postings before they go live</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {pendingJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiCheckCircle className="mx-auto text-5xl text-green-500 mb-4" />
            <p className="text-gray-600">No pending jobs to approve</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.employer?.companyName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedJob(job._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <FiCheckCircle className="inline mr-2" /> Approve
                    </button>
                    <button
                      onClick={() => approveJob(job._id, false)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <FiXCircle className="inline mr-2" /> Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Job Type</p>
                    <p className="font-semibold">{job.jobType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Salary Range</p>
                    <p className="font-semibold">KES {job.salary?.min || 0} - {job.salary?.max || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience Level</p>
                    <p className="font-semibold">{job.experienceLevel}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-800">{job.description?.substring(0, 200)}...</p>
                </div>

                {selectedJob === job._id && (
                  <div className="bg-gray-100 p-4 rounded mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Notes (Optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Add notes for the employer..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => approveJob(job._id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Confirm Approval
                      </button>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
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

export default AdminJobApproval;
