import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { userService } from '../services/api';
import { FiMail, FiPhone, FiMapPin, FiEdit, FiAward } from 'react-icons/fi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchBadges();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserProfile();
      setProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/api/badges/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBadges(response.data.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <a
            href="/edit-profile"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiEdit className="mr-2" /> Edit Profile
          </a>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start space-x-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.fullName}</h2>
              <p className="text-gray-600 mb-4">
                {profile.accountType === 'job_seeker' ? 'Job Seeker' : 'Employer'}
              </p>

              <div className="space-y-2 text-gray-700">
                <div className="flex items-center">
                  <FiMail className="mr-3 text-blue-600" /> {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center">
                    <FiPhone className="mr-3 text-blue-600" /> {profile.phone}
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center">
                    <FiMapPin className="mr-3 text-blue-600" /> {profile.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {badges && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiAward className="text-yellow-500" /> {badges.points} points
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.badges.map((badge) => (
                <div key={badge.key} className="rounded-full border border-yellow-400 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
                  {badge.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Job Seeker Specific */}
        {profile.accountType === 'job_seeker' && (
          <>
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Experience</h3>
                <div className="space-y-4">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold text-gray-900">{exp.jobTitle}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - 
                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                      </p>
                      {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Education</h3>
                <div className="space-y-4">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="border-l-4 border-green-600 pl-4">
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600">{edu.institution}</p>
                      {edu.field && <p className="text-sm text-gray-500">Field: {edu.field}</p>}
                      {edu.graduationYear && <p className="text-sm text-gray-500">Graduated: {edu.graduationYear}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Employer Specific */}
        {profile.accountType === 'employer' && profile.companyName && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Company</h3>
            <p className="text-gray-700">{profile.companyName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
