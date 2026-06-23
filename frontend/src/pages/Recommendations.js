import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/recommendations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecommendations(response.data.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (recommendationId) => {
    try {
      await axios.patch(`/api/recommendations/${recommendationId}/viewed`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRecommendations();
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const saveRecommendation = async (recommendationId) => {
    try {
      await axios.patch(`/api/recommendations/${recommendationId}/save`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRecommendations();
    } catch (error) {
      console.error('Error saving recommendation:', error);
    }
  };

  const dismissRecommendation = async (recommendationId) => {
    try {
      await axios.patch(`/api/recommendations/${recommendationId}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Job Recommendations</h1>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No recommendations yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
              >
                {/* Match Score */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-2">
                    {rec.job?.title}
                  </h3>
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {rec.matchScore}% match
                  </div>
                </div>

                {/* Job Details */}
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  📍 {rec.job?.location}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  💼 {rec.job?.jobType}
                </p>

                {/* Salary */}
                {rec.job?.salary && (
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">
                    {rec.job.salary.min} - {rec.job.salary.max} {rec.job.salary.currency}
                  </p>
                )}

                {/* Match Breakdown */}
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  <p className="text-gray-900 dark:text-white">Match Breakdown:</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Skills: {rec.matchReason?.skillMatch?.toFixed(0)}% | 
                    Experience: {rec.matchReason?.experienceMatch?.toFixed(0)}%
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => markAsViewed(rec._id)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                  >
                    View Job
                  </button>
                  <button
                    onClick={() => saveRecommendation(rec._id)}
                    className={`px-3 py-2 rounded text-sm transition ${
                      rec.isSaved
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {rec.isSaved ? '❤️ Saved' : '🤍 Save'}
                  </button>
                  <button
                    onClick={() => dismissRecommendation(rec._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
