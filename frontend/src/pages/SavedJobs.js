import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { savedJobService } from '../services/api';
import { FiBriefcase, FiMapPin, FiTrash2, FiBookmark } from 'react-icons/fi';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      const response = await savedJobService.getSavedJobs();
      setSavedJobs(response.data.data || []);
    } catch (error) {
      console.error('Error loading saved jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await savedJobService.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job?._id !== jobId));
    } catch (error) {
      console.error('Error removing saved job', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-600 mt-2">Keep track of opportunities you want to revisit.</p>
          </div>
          <div className="bg-white px-4 py-3 rounded-full shadow-sm text-sm font-semibold text-blue-700 flex items-center gap-2">
            <FiBookmark /> {savedJobs.length} saved
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Loading your saved roles...</div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-800">No saved jobs yet</h2>
            <p className="text-gray-600 mt-2">Bookmark jobs from the browse page to build a shortlist.</p>
            <Link to="/jobs" className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Explore jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {savedJobs.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{item.job?.title}</h2>
                    <p className="text-gray-600 mt-1">{item.job?.employer?.companyName || 'Company'}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.job?._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                    title="Remove saved job"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><FiMapPin /> {item.job?.location}</div>
                  <div className="flex items-center gap-2"><FiBriefcase /> {item.job?.category}</div>
                </div>

                <div className="mt-5 flex justify-between items-center">
                  <Link to={`/job/${item.job?._id}`} className="text-blue-600 font-semibold hover:underline">
                    View details
                  </Link>
                  <span className="text-sm text-gray-500">{item.job?.jobType}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
