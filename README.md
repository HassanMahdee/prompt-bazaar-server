# Prompt Bazaar Backend API

A comprehensive REST API for an AI Prompt Sharing & Marketplace platform built with Node.js, Express, MongoDB Native Driver, and BetterAuth session token authentication.

## Features

- User authentication via BetterAuth session tokens
- Role-based access control (User, Creator, Admin)
- Prompt CRUD operations with filtering, sorting, and pagination
- Bookmark functionality
- Review system
- Report system for content moderation
- Stripe payment integration for premium subscriptions
- Analytics for admin and creators
- Image upload support for prompts
- Premium features (private prompts, unlimited prompt creation)

## Tech Stack

- Node.js
- Express.js
- MongoDB Native Driver (no Mongoose)
- BetterAuth (session token authentication)
- Stripe (payment processing)
- Multer (file uploads)
- CORS
- dotenv

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/prompt-bazaar
PORT=5000
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET=your_stripe_secret_key_here
SITE_DOMAIN=http://localhost:3000
BETTERAUTH_SECRET=your_betterauth_secret_here
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Authentication
All protected endpoints require a BetterAuth session token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Prompts

### Get All Prompts
**GET** `/prompts`

Get all prompts with optional filtering, sorting, and pagination.

**Query Parameters:**
- `category` - Filter by category
- `difficulty` - Filter by difficulty level
- `aiTool` - Filter by AI tool
- `status` - Filter by status (pending, approved, rejected)
- `visibility` - Filter by visibility (public, private)
- `search` - Search in title, tags, and aiTool
- `sort` - Sort by: latest, mostCopied, mostPopular
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "totalPages": 5,
  "data": [...]
}
```

### Get Prompt by ID
**GET** `/prompts/:id`

Get a single prompt by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Prompt Title",
    "content": "Prompt content",
    "isLocked": false
  }
}
```

### Create Prompt
**POST** `/prompts`

Create a new prompt. Requires authentication.

**Request Body:**
```json
{
  "title": "Prompt Title",
  "description": "Prompt description",
  "content": "Prompt content",
  "category": "Marketing",
  "difficultyLevel": "Intermediate",
  "aiTool": "ChatGPT",
  "tags": ["tag1", "tag2"],
  "visibility": "public"
}
```

**With Image Upload:**
Use `multipart/form-data` with an `image` field.

**Response:**
```json
{
  "success": true,
  "message": "Prompt created successfully",
  "data": {...}
}
```

### Update Prompt
**PATCH** `/prompts/:id`

Update a prompt. Requires authentication (creator or admin).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Delete Prompt
**DELETE** `/prompts/:id`

Delete a prompt. Requires authentication (creator or admin).

### Increment Copy Count
**PATCH** `/prompts/:id/copy`

Increment the copy count of a prompt. Requires authentication.

### Update Prompt Status
**PATCH** `/prompts/:id/status`

Update prompt status. Admin only.

**Request Body:**
```json
{
  "status": "approved",
  "rejectionFeedback": "Optional feedback if rejected"
}
```

### Feature Prompt
**PATCH** `/prompts/:id/feature`

Feature or unfeature a prompt. Admin only.

**Request Body:**
```json
{
  "featured": true
}
```

### Add Review
**POST** `/prompts/:id/reviews`

Add a review to a prompt. Requires authentication.

**Request Body:**
```json
{
  "userName": "John Doe",
  "rating": 5,
  "comment": "Great prompt!"
}
```

### Get Prompts by Creator
**GET** `/prompts/creator/:creatorId`

Get all prompts by a specific creator.

---

## Users

### Create/Update User
**POST** `/users`

Create or update a user. Called after BetterAuth login/registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

### Get All Users
**GET** `/users`

Get all users. Admin only.

### Get User Role
**GET** `/users/:email/role`

Get user role by email. Requires authentication.

### Get User Profile
**GET** `/users/profile/:email`

Get user profile with prompt count. Requires authentication.

### Update User Role
**PATCH** `/users/:id/role`

Update user role. Admin only.

### Update User Subscription
**PATCH** `/users/:email/subscription`

Update user subscription status. Called after successful Stripe payment.

### Delete User
**DELETE** `/users/:id`

Delete a user. Admin only.

---

## Bookmarks

### Add Bookmark
**POST** `/bookmarks`

Add a bookmark. Requires authentication.

**Request Body:**
```json
{
  "promptId": "prompt_id_here"
}
```

