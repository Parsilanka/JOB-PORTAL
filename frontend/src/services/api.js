import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTH SERVICES =====
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.get('/auth/logout')
};

// ===== JOB SERVICES =====
export const jobService = {
  getAllJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (data) => API.post('/jobs', data),
  updateJob: (id, data) => API.put(`/jobs/${id}`, data),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
  getEmployerJobs: () => API.get('/jobs/employer/me'),
  searchJobs: (search) => API.get('/jobs', { params: { search } })
};

// ===== APPLICATION SERVICES =====
export const applicationService = {
  applyForJob: (data) => {
    // If data is FormData (has file), create a new config without Content-Type
    if (data instanceof FormData) {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return axios.post(`${API.defaults.baseURL}/applications`, data, config);
    }
    return API.post('/applications', data);
  },
  getSeekerApplications: () => API.get('/applications/seeker/my'),
  getEmployerApplications: () => API.get('/applications/employer/all'),
  getEmployerInterviews: () => API.get('/applications/employer/interviews'),
  getJobApplications: (jobId) => API.get(`/applications/job/${jobId}`),
  getApplication: (id) => API.get(`/applications/${id}`),
  updateApplicationStatus: (id, data) => API.put(`/applications/${id}`, data)
};

export const getResumeUrl = (resumePath) => {
  if (!resumePath) return '';
  if (resumePath.startsWith('http')) return resumePath;
  return API.defaults.baseURL.replace(/\/api$/, '') + resumePath;
};

// ===== USER SERVICES =====
export const userService = {
  getUserProfile: () => API.get('/users/profile'),
  updateUserProfile: (data) => API.put('/users/profile', data),
  getUser: (id) => API.get(`/users/${id}`),
  getAllEmployers: () => API.get('/users/employers/all')
};

// ===== ADMIN SERVICES =====
export const adminService = {
  getDashboardStats: () => API.get('/admin/stats'),
  getAllUsers: (params) => API.get('/admin/users', { params }),
  approveUser: (id, data) => API.put(`/admin/users/${id}/approve`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAllJobs: (params) => API.get('/admin/jobs', { params }),
  updateJobStatus: (id, data) => API.put(`/admin/jobs/${id}`, data)
};

export default API;
