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
      setRecommendations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      await axios.post('/api/recommendations/generate', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Job Recommendations</h1>
            <p className="text-gray-600 mt-2">Smart, personalized matches based on your profile and experience.</p>
          </div>
          <button
            onClick={generateRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate Recommendations
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-600">
            No recommendations yet. Generate a fresh batch to see smart matches.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div key={rec._id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 pr-2">{rec.job?.title}</h3>
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{rec.matchScore}% match</div>
                </div>

                <p className="text-gray-600 mb-2">📍 {rec.job?.location}</p>
                <p className="text-gray-600 mb-4">💼 {rec.job?.jobType}</p>

                {rec.job?.salary && (
                  <p className="text-gray-700 font-semibold mb-4">
                    {rec.job.salary.min} - {rec.job.salary.max} {rec.job.salary.currency}
                  </p>
                )}

                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <p className="text-gray-900">Why this match:</p>
                  <p className="text-gray-600 mt-1">
                    Skills: {rec.matchReason?.skillMatch?.toFixed(0)}% | Experience: {rec.matchReason?.experienceMatch?.toFixed(0)}%
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => markAsViewed(rec._id)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
                    View Job
                  </button>
                  <button onClick={() => saveRecommendation(rec._id)} className={`px-3 py-2 rounded text-sm transition ${rec.isSaved ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    {rec.isSaved ? '❤️ Saved' : '🤍 Save'}
                  </button>
                  <button onClick={() => dismissRecommendation(rec._id)} className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm">
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
