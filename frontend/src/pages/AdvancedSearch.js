import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdvancedSearch = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    category: '',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    experience: '',
    sortBy: 'createdAt',
    sortOrder: -1,
    page: 1
  });

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/jobs/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/jobs/locations');
      setLocations(response.data.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const searchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'skills') {
            params.append(key, value.split(',').map(s => s.trim()));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axios.get(`/api/jobs/search?${params}`);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Advanced Job Search</h1>

        {/* Search Filters */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Keyword */}
            <input
              type="text"
              placeholder="Job title or keyword"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            {/* Location */}
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Job Type */}
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Salary Min */}
            <input
              type="number"
              placeholder="Min Salary"
              value={filters.salaryMin}
              onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            {/* Salary Max */}
            <input
              type="number"
              placeholder="Max Salary"
              value={filters.salaryMax}
              onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            {/* Skills */}
            <input
              type="text"
              placeholder="Skills (comma-separated)"
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            {/* Experience */}
            <input
              type="number"
              placeholder="Years of experience"
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="createdAt">Newest</option>
              <option value="salary.max">Highest Salary</option>
              <option value="title">Alphabetical</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={-1}>Descending</option>
              <option value={1}>Ascending</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Jobs'}
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Searching...</p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Found {pagination.total} job{pagination.total !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {job.postedBy?.companyName}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    📍 {job.location}
                  </p>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {job.salary && (
                    <p className="font-semibold text-gray-900 dark:text-white mb-4">
                      {job.salary.min} - {job.salary.max} {job.salary.currency}
                    </p>
                  )}

                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handleFilterChange('page', i + 1)}
                    className={`px-3 py-1 rounded ${
                      filters.page === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
