import React, { useEffect, useMemo, useState } from 'react';
import { applicationService } from '../services/api';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

const InterviewCalendar = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getEmployerInterviews();
      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Error loading interview calendar', error);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    return interviews.reduce((acc, item) => {
      const key = item.interviewDate ? new Date(item.interviewDate).toDateString() : 'TBD';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [interviews]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Calendar</h1>
          <p className="text-gray-600 mt-2">Organize your interview schedule in a clear calendar view.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Loading interviews...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">No interview dates have been scheduled yet.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4"><FiCalendar /> {date}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="font-semibold text-gray-900">{item.fullName || item.applicant?.fullName}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.job?.title}</div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-700">
                        <span className="flex items-center gap-1"><FiClock /> {item.interviewTime || 'TBD'}</span>
                        <span className="flex items-center gap-1"><FiMapPin /> {item.interviewMode || 'Online'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCalendar;
