import React, { useState, useEffect } from 'react';
import { jobService, applicationService } from '../services/api';
import { FiBriefcase, FiUsers, FiEdit, FiTrash2 } from 'react-icons/fi';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getEmployerJobs();
      setJobs(response.data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = async (jobId) => {
    try {
      const response = await applicationService.getJobApplications(jobId);
      setApplications(response.data.data);
      setSelectedJob(jobId);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
        alert('Job deleted successfully');
      } catch (error) {
        alert('Error deleting job');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-600">Manage your job postings</p>
          </div>
          <a
            href="/post-job"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Post New Job
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <FiBriefcase className="mr-2" />
                      {job.title}
                    </h3>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center">
                    <FiUsers className="mr-2" />
                    <span>{job.applicationCount} applications</span>
                  </div>
                  <div>Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
                  <div>Views: {job.viewCount}</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewApplications(job._id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Applications
                  </button>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center">
                    <FiEdit className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
                  >
                    <FiTrash2 className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
            <a href="/post-job" className="text-blue-600 hover:text-blue-700 font-semibold">
              Post your first job
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
