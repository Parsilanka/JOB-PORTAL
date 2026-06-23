import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [metricsRes, monthlyRes, comparisonRes] = await Promise.all([

        axios.get('/api/analytics/dashboard/metrics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/analytics/monthly/data', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/analytics/performance/comparison', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setMetrics(metricsRes.data.data);
      setMonthlyData(monthlyRes.data.data);
      setComparison(comparisonRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Analytics Dashboard</h1>

        {/* Main Stats */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.user?.accountType === 'job_seeker' ? (
              <>
                <StatCard
                  title="Applications"
                  value={metrics.stats.totalApplications}
                  icon="📋"
                  color="text-blue-500"
                />
                <StatCard
                  title="Success Rate"
                  value={`${metrics.stats.successRate}%`}
                  icon="✅"
                  color="text-green-500"
                />
                <StatCard
                  title="Profile Views"
                  value={metrics.stats.profileViews}
                  icon="👁️"
                  color="text-purple-500"
                />
                <StatCard
                  title="Avg Response Time"
                  value={`${metrics.stats.averageResponseTime}h`}
                  icon="⏱️"
                  color="text-yellow-500"
                />
              </>
            ) : (
              <>
                <StatCard
                  title="Jobs Posted"
                  value={metrics.stats.totalJobsPosted}
                  icon="📌"
                  color="text-blue-500"
                />
                <StatCard
                  title="Applications"
                  value={metrics.stats.totalApplicationsReceived}
                  icon="📨"
                  color="text-green-500"
                />
                <StatCard
                  title="Rating"
                  value={metrics.stats.averageRating}
                  icon="⭐"
                  color="text-yellow-500"
                />
                <StatCard
                  title="Total Reviews"
                  value={metrics.stats.totalReviews}
                  icon="💬"
                  color="text-purple-500"
                />
              </>
            )}
          </div>
        )}

        {/* Performance Comparison */}
        {comparison && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance vs Benchmark</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(comparison.userStats).map(([key, value]) => {
                const benchmarkValue = comparison.benchmarkStats[key];
                const performance = comparison.performance[`${key}VsBenchmark`] || 0;
                
                return (
                  <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="capitalize font-semibold text-gray-900 dark:text-white mb-2">{key}</p>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Your: {value}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Benchmark: {benchmarkValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded">
                      <div
                        className={`h-full rounded ${performance >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.min(performance, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 ${performance >= 100 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {performance.toFixed(0)}% of benchmark
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Trends */}
        {monthlyData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Monthly Trends</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-gray-900 dark:text-white">Month</th>
                    <th className="text-right py-2 px-2 text-gray-900 dark:text-white">Applications</th>
                    <th className="text-right py-2 px-2 text-gray-900 dark:text-white">Hires</th>
                    <th className="text-right py-2 px-2 text-gray-900 dark:text-white">Jobs Posted</th>
                    <th className="text-right py-2 px-2 text-gray-900 dark:text-white">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-2 text-gray-900 dark:text-white">{month.month}</td>
                      <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{month.applications || 0}</td>
                      <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{month.hires || 0}</td>
                      <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{month.jobsPosted || 0}</td>
                      <td className="text-right py-2 px-2 text-gray-900 dark:text-white">
                        {month.earnings ? `$${month.earnings}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
