import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiMapPin, FiDollarSign, FiBookmark } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { savedJobService } from '../services/api';

const JobCard = ({ job }) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const response = await savedJobService.getSavedJobs();
        const ids = (response.data.data || []).map((item) => item.job?._id);
        setSaved(ids.includes(job._id));
      } catch (error) {
        console.error('Error checking save status', error);
      }
    };

    checkSaved();
  }, [job._id]);

  const handleToggleSaved = async (e) => {
    e.preventDefault();
    try {
      const response = await savedJobService.toggleSavedJob(job._id);
      setSaved(response.data.saved);
    } catch (error) {
      console.error('Error toggling saved job', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
            <p className="text-gray-600">{job.employer?.companyName || 'Company'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {job.jobType}
            </span>
            <button
              onClick={handleToggleSaved}
              className={`p-2 rounded-full ${saved ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              title={saved ? 'Remove from saved jobs' : 'Save job'}
            >
              <FiBookmark />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <FiMapPin className="mr-2" /> {job.location}
          </div>
          {job.salary?.min > 0 && (
            <div className="flex items-center text-gray-600">
              <FiDollarSign className="mr-2" />
              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.currency} {job.salary.max.toLocaleString()}
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <FiBriefcase className="mr-2" /> {job.category}
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description}</p>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {job.skills?.slice(0, 2).map((skill, idx) => (
              <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">
              {job.applicationCount} applications
            </span>
            <Link to={`/job/${job._id}`} className="text-blue-600 font-semibold hover:underline text-sm">
              View details
            </Link>
          </div>
        </div>
      </div>
  );
};

export default JobCard;
