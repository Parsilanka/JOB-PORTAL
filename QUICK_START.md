# Quick Start Guide - Job Portal

## Prerequisites
- Node.js v14+ installed
- MongoDB running (local or Atlas)
- npm or yarn package manager
- Git (optional)

## Setup Instructions

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env with your settings
# Edit .env and update:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - FRONTEND_URL: http://localhost:3000 (for development)

# Start the server
npm run dev
# Server will run on http://localhost:5000
```

### Step 2: Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React application
npm start
# App will open on http://localhost:3000
```

### Step 3: Database Setup

#### Using MongoDB Local:
1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - On Windows: `mongod`
   - On Mac: `brew services start mongodb-community`
   - On Linux: `sudo systemctl start mongod`

#### Using MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your connection string

---

## Testing the Application

### 1. Register as Job Seeker
- Go to http://localhost:3000/register
- Select "Job Seeker" as account type
- Fill in details and register
- You'll be logged in automatically

### 2. Register as Employer
- Go to http://localhost:3000/register
- Select "Employer" as account type
- Fill in company details
- Register

### 3. Post a Job (as Employer)
- Click "Post a Job"
- Fill in job details
- Click "Post Job"

### 4. Apply for Job (as Job Seeker)
- Click "Browse Jobs"
- Search for jobs using filters
- Click on a job to view details
- Click "Apply Now"
- Paste your resume

### 5. Check Applications
- **As Job Seeker**: Go to "My Applications" to track status
- **As Employer**: Go to "My Jobs" → "View Applications"

---

## Useful Commands

### Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# View logs
tail -f logs/*.log
```

### Frontend
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Clear cache
npm cache clean --force
```

---

## API Testing Tools

### Using Postman
1. Download Postman from https://www.postman.com/downloads/
2. Import the collection (if available)
3. Test endpoints with sample data

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123","passwordConfirm":"password123","accountType":"job_seeker"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get all jobs
curl http://localhost:5000/api/jobs
```

---

## Project Features Checklist

### Job Seeker Features
- ✅ Registration and Login
- ✅ Browse and search jobs
- ✅ Filter by location, category, salary, job type
- ✅ Apply for jobs
- ✅ Track application status
- ✅ View profile and edit information
- ✅ Add skills and experience

### Employer Features
- ✅ Registration and Login
- ✅ Post new jobs
- ✅ Edit/Delete job listings
- ✅ View received applications
- ✅ Update application status
- ✅ Company profile management
- ✅ View job statistics

### Admin Features
- ✅ Dashboard with statistics
- ✅ User management (approve/reject/delete)
- ✅ Job management
- ✅ Application analytics

---

## Common Issues & Solutions

### MongoDB Connection Error
**Issue**: `MongooseError: Cannot connect to MongoDB`
**Solution**:
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. Verify username/password for MongoDB Atlas
4. Check network connectivity

### Port Already in Use
**Issue**: `Error: listen EADDRINUSE: address already in use :::5000`
**Solution**:
```bash
# Find process using the port
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors
**Issue**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**:
1. Check `FRONTEND_URL` in backend `.env`
2. Ensure it matches the frontend URL
3. Restart backend server

### Module Not Found
**Issue**: `Cannot find module 'express'`
**Solution**:
```bash
# Reinstall dependencies
npm install

# Clear npm cache if needed
npm cache clean --force
npm install
```

### Tailwind CSS Not Loading
**Issue**: Styles not appearing in frontend
**Solution**:
1. Ensure `tailwindcss` is installed: `npm install tailwindcss`
2. Check `tailwind.config.js` configuration
3. Restart frontend server: `npm start`

---

## Deployment

### Deploy Backend (Heroku)
```bash
# Create Heroku account and install CLI
# https://www.heroku.com/

# Login to Heroku
heroku login

# Create app
heroku create your-job-portal-api

# Add MongoDB Atlas connection
heroku config:set MONGODB_URI=your_connection_string

# Deploy
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)
1. Go to https://vercel.com or https://netlify.com
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Deploy

---

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/job_portal
JWT_SECRET=your_secure_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
```

---

## Support Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Guide](https://tailwindcss.com/)

---

## Next Steps

1. Explore the application thoroughly
2. Customize styling and branding
3. Add email notifications
4. Implement advanced search
5. Add user ratings and reviews
6. Deploy to production
7. Set up monitoring and logging

Happy coding! 🚀
