import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeInitializer from './components/ThemeInitializer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import MyJobs from './pages/MyJobs';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminDashboard from './pages/AdminDashboard';
import ScheduleInterview from './pages/ScheduleInterview';
import InterviewDashboard from './pages/InterviewDashboard';
import AdminJobApproval from './pages/AdminJobApproval';
import AdminFinancialDashboard from './pages/AdminFinancialDashboard';
import SubscriptionPlans from './pages/SubscriptionPlans';
import ApplicationPayment from './pages/ApplicationPayment';
import JobPostingPayment from './pages/JobPostingPayment';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import AdvancedSearch from './pages/AdvancedSearch';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeInitializer />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route
                path="/job/:jobId/apply"
                element={
                  <PrivateRoute requiredRole="job_seeker">
                    <ApplyJob />
                  </PrivateRoute>
                }
              />

              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password/:resetToken"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />

              {/* Protected Job Seeker Routes */}
              <Route
                path="/applications"
                element={
                  <PrivateRoute requiredRole="job_seeker">
                    <MyApplications />
                  </PrivateRoute>
                }
              />

              {/* Protected Employer Routes */}
              <Route
                path="/my-jobs"
                element={
                  <PrivateRoute requiredRole="employer">
                    <MyJobs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <PrivateRoute requiredRole="employer">
                    <PostJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/applications/:id/schedule"
                element={
                  <PrivateRoute requiredRole="employer">
                    <ScheduleInterview />
                  </PrivateRoute>
                }
              />
              <Route
                path="/interviews"
                element={
                  <PrivateRoute requiredRole="employer">
                    <InterviewDashboard />
                  </PrivateRoute>
                }
              />

              {/* Protected User Routes */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/approve-jobs"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminJobApproval />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/finances"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminFinancialDashboard />
                  </PrivateRoute>
                }
              />

              {/* Public Subscription Routes */}
              <Route path="/subscriptions" element={<SubscriptionPlans />} />

              {/* New Features Routes */}
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <PrivateRoute requiredRole="job_seeker">
                    <Recommendations />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/search"
                element={<AdvancedSearch />}
              />

              {/* Protected Payment Routes */}
              <Route
                path="/application-payment/:applicationId"
                element={
                  <PrivateRoute requiredRole="job_seeker">
                    <ApplicationPayment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/job-posting-payment"
                element={
                  <PrivateRoute requiredRole="employer">
                    <JobPostingPayment />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
