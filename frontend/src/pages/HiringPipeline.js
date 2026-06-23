import React, { useEffect, useMemo, useState } from 'react';
import { applicationService } from '../services/api';
import { FiBriefcase, FiUser, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const PIPELINE_STAGES = [
  { key: 'pending', title: 'New Applicants', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'reviewed', title: 'Reviewed', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { key: 'shortlisted', title: 'Shortlisted', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'accepted', title: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200' },
  { key: 'rejected', title: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' }
];

const HiringPipeline = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getEmployerApplications();
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error loading pipeline', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedApplications = useMemo(() => {
    const groups = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.key, []]));
    applications.forEach((application) => {
      const status = application.status || 'pending';
      if (groups[status]) {
        groups[status].push(application);
      } else {
        groups.pending.push(application);
      }
    });
    return groups;
  }, [applications]);

  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await applicationService.updateApplicationStatus(applicationId, { status });
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application', error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hiring Pipeline</h1>
          <p className="text-gray-600 mt-2">Track applicants from first review to final hire in a single board.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Loading applications...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-5 lg:grid-cols-2">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className={`px-4 py-3 border-b ${stage.color}`}> 
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{stage.title}</h2>
                    <span className="text-sm">{groupedApplications[stage.key]?.length || 0}</span>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[220px]">
                  {groupedApplications[stage.key]?.length ? groupedApplications[stage.key].map((app) => (
                    <div key={app._id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{app.applicant?.fullName || app.fullName}</p>
                          <p className="text-sm text-gray-600">{app.job?.title || 'Role'}</p>
                        </div>
                        <div className="text-gray-500"><FiUser /></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 flex items-center gap-2"><FiBriefcase /> {app.job?.location || 'Location'}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {stage.key !== 'accepted' && (
                          <button onClick={() => updateStatus(app._id, 'accepted')} className="text-xs px-2 py-1 bg-green-600 text-white rounded" disabled={updatingId === app._id}>
                            <FiCheckCircle className="inline mr-1" />Accept
                          </button>
                        )}
                        {stage.key !== 'shortlisted' && (
                          <button onClick={() => updateStatus(app._id, 'shortlisted')} className="text-xs px-2 py-1 bg-purple-600 text-white rounded" disabled={updatingId === app._id}>
                            <FiClock className="inline mr-1" />Shortlist
                          </button>
                        )}
                        {stage.key !== 'rejected' && (
                          <button onClick={() => updateStatus(app._id, 'rejected')} className="text-xs px-2 py-1 bg-red-600 text-white rounded" disabled={updatingId === app._id}>
                            <FiXCircle className="inline mr-1" />Reject
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 p-2">No applications in this stage.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringPipeline;
