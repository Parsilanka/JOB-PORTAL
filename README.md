# Job Portal Backend

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/job_portal
JWT_SECRET=your_secure_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Running the Backend

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

---

# Job Portal Frontend

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Frontend

```bash
npm start
```

The application will run on `http://localhost:3000`

---

## Project Structure

### Backend
```
backend/
├── models/
│   ├── User.js
│   ├── Job.js
│   ├── Application.js
│   └── SavedJob.js
├── controllers/
│   ├── authController.js
│   ├── jobController.js
│   ├── applicationController.js
│   ├── userController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── jobs.js
│   ├── applications.js
│   ├── users.js
│   └── admin.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── server.js
├── package.json
└── .env.example
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── JobCard.js
│   │   └── ProtectedRoute.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Jobs.js
│   │   ├── JobDetail.js
│   │   ├── MyApplications.js
│   │   ├── MyJobs.js
│   │   ├── PostJob.js
│   │   ├── Profile.js
│   │   └── EditProfile.js
│   ├── services/
│   │   └── api.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)
- `GET /api/jobs/employer/me` - Get employer's jobs

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/seeker/my` - Get applicant's applications
- `GET /api/applications/employer/all` - Get employer's received applications
- `GET /api/applications/job/:jobId` - Get applications for specific job
- `PUT /api/applications/:id` - Update application status
- `GET /api/applications/:id` - Get single application

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/employers/all` - Get all employers

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (with filters)
- `PUT /api/admin/users/:id/approve` - Approve/reject user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/jobs/:id` - Update job status

---

## Database Schemas

### User Schema
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  accountType: String (job_seeker/employer/admin),
  phone: String,
  companyName: String,
  profilePicture: String,
  bio: String,
  location: String,
  skills: [String],
  experience: [Object],
  education: [Object],
  isVerified: Boolean,
  isApproved: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Schema
```javascript
{
  title: String,
  description: String,
  location: String,
  salary: {min, max, currency},
  jobType: String,
  category: String,
  requirements: [String],
  skills: [String],
  experienceLevel: String,
  employer: ObjectId (ref: User),
  applicants: [ObjectId] (ref: Application),
  status: String,
  viewCount: Number,
  applicationCount: Number,
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Schema
```javascript
{
  job: ObjectId (ref: Job),
  applicant: ObjectId (ref: User),
  resume: String,
  coverLetter: String,
  status: String,
  rating: Number,
  comments: String,
  appliedAt: Date,
  reviewedAt: Date,
  rejectedAt: Date,
  acceptedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Features Implemented

### For Job Seekers
- ✅ User registration and authentication
- ✅ Browse and search jobs
- ✅ Apply for jobs with resume and cover letter
- ✅ Track application status
- ✅ View profile and edit information
- ✅ Manage skills and experience

### For Employers
- ✅ User registration and authentication
- ✅ Post new job listings
- ✅ Edit and delete job postings
- ✅ View applications received
- ✅ Change application status
- ✅ Company profile management
- ✅ View job statistics

### For Admins
- ✅ Dashboard with statistics
- ✅ User management (approve/reject/delete)
- ✅ Job management (monitor listings)
- ✅ Application analytics

---

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS enabled
- ✅ Input validation
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Error handling middleware

---

## Deployment

### Backend Deployment (Heroku)

1. Create a Heroku account and install Heroku CLI
2. Create a new app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

### Frontend Deployment (Vercel/Netlify)

1. Create a Vercel or Netlify account
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for MongoDB Atlas

**Port Already in Use:**
```bash
# Change PORT in .env or kill existing process
lsof -i :5000  # Find process
kill -9 <PID>   # Kill process
```

### Frontend Issues

**Module Not Found:**
```bash
npm install
npm cache clean --force
```

**CORS Errors:**
- Check FRONTEND_URL in backend `.env`
- Ensure backend and frontend are running on correct ports

---

## Support & Documentation

For more information, refer to:
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## License

This project is licensed under the MIT License.
