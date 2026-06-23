import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reviews = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!newReview.title.trim() || !newReview.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await axios.post('/api/reviews', {
        targetUserId: userId,
        reviewType: 'employer',
        ...newReview
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setNewReview({ rating: 5, title: '', content: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Error submitting review');
    }
  };

  const markHelpful = async (reviewId, helpful) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`, { helpful }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review:', error);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">{stats.averageRating}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.totalReviews}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
            </div>
            <div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center text-xs">
                    <span className="w-6 text-gray-600 dark:text-gray-400">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded ml-2">
                      <div
                        className="h-full bg-yellow-500 rounded"
                        style={{
                          width: `${stats.ratingBreakdown?.[star] ? (stats.ratingBreakdown[star] / stats.totalReviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Review Form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {showForm ? 'Cancel' : 'Write a Review'}
      </button>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Rating
            </label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} Stars
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Title
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Review
            </label>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              placeholder="Share your detailed experience"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={submitReview}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{review.title}</p>
                  <p className="text-sm text-yellow-500">{renderStars(review.rating)}</p>
                </div>
                <small className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-3">{review.content}</p>
              
              {review.author && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By {review.author.fullName}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => markHelpful(review._id, true)}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  👍 Helpful ({review.helpfulCount})
                </button>
                <button
                  onClick={() => markHelpful(review._id, false)}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  👎 Not helpful ({review.unhelpfulCount})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