### Remove Bookmark
**DELETE** `/bookmarks/:promptId`

Remove a bookmark. Requires authentication.

### Get User Bookmarks
**GET** `/bookmarks`

Get all bookmarks for the logged-in user. Requires authentication.

### Check Bookmark Status
**GET** `/bookmarks/check/:promptId`

Check if a prompt is bookmarked. Requires authentication.

---

## Reports

### Submit Report
**POST** `/reports`

Submit a report for a prompt. Requires authentication.

**Request Body:**
```json
{
  "promptId": "prompt_id_here",
  "reason": "Inappropriate Content",
  "description": "Optional description"
}
```

**Valid Reasons:**
- Inappropriate Content
- Spam
- Copyright Violation
- Other

### Get All Reports
**GET** `/reports`

Get all reports with prompt details. Admin only.

### Update Report Status
**PATCH** `/reports/:id/status`

Update report status. Admin only.

**Request Body:**
```json
{
  "status": "reviewed"
}
```

### Remove Reported Prompt
**DELETE** `/reports/:id/prompt`

Remove the reported prompt. Admin only.

### Warn Creator
**POST** `/reports/:id/warn`

Send a warning to the prompt creator. Admin only.

**Request Body:**
```json
{
  "warningMessage": "Your prompt violates our guidelines"
}
```

### Dismiss Report
**PATCH** `/reports/:id/dismiss`

Dismiss a report. Admin only.

**Request Body:**
```json
{
  "dismissalReason": "Not harmful"
}
```

---

## Payments

### Create Checkout Session
**POST** `/payments/payment-checkout-session`

Create a Stripe checkout session for premium subscription. Requires authentication.

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Handle Payment Success
**POST** `/payments/payment-success`

Handle successful payment and update user subscription. Requires authentication.

**Query Parameters:**
- `session_id` - Stripe session ID

### Get All Payments
**GET** `/payments`

Get all payment records. Admin only.

### Get User Payment History
**GET** `/payments/history`

Get payment history for the logged-in user. Requires authentication.

---

## Analytics

### Get Admin Summary
**GET** `/analytics/admin-summary`

Get overall platform statistics. Admin only.

**Response:**
```json
{
  "totalUsers": 100,
  "totalPrompts": 500,
  "approvedPrompts": 450,
  "pendingPrompts": 30,
  "rejectedPrompts": 20,
  "totalReviews": 200,
  "totalBookmarks": 300,
  "totalReports": 10,
  "totalPayments": 50,
  "totalRevenue": 250,
  "totalCopies": 1000
}
```

### Get Creator Summary
**GET** `/analytics/creator-summary/:email`

Get statistics for a specific creator. Requires authentication.

### Get User Summary
**GET** `/analytics/user-summary/:email`

Get statistics for a specific user. Requires authentication.

### Get Prompt Growth
**GET** `/analytics/prompt-growth`

Get monthly prompt creation data for the last 6 months. Requires authentication.

**Response:**
```json
[
  { "month": "2025-06", "count": 50 },
  { "month": "2025-07", "count": 75 }
]
```

### Get Top Creators
**GET** `/analytics/top-creators`

Get top creators by prompt count and copies. Public route.

### Get Featured Prompts
**GET** `/analytics/featured-prompts`

Get featured prompts for homepage. Public route.

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Collections

- `users` - User accounts
- `prompts` - Prompt entries
- `bookmarks` - User bookmarks
- `reports` - Content reports
- `payments` - Payment records

---

## Premium Features

- **Free Users:** Can create up to 3 prompts, no access to private prompts
- **Premium Users:** Unlimited prompt creation, access to all private prompts

---

## Development

### Project Structure
```
server/
├── index.js
├── .env
├── package.json
├── db/
│   └── mongodb.js
├── routes/
│   ├── prompts.routes.js
│   ├── users.routes.js
│   ├── bookmarks.routes.js
│   ├── reports.routes.js
│   ├── payments.routes.js
│   └── analytics.routes.js
├── controllers/
│   ├── prompts.controller.js
│   ├── users.controller.js
│   ├── bookmarks.controller.js
│   ├── reports.controller.js
│   ├── payments.controller.js
│   └── analytics.controller.js
├── utils/
│   ├── auth.js
│   └── validatePrompt.js
├── middleware/
│   └── upload.js
└── uploads/
    └── (uploaded images)
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

---

## License

MIT
