import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiDollarSign, FiChevronLeft } from 'react-icons/fi';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobService.getJob(id);
      setJob(response.data.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.accountType !== 'job_seeker') {
      alert('Only job seekers can apply for jobs');
      return;
    }

    // Navigate to the apply job page
    navigate(`/job/${id}/apply`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiChevronLeft /> Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600">{job.employer?.companyName}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {job.jobType}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-gray-600 text-sm mb-1">Location</p>
              <div className="flex items-center text-gray-900 font-semibold">
                <FiMapPin className="mr-2" /> {job.location}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Salary</p>
              <div className="flex items-center text-gray-900 font-semibold">
                <FiDollarSign className="mr-2" />
                {job.salary?.min > 0 ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.currency} ${job.salary.max.toLocaleString()}` : 'Negotiable'}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Category</p>
              <p className="text-gray-900 font-semibold">{job.category}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Experience</p>
              <p className="text-gray-900 font-semibold">{job.experienceLevel}</p>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-200 w-full md:w-auto"
          >
            Apply Now
          </button>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Job</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company Info</h3>
              <p className="text-gray-700 mb-2">
                <strong>Company:</strong> {job.employer?.companyName}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Contact:</strong> {job.employer?.email}
              </p>
              <p className="text-gray-600 text-sm mb-6">{job.employer?.bio}</p>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <p className="text-gray-600"><strong>Views:</strong> {job.viewCount}</p>
                <p className="text-gray-600"><strong>Applications:</strong> {job.applicationCount}</p>
                <p className="text-gray-600">
                  <strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
