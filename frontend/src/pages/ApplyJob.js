import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService, applicationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiChevronLeft, FiUpload } from 'react-icons/fi';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPosition: '',
    experience: '',
    coverLetter: '',
    cv: null
  });

  const [cvFileName, setCvFileName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.accountType !== 'job_seeker') {
      alert('Only job seekers can apply for jobs');
      navigate('/');
      return;
    }

    fetchJob();
  }, [jobId, isAuthenticated, user, navigate]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJob(jobId);
      setJob(response.data.data);
      setFormData(prev => ({
        ...prev,
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }));
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('CV file size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        cv: file
      }));
      setCvFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const applicationData = new FormData();
      applicationData.append('jobId', jobId);
      applicationData.append('fullName', formData.fullName);
      applicationData.append('email', formData.email);
      applicationData.append('phone', formData.phone);
      applicationData.append('currentPosition', formData.currentPosition);
      applicationData.append('experience', formData.experience);
      applicationData.append('coverLetter', formData.coverLetter);
      
      if (formData.cv) {
        applicationData.append('cv', formData.cv);
      }

      const response = await applicationService.applyForJob(applicationData);
      const applicationId = response.data.data._id;

      // Redirect to payment page
      navigate(`/application-payment/${applicationId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
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
          onClick={() => navigate(`/job/${jobId}`)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiChevronLeft /> Back to Job
        </button>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded-lg mb-6">
            <p className="font-semibold">Application submitted successfully!</p>
            <p className="text-sm">Redirecting to your applications...</p>
          </div>
        )}

        {/* Job Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
          <p className="text-gray-600 text-lg mb-4">{job.employer?.companyName}</p>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <p>{job.location}</p>
            <p>•</p>
            <p>
              {job.salary?.currency || 'Ksh'} {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}
            </p>
            <p>•</p>
            <p>{job.jobType}</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Form</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+254 712 345 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                  <input
                    type="text"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Developer"
                  />
                </div>
              </div>
            </div>

            {/* Experience and Skills */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5 years in software development"
                />
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us why you're interested in this position *
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your motivation, relevant experiences, and why you're a great fit for this role..."
              />
            </div>

            {/* CV Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume/CV</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiUpload className="mx-auto text-gray-400 mb-2" size={40} />
                <label className="block">
                  <span className="sr-only">Choose CV file</span>
                  <input
                    type="file"
                    name="cv"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
                <p className="text-sm text-gray-600 mt-2">
                  PDF, DOC, DOCX, or TXT (Max 5MB)
                </p>
                {cvFileName && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {cvFileName}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/job/${jobId}`)}
                className="flex-1 bg-white text-blue-600 border border-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
