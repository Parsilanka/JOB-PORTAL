# API Documentation - Job Portal

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "accountType": "job_seeker", // or "employer"
  "phone": "+1234567890",
  "companyName": "Tech Corp" // only for employers
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {...}
}
```

### Login
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGc...",
  "user": {...}
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {...user data...}
}
```

---

## Job Endpoints

### Get All Jobs (with filters)
```
GET /jobs?search=developer&location=New York&category=IT&jobType=Full-time&page=1&limit=10

Response (200):
{
  "success": true,
  "count": 10,
  "total": 150,
  "pages": 15,
  "currentPage": 1,
  "data": [
    {
      "_id": "...",
      "title": "Senior React Developer",
      "location": "New York",
      "salary": {min: 100000, max: 150000},
      ...
    }
  ]
}
```

### Get Single Job
```
GET /jobs/:jobId

Response (200):
{
  "success": true,
  "data": {...job details...}
}
```

### Create Job (Employer only)
```
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "location": "New York, NY",
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "KES"
  },
  "jobType": "Full-time",
  "category": "IT",
  "requirements": ["5+ years experience", "React expertise"],
  "skills": ["React", "JavaScript", "CSS"],
  "experienceLevel": "Senior",
  "deadline": "2024-12-31"
}

Response (201):
{
  "success": true,
  "message": "Job created successfully",
  "data": {...job details...}
}
```

### Update Job (Employer only)
```
PUT /jobs/:jobId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "title": "Updated title",
  // ... other fields to update
}

Response (200):
{
  "success": true,
  "message": "Job updated successfully",
  "data": {...updated job...}
}
```

### Delete Job (Employer only)
```
DELETE /jobs/:jobId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Application Endpoints

### Apply for Job
```
POST /applications
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "jobId": "...",
  "resume": "resume content or URL",
  "coverLetter": "optional cover letter"
}

Response (201):
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {...application details...}
}
```

### Get My Applications (Job Seeker)
```
GET /applications/seeker/my
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "job": {...job details...},
      "status": "pending",
      "appliedAt": "2024-01-15T10:30:00Z",
      ...
    }
  ]
}
```

### Get Employer Applications
```
GET /applications/employer/all
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 15,
  "data": [...]
}
```

### Get Applications for Specific Job
```
GET /applications/job/:jobId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Update Application Status (Employer)
```
PUT /applications/:applicationId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "status": "reviewed" // pending, reviewed, shortlisted, rejected, accepted
}

Response (200):
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {...updated application...}
}
```

---

## User Endpoints

### Get User Profile
```
GET /users/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {...user data...}
}
```

### Update User Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "fullName": "Updated Name",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "bio": "Experienced developer",
  "skills": ["React", "JavaScript", "Node.js"],
  // ... other fields
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {...updated user...}
}
```

### Get User by ID
```
GET /users/:userId

Response (200):
{
  "success": true,
  "data": {...user profile...}
}
```

### Get All Employers
```
GET /users/employers/all

Response (200):
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

---

## Admin Endpoints

### Get Dashboard Statistics
```
GET /admin/stats
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalJobSeekers": 800,
    "totalEmployers": 200,
    "totalJobs": 150,
    "activeJobs": 120,
    "totalApplications": 5000,
    "applicationStats": [...]
  }
}
```

### Get All Users
```
GET /admin/users?accountType=job_seeker&page=1&limit=10
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "count": 10,
  "total": 800,
  "pages": 80,
  "data": [...]
}
```

### Approve/Reject User
```
PUT /admin/users/:userId/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

Request Body:
{
  "isApproved": true // or false
}

Response (200):
{
  "success": true,
  "message": "User approved successfully",
  "data": {...updated user...}
}
```

### Delete User
```
DELETE /admin/users/:userId
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get All Jobs (Admin View)
```
GET /admin/jobs?status=active&page=1&limit=10
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "count": 10,
  "total": 150,
  "pages": 15,
  "data": [...]
}
```

### Update Job Status (Admin)
```
PUT /admin/jobs/:jobId
Authorization: Bearer <admin-token>
Content-Type: application/json

Request Body:
{
  "status": "active" // or inactive, filled, closed
}

Response (200):
{
  "success": true,
  "message": "Job status updated successfully",
  "data": {...updated job...}
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "User role 'job_seeker' is not authorized to access this route"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Job not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing:
- Express-rate-limit middleware
- Redis-based rate limiting
- API key-based quotas

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123","passwordConfirm":"password123","accountType":"job_seeker"}'
```

### Get All Jobs
```bash
curl http://localhost:5000/api/jobs
```

### Get Job with Filter
```bash
curl "http://localhost:5000/api/jobs?search=developer&location=New York"
```
