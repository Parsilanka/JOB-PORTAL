# New Features API Documentation

## Messaging System

### Send a Message
**Endpoint:** `POST /api/messages`
**Auth:** Required
**Body:**
```json
{
  "receiverId": "user_id",
  "subject": "Subject",
  "content": "Message content",
  "relatedJob": "job_id (optional)",
  "relatedApplication": "application_id (optional)"
}
```

### Get Conversations
**Endpoint:** `GET /api/messages/conversations`
**Auth:** Required
**Query:** `limit=20&offset=0`

### Get Messages in Conversation
**Endpoint:** `GET /api/messages/:conversationId`
**Auth:** Required
**Query:** `limit=50&offset=0`

### Mark Message as Read
**Endpoint:** `PATCH /api/messages/:messageId/read`
**Auth:** Required

### Delete Message
**Endpoint:** `DELETE /api/messages/:messageId`
**Auth:** Required

### Get Unread Count
**Endpoint:** `GET /api/messages/count/unread`
**Auth:** Required

---

## Notifications System

### Get Notifications
**Endpoint:** `GET /api/notifications`
**Auth:** Required
**Query:** `limit=20&offset=0&unreadOnly=false`

### Mark as Read
**Endpoint:** `PATCH /api/notifications/:notificationId/read`
**Auth:** Required

### Mark All as Read
**Endpoint:** `PATCH /api/notifications/markAll/read`
**Auth:** Required

### Delete Notification
**Endpoint:** `DELETE /api/notifications/:notificationId`
**Auth:** Required

### Get Unread Count
**Endpoint:** `GET /api/notifications/count/unread`
**Auth:** Required

### Get Preferences
**Endpoint:** `GET /api/notifications/preferences/settings`
**Auth:** Required

### Update Preferences
**Endpoint:** `PATCH /api/notifications/preferences/settings`
**Auth:** Required

---

## Reviews & Ratings System

### Create Review
**Endpoint:** `POST /api/reviews`
**Auth:** Required
**Body:**
```json
{
  "targetUserId": "user_id",
  "reviewType": "employer|employee|freelancer",
  "rating": 5,
  "title": "Review title",
  "content": "Review content",
  "categories": {
    "communication": 5,
    "professionalism": 4,
    "timeliness": 5,
    "quality": 5
  },
  "relatedJob": "job_id (optional)",
  "relatedApplication": "application_id (optional)"
}
```

### Get User Reviews
**Endpoint:** `GET /api/reviews/user/:userId`
**Auth:** Required
**Query:** `reviewType=employer&limit=10&offset=0`

### Update Review
**Endpoint:** `PATCH /api/reviews/:reviewId`
**Auth:** Required
**Body:** Same as create (all fields optional)

### Delete Review
**Endpoint:** `DELETE /api/reviews/:reviewId`
**Auth:** Required

### Mark Review Helpful
**Endpoint:** `POST /api/reviews/:reviewId/helpful`
**Auth:** Required
**Body:**
```json
{
  "helpful": true
}
```

### Reply to Review
**Endpoint:** `POST /api/reviews/:reviewId/reply`
**Auth:** Required
**Body:**
```json
{
  "content": "Reply content"
}
```

---

## Job Recommendations System

### Get Recommendations
**Endpoint:** `GET /api/recommendations`
**Auth:** Required
**Query:** `limit=10&offset=0`

### Generate Recommendations
**Endpoint:** `POST /api/recommendations/generate`
**Auth:** Required

### Mark as Viewed
**Endpoint:** `PATCH /api/recommendations/:recommendationId/viewed`
**Auth:** Required

### Save Recommendation
**Endpoint:** `PATCH /api/recommendations/:recommendationId/save`
**Auth:** Required

### Dismiss Recommendation
**Endpoint:** `PATCH /api/recommendations/:recommendationId/dismiss`
**Auth:** Required

---

## Analytics System

### Get Analytics
**Endpoint:** `GET /api/analytics`
**Auth:** Required

### Get Dashboard Metrics
**Endpoint:** `GET /api/analytics/dashboard/metrics`
**Auth:** Required

### Get Monthly Analytics
**Endpoint:** `GET /api/analytics/monthly/data`
**Auth:** Required
**Query:** `months=12`

### Get Performance Comparison
**Endpoint:** `GET /api/analytics/performance/comparison`
**Auth:** Required

---

## Advanced Search

### Search Jobs
**Endpoint:** `GET /api/jobs/search`
**Query Parameters:**
```
keyword=
location=
jobType=Full-time
category=
salaryMin=
salaryMax=
skills=
experience=
sortBy=createdAt
sortOrder=-1
page=1
limit=10
```

### Get Job Categories
**Endpoint:** `GET /api/jobs/categories`

### Get Job Locations
**Endpoint:** `GET /api/jobs/locations`

### Get Trending Skills
**Endpoint:** `GET /api/jobs/trending-skills`

### Get Job Statistics
**Endpoint:** `GET /api/jobs/statistics`

---

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Error Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Authentication

All protected endpoints require:
- Header: `Authorization: Bearer {token}`
- Token should be obtained from login endpoint

---

## Notification Types

- `job_match` - New job matching user profile
- `application_update` - Status update on application
- `message` - New message received
- `interview_scheduled` - Interview scheduled
- `job_posted` - Employer posted a new job
- `payment_received` - Payment received
- `subscription_expiring` - Subscription expiring soon
- `new_review` - New review received
- `job_recommendation` - Job recommendation

---

## Review Types

- `employer` - Review of an employer
- `employee` - Review of an employee
- `freelancer` - Review of a freelancer
