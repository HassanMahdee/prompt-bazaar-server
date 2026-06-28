# Prompt Bazaar API Documentation

Complete API documentation for frontend developers.

**Base URL:** `http://localhost:5000`

**Note:** Authentication middleware has been temporarily removed for testing. In production, all endpoints will require BetterAuth session tokens via `Authorization: Bearer <token>` header.

---

# PROMPTS ENDPOINTS

## Endpoint 1: Get All Prompts

**Method:** GET  
**Route:** `/prompts`  
**Purpose:** Retrieve all prompts with optional filtering, sorting, and pagination. This is the main endpoint for browsing the prompt marketplace.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:**
- `category` (optional) - Filter by category (e.g., "Marketing", "Writing", "Coding")
- `difficulty` (optional) - Filter by difficulty level (e.g., "Beginner", "Intermediate", "Advanced")
- `aiTool` (optional) - Filter by AI tool (e.g., "ChatGPT", "Claude", "Midjourney")
- `status` (optional) - Filter by status ("pending", "approved", "rejected")
- `visibility` (optional) - Filter by visibility ("public", "private")
- `search` (optional) - Search in title, tags, and aiTool fields
- `sort` (optional) - Sort by: "latest", "mostCopied", "mostPopular"
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/prompts?category=Marketing&sort=mostPopular&page=1&limit=10
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "totalPages": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Marketing Email Generator",
      "description": "Generate compelling marketing emails",
      "content": "Act as a marketing expert...",
      "category": "Marketing",
      "difficultyLevel": "Intermediate",
      "aiTool": "ChatGPT",
      "tags": ["marketing", "email", "sales"],
      "visibility": "public",
      "status": "approved",
      "creatorId": "user@example.com",
      "copyCount": 150,
      "averageRating": 4.5,
      "reviews": [],
      "featured": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving prompts",
  "error": "Database connection error"
}
```

### MongoDB Operation Used
`find()` with query filters, `sort()`, `skip()`, `limit()`, `countDocuments()`

---

## Endpoint 2: Get Prompts by Creator

**Method:** GET  
**Route:** `/prompts/creator/:creatorId`  
**Purpose:** Retrieve all prompts created by a specific creator. Used for creator profile pages and creator dashboard.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `creatorId` (required) - The email address of the creator

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/prompts/creator/john@example.com
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Marketing Email Generator",
      "description": "Generate compelling marketing emails",
      "content": "Act as a marketing expert...",
      "category": "Marketing",
      "difficultyLevel": "Intermediate",
      "aiTool": "ChatGPT",
      "tags": ["marketing", "email", "sales"],
      "visibility": "public",
      "status": "approved",
      "creatorId": "john@example.com",
      "copyCount": 150,
      "averageRating": 4.5,
      "reviews": [],
      "featured": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving creator prompts",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()` with creatorId filter

---

## Endpoint 3: Get Prompt by ID

**Method:** GET  
**Route:** `/prompts/:id`  
**Purpose:** Retrieve a single prompt by its ID. Used for prompt detail pages. Includes premium check for private prompts.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/prompts/507f1f77bcf86cd799439011
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Marketing Email Generator",
    "description": "Generate compelling marketing emails",
    "content": "Act as a marketing expert and write a compelling marketing email for...",
    "category": "Marketing",
    "difficultyLevel": "Intermediate",
    "aiTool": "ChatGPT",
    "tags": ["marketing", "email", "sales"],
    "visibility": "public",
    "status": "approved",
    "creatorId": "john@example.com",
    "copyCount": 150,
    "averageRating": 4.5,
    "reviews": [
      {
        "userId": "user123",
        "userName": "Jane Doe",
        "rating": 5,
        "comment": "Excellent prompt!",
        "createdAt": "2025-01-16T10:00:00Z"
      }
    ],
    "featured": true,
    "isLocked": false,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 403 Forbidden (for private prompts without premium)
```json
{
  "success": false,
  "message": "Premium subscription required to access private prompts"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving prompt",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()` with ObjectId

---

## Endpoint 4: Create Prompt

**Method:** POST  
**Route:** `/prompts`  
**Purpose:** Create a new prompt. Used in the dashboard when a creator submits a new prompt. Supports image upload.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: multipart/form-data (if uploading image)
Content-Type: application/json (if no image)
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON (without image):**
```json
{
  "title": "Marketing Email Generator",
  "description": "Generate compelling marketing emails",
  "content": "Act as a marketing expert and write a compelling marketing email for...",
  "category": "Marketing",
  "difficultyLevel": "Intermediate",
  "aiTool": "ChatGPT",
  "tags": ["marketing", "email", "sales"],
  "visibility": "public",
  "thumbnail": "https://example.com/thumb.jpg",
  "creatorId": "john@example.com"
}
```

**Body JSON (with image):**
Use `FormData` with:
- All JSON fields as string values
- `image` field with the file

**Example Request:**
```bash
POST http://localhost:5000/prompts
Content-Type: application/json

{
  "title": "Marketing Email Generator",
  "description": "Generate compelling marketing emails",
  "content": "Act as a marketing expert...",
  "category": "Marketing",
  "difficultyLevel": "Intermediate",
  "aiTool": "ChatGPT",
  "tags": ["marketing", "email", "sales"],
  "visibility": "public",
  "thumbnail": "https://example.com/thumb.jpg",
  "creatorId": "john@example.com"
}
```

### Success Response

**Status:** 201 Created

```json
{
  "success": true,
  "message": "Prompt created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Marketing Email Generator",
    "description": "Generate compelling marketing emails",
    "content": "Act as a marketing expert...",
    "category": "Marketing",
    "difficultyLevel": "Intermediate",
    "aiTool": "ChatGPT",
    "tags": ["marketing", "email", "sales"],
    "visibility": "public",
    "status": "pending",
    "creatorId": "john@example.com",
    "copyCount": 0,
    "averageRating": 0,
    "reviews": [],
    "featured": false,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 400 Bad Request (validation error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["title is required", "content is required"]
}
```

**Status:** 403 Forbidden (free user limit exceeded)
```json
{
  "success": false,
  "message": "Free users can only create up to 3 prompts. Upgrade to premium for unlimited prompts."
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating prompt",
  "error": "Database error"
}
```

### MongoDB Operation Used
`insertOne()`, `countDocuments()` (for limit check)

---

## Endpoint 5: Update Prompt

**Method:** PATCH  
**Route:** `/prompts/:id`  
**Purpose:** Update an existing prompt. Used in the dashboard when a creator edits their prompt.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:**
```json
{
  "title": "Updated Marketing Email Generator",
  "description": "Updated description",
  "content": "Updated content",
  "category": "Marketing",
  "difficultyLevel": "Advanced",
  "aiTool": "ChatGPT",
  "tags": ["marketing", "email", "sales", "updated"],
  "visibility": "public",
  "thumbnail": "https://example.com/new-thumb.jpg"
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/prompts/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "Updated Marketing Email Generator",
  "description": "Updated description"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Prompt updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Marketing Email Generator",
    "description": "Updated description",
    "content": "Act as a marketing expert...",
    "category": "Marketing",
    "difficultyLevel": "Advanced",
    "aiTool": "ChatGPT",
    "tags": ["marketing", "email", "sales", "updated"],
    "visibility": "public",
    "status": "pending",
    "creatorId": "john@example.com",
    "copyCount": 150,
    "averageRating": 4.5,
    "reviews": [],
    "featured": false,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 403 Forbidden (not creator or admin)
```json
{
  "success": false,
  "message": "You can only update your own prompts"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error updating prompt",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $set operator

---

## Endpoint 6: Delete Prompt

**Method:** DELETE  
**Route:** `/prompts/:id`  
**Purpose:** Delete a prompt. Used in the dashboard when a creator removes their prompt.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:** None

**Example Request:**
```bash
DELETE http://localhost:5000/prompts/507f1f77bcf86cd799439011
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Prompt deleted successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 403 Forbidden (not creator or admin)
```json
{
  "success": false,
  "message": "You can only delete your own prompts"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error deleting prompt",
  "error": "Database error"
}
```

### MongoDB Operation Used
`deleteOne()`

---

## Endpoint 7: Increment Copy Count

**Method:** PATCH  
**Route:** `/prompts/:id/copy`  
**Purpose:** Increment the copy count of a prompt by 1. Called when a user copies a prompt to clipboard.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:** None

**Example Request:**
```bash
PATCH http://localhost:5000/prompts/507f1f77bcf86cd799439011/copy
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Copy count incremented successfully",
  "copyCount": 151
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error incrementing copy count",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $inc operator

---

## Endpoint 8: Update Prompt Status

**Method:** PATCH  
**Route:** `/prompts/:id/status`  
**Purpose:** Update the status of a prompt (pending/approved/rejected). Used by admin to moderate prompts.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:**
```json
{
  "status": "approved",
  "rejectionFeedback": "Optional feedback if rejected"
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/prompts/507f1f77bcf86cd799439011/status
Content-Type: application/json

{
  "status": "approved"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Prompt status updated successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 400 Bad Request (invalid status)
```json
{
  "success": false,
  "message": "Invalid status. Must be pending, approved, or rejected"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error updating prompt status",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $set operator

---

## Endpoint 9: Feature Prompt

**Method:** PATCH  
**Route:** `/prompts/:id/featured`  
**Purpose:** Feature or unfeature a prompt. Used by admin to highlight quality prompts on the homepage.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:**
```json
{
  "featured": true
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/prompts/507f1f77bcf86cd799439011/featured
Content-Type: application/json

{
  "featured": true
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Prompt featured status updated successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error updating featured status",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $set operator

---

## Endpoint 10: Add Review

**Method:** POST  
**Route:** `/prompts/:id/reviews`  
**Purpose:** Add a review to a prompt. Used on prompt detail pages when users submit reviews.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the prompt

**Body JSON:**
```json
{
  "userId": "user123",
  "userName": "Jane Doe",
  "rating": 5,
  "comment": "Excellent prompt! Very helpful."
}
```

**Example Request:**
```bash
POST http://localhost:5000/prompts/507f1f77bcf86cd799439011/reviews
Content-Type: application/json

{
  "userId": "user123",
  "userName": "Jane Doe",
  "rating": 5,
  "comment": "Excellent prompt!"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Marketing Email Generator",
    "reviews": [
      {
        "userId": "user123",
        "userName": "Jane Doe",
        "rating": 5,
        "comment": "Excellent prompt!",
        "createdAt": "2025-01-16T10:00:00Z"
      }
    ],
    "averageRating": 5
  }
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Status:** 400 Bad Request (validation error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["rating must be between 1 and 5"]
}
```

**Status:** 400 Bad Request (duplicate review)
```json
{
  "success": false,
  "message": "You have already reviewed this prompt"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error adding review",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $push operator for reviews array, $set for averageRating

---

# USERS ENDPOINTS

## Endpoint 11: Create or Update User

**Method:** POST  
**Route:** `/users`  
**Purpose:** Create a new user or update an existing user. Called after BetterAuth login/registration.

**Authentication:** None (public endpoint)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "subscription": "free"
}
```

**Example Request:**
```bash
POST http://localhost:5000/users
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "subscription": "free"
}
```

### Success Response

**Status:** 200 OK (update) or 201 Created (new user)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user",
    "subscription": "free",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 400 Bad Request
```json
{
  "success": false,
  "message": "Email is required"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating/updating user",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `insertOne()` or `updateOne()` with $set and $setOnInsert

---

##.Endpoint 12: Get All Users

**Method:** GET  
**Route:** `/users`  
**Purpose:** Retrieve all users. Used by admin to manage users.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/users
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "subscription": "free",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving users",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()`

---

## Endpoint 13: Get User Role

**Method:** GET  
**Route:** `/users/:email/role`  
**Purpose:** Get the role of a specific user. Used to check user permissions.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `email` (required) - User email address

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/users/john@example.com/role
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "email": "john@example.com",
  "role": "user",
  "subscription": "free"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving user role",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()` with projection

---

## Endpoint 14: Get User Profile

**Method:** GET  
**Route:** `/users/profile/:email`  
**Purpose:** Get user profile with prompt count. Used for profile pages.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `email` (required) - User email address

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/users/profile/john@example.com
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user",
    "subscription": "free",
    "promptCount": 5,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving user profile",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `countDocuments()`

---

## Endpoint 15: Update User Role

**Method:** PATCH  
**Route:** `/users/:id/role`  
**Purpose:** Update a user's role. Used by admin to promote users to creator or admin.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the user

**Body JSON:**
```json
{
  "role": "creator"
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/users/507f1f77bcf86cd799439011/role
Content-Type: application/json

{
  "role": "creator"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status:** 400 Bad Request (invalid role)
```json
{
  "success": false,
  "message": "Invalid role. Must be user, creator, or admin"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error updating user role",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $set operator

---

## Endpoint 16: Update User Subscription

**Method:** PATCH  
**Route:** `/users/:email/subscription`  
**Purpose:** Update user subscription status. Called after successful Stripe payment.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `email` (required) - User email address

**Body JSON:**
```json
{
  "subscription": "premium"
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/users/john@example.com/subscription
Content-Type: application/json

{
  "subscription": "premium"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "User subscription updated successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status:** 400 Bad Request (invalid subscription)
```json
{
  "success": false,
  "message": "Invalid subscription. Must be free or premium"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error updating user subscription",
  "error": "Database error"
}
```

### MongoDB Operation Used
`updateOne()` with $set operator

---

## Endpoint 17: Delete User

**Method:** DELETE  
**Route:** `/users/:id`  
**Purpose:** Delete a user. Used by admin to remove users from the platform.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the user

**Body JSON:** None

**Example Request:**
```bash
DELETE http://localhost:5000/users/507f1f77bcf86cd799439011
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error deleting user",
  "error": "Database error"
}
```

### MongoDB Operation Used
`deleteOne()`

---

# BOOKMARKS ENDPOINTS

## Endpoint 18: Add Bookmark

**Method:** POST  
**Route:** `/bookmarks`  
**Purpose:** Add a prompt to user's bookmarks. Called when user clicks bookmark button.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:**
```json
{
  "promptId": "507f1f77bcf86cd799439011",
  "userEmail": "john@example.com"
}
```

**Example Request:**
```bash
POST http://localhost:5000/bookmarks
Content-Type: application/json

{
  "promptId": "507f1f77bcf86cd799439011",
  "userEmail": "john@example.com"
}
```

### Success Response

**Status:** 201 Created

```json
{
  "success": true,
  "message": "Prompt bookmarked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userEmail": "john@example.com",
    "promptId": "507f1f77bcf86cd799439011",
    "bookmarkedAt": "2025-01-16T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 400 Bad Request (already bookmarked)
```json
{
  "success": false,
  "message": "Prompt already bookmarked"
}
```

**Status:** 400 Bad Request (missing fields)
```json
{
  "success": false,
  "message": "Prompt ID is required"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error adding bookmark",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `insertOne()`

---

## Endpoint 19: Remove Bookmark

**Method:** DELETE  
**Route:** `/bookmarks/:promptId`  
**Purpose:** Remove a prompt from user's bookmarks. Called when user clicks unbookmark button.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `promptId` (required) - MongoDB ObjectId of the prompt

**Body JSON:** None

**Example Request:**
```bash
DELETE http://localhost:5000/bookmarks/507f1f77bcf86cd799439011
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Bookmark not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error removing bookmark",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `deleteOne()`

---

## Endpoint 20: Get User Bookmarks

**Method:** GET  
**Route:** `/bookmarks`  
**Purpose:** Get all bookmarks for the logged-in user. Used in bookmarks page.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/bookmarks
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Marketing Email Generator",
      "description": "Generate compelling marketing emails",
      "content": "Act as a marketing expert...",
      "category": "Marketing",
      "difficultyLevel": "Intermediate",
      "aiTool": "ChatGPT",
      "tags": ["marketing", "email", "sales"],
      "visibility": "public",
      "status": "approved",
      "creatorId": "john@example.com",
      "copyCount": 150,
      "averageRating": 4.5,
      "reviews": [],
      "featured": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving bookmarks",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()`, `find()` with $in operator

---

## Endpoint 21: Check Bookmark Status

**Method:** GET  
**Route:** `/bookmarks/check/:promptId`  
**Purpose:** Check if a prompt is bookmarked by the user. Used to show bookmark button state.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `promptId` (required) - MongoDB ObjectId of the prompt

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/bookmarks/check/507f1f77bcf86cd799439011
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "isBookmarked": true
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error checking bookmark status",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`

---

# REPORTS ENDPOINTS

## Endpoint 22: Submit Report

**Method:** POST  
**Route:** `/reports`  
**Purpose:** Submit a report for a prompt. Used when user reports inappropriate content.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:**
```json
{
  "promptId": "507f1f77bcf86cd799439011",
  "userEmail": "john@example.com",
  "reason": "Inappropriate Content",
  "description": "This prompt contains offensive language"
}
```

**Example Request:**
```bash
POST http://localhost:5000/reports
Content-Type: application/json

{
  "promptId": "507f1f77bcf86cd799439011",
  "userEmail": "john@example.com",
  "reason": "Inappropriate Content",
  "description": "This prompt contains offensive language"
}
```

### Success Response

**Status:** 201 Created

```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userEmail": "john@example.com",
    "promptId": "507f1f77bcf86cd799439011",
    "reason": "Inappropriate Content",
    "description": "This prompt contains offensive language",
    "status": "pending",
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 400 Bad Request (already reported)
```json
{
  "success": false,
  "message": "You have already reported this prompt"
}
```

**Status:** 400 Bad Request (invalid reason)
```json
{
  "success": false,
  "message": "Invalid reason"
}
```

**Status:** 400 Bad Request (missing fields)
```json
{
  "success": false,
  "message": "Prompt ID and reason are required"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error submitting report",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `insertOne()`

---

## Endpoint 23: Get All Reports

**Method:** GET  
**Route:** `/reports`  
**Purpose:** Get all reports with prompt details. Used by admin for moderation.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/reports
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userEmail": "john@example.com",
      "promptId": "507f1f77bcf86cd799439011",
      "reason": "Inappropriate Content",
      "description": "This prompt contains offensive language",
      "status": "pending",
      "createdAt": "2025-01-16T10:00:00Z",
      "promptDetails": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Marketing Email Generator",
        "creatorId": "creator@example.com"
      }
    }
  ]
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving reports",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()`, `find()` with $in operator

---

## Endpoint 24: Update Report Status

**Method:** PATCH  
**Route:** `/reports/:id/status`  
**Purpose:** Update the status of a report. Used by admin to track moderation progress.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the report

**Body JSON:**
```json
{
  "status": "reviewed"
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/reports/507f1f77bcf86cd799439013/status
Content-Type: application/json

{
  "status": "reviewed"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Report status updated successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Status:** 400 Bad Request (invalid status)
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error updating report status",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `updateOne()` with $set operator

---

## Endpoint 25: Remove Reported Prompt

**Method:** DELETE  
**Route:** `/reports/:id/prompt`  
**Purpose:** Remove the reported prompt. Used by admin to delete harmful content.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the report

**Body JSON:** None

**Example Request:**
```bash
DELETE http://localhost:5000/reports/507f1f77bcf86cd799439013/prompt
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Prompt removed successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error removing prompt",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `deleteOne()`, `updateOne()`

---

## Endpoint 26: Warn Creator

**Method:** POST  
**Route:** `/reports/:id/warn`  
**Purpose:** Send a warning to the prompt creator. Used by admin for moderation.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the report

**Body JSON:**
```json
{
  "warningMessage": "Your prompt violates our community guidelines. Please review our terms."
}
```

**Example Request:**
```bash
POST http://localhost:5000/reports/507f1f77bcf86cd799439013/warn
Content-Type: application/json

{
  "warningMessage": "Your prompt violates our community guidelines."
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Warning sent to creator successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error warning creator",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `findOne()`, `updateOne()` with $set operator

---

## Endpoint 27: Dismiss Report

**Method:** PATCH  
**Route:** `/reports/:id/dismiss`  
**Purpose:** Dismiss a report as not harmful. Used by admin when report is invalid.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `id` (required) - MongoDB ObjectId of the report

**Body JSON:**
```json
{
  "dismissalReason": "Not harmful - content is appropriate"
}
```

**Example Request:**
```bash
PATCH http://localhost:5000/reports/507f1f77bcf86cd799439013/dismiss
Content-Type: application/json

{
  "dismissalReason": "Not harmful"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Report dismissed successfully"
}
```

### Possible Error Responses

**Status:** 404 Not Found
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error dismissing report",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `updateOne()` with $set operator

---

# PAYMENTS ENDPOINTS

## Endpoint 28: Create Checkout Session

**Method:** POST  
**Route:** `/payments/payment-checkout-session`  
**Purpose:** Create a Stripe checkout session for premium subscription. Used on payment page.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:**
```json
{
  "userEmail": "john@example.com"
}
```

**Example Request:**
```bash
POST http://localhost:5000/payments/payment-checkout-session
Content-Type: application/json

{
  "userEmail": "john@example.com"
}
```

### Success Response

**Status:** 200 OK

```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating checkout session",
  "error": "Stripe API error"
}
```

### MongoDB Operation Used
None (Stripe API call)

---

## Endpoint 29: Handle Payment Success

**Method:** POST  
**Route:** `/payments/payment-success`  
**Purpose:** Handle successful payment and update user subscription. Called after Stripe redirect.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:**
- `session_id` (required) - Stripe session ID from URL

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
POST http://localhost:5000/payments/payment-success?session_id=cs_test_...
```

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Payment successful",
  "transactionId": "pi_...",
  "paymentInfo": {
    "_id": "507f1f77bcf86cd799439014",
    "amount": 5,
    "currency": "usd",
    "customerEmail": "john@example.com",
    "transactionId": "pi_...",
    "paymentStatus": "paid",
    "paidAt": "2025-01-16T10:00:00Z"
  }
}
```

### Possible Error Responses

**Status:** 400 Bad Request
```json
{
  "success": false,
  "message": "Session ID is required"
}
```

**Status:** 400 Bad Request (payment not successful)
```json
{
  "success": false,
  "message": "Payment not successful"
}
```

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error processing payment",
  "error": "Database error"
}
```

### MongoDB Operation Used
`findOne()`, `findOne()`, `updateOne()`, `insertOne()`

---

## Endpoint 30: Get All Payments

**Method:** GET  
**Route:** `/payments`  
**Purpose:** Get all payment records. Used by admin for revenue tracking.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/payments
```

### Success Response

**Status:** 200 OK

```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "amount": 5,
    "currency": "usd",
    "customerEmail": "john@example.com",
    "transactionId": "pi_...",
    "paymentStatus": "paid",
    "paidAt": "2025-01-16T10:00:00Z"
  }
]
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving payments",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()`

---

## Endpoint 31: Get User Payment History

**Method:** GET  
**Route:** `/payments/history`  
**Purpose:** Get payment history for the logged-in user. Used in user profile/payment history page.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/payments/history
```

### Success Response

**Status:** 200 OK

```json
[
  {
    "_id": "507f1f77bcf86cd7994994014",
    "amount": 5,
    "currency": "usd",
    "customerEmail": "john@example.com",
    "transactionId": "pi_...",
    "paymentStatus": "paid",
    "paidAt": "2025-01-16T10:00:00Z"
  }
]
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving payment history",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()`

---

# ANALYTICS ENDPOINTS

## Endpoint 32: Get Admin Summary

**Method:** GET  
**Route:** `/analytics/admin-summary`  
**Purpose:** Get overall platform statistics. Used in admin dashboard.

**Authentication:** None (currently public for testing, admin only in production)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/analytics/admin-summary
```

### Success Response

**Status:** 200 OK

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

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving admin summary",
  "error": "Database error"
}
```

### MongoDB Operation Used
`countDocuments()`, `find()`, `aggregate()` with $sum

---

## Endpoint 33: Get Creator Summary

**Method:** GET  
**Route:** `/analytics/creator-summary/:email`  
**Purpose:** Get statistics for a specific creator. Used in creator dashboard.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `email` (required) - Creator email address

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/analytics/creator-summary/john@example.com
```

### Success Response

**Status:** 200 OK

```json
{
  "totalPrompts": 5,
  "approvedPrompts": 4,
  "pendingPrompts": 1,
  "totalCopies": 150,
  "totalReviews": 20,
  "totalBookmarks": 30
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving creator summary",
  "error": "Database error"
}
```

### MongoDB Operation Used
`countDocuments()`, `find()`, `find()` with $in, `countDocuments()`

---

## Endpoint 34: Get User Summary

**Method:** GET  
**Route:** `/analytics/user-summary/:email`  
**Purpose:** Get statistics for a specific user. Used in user profile.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:**
- `email` (required) - User email address

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/analytics/user-summary/john@example.com
```

### Success Response

**Status:** 200 OK

```json
{
  "totalPrompts": 5,
  "totalBookmarks": 10,
  "totalReports": 0,
  "totalReviewsReceived": 20
}
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving user summary",
  "error": "Database error"
}
```

### MongoDB Operation Used
`countDocuments()`, `find()`, `aggregate()` with $sum

---

## Endpoint 35: Get Prompt Growth

**Method:** GET  
**Route:** `/analytics/prompt-growth`  
**Purpose:** Get monthly prompt creation data for charts. Used in admin dashboard for growth visualization.

**Authentication:** None (currently public for testing)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/analytics/prompt-growth
```

### Success Response

**Status:** 200 OK

```json
[
  {
    "month": "2025-01",
    "count": 50
  },
  {
    "month": "2025-02",
    "count": 75
  },
  {
    "month": "2025-03",
    "count": 100
  }
]
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving prompt growth data",
  "error": "Database error"
}
```

### MongoDB Operation Used
`aggregate()` with $match, $group, $sort

---

## Endpoint 36: Get Top Creators

**Method:** GET  
**Route:** `/analytics/top-creators`  
**Purpose:** Get top creators by prompt count and copies. Used on homepage to showcase top contributors.

**Authentication:** None (public route)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/analytics/top-creators
```

### Success Response

**Status:** 200 OK

```json
[
  {
    "_id": "john@example.com",
    "totalPrompts": 20,
    "totalCopies": 500,
    "totalReviews": 100
  },
  {
    "_id": "jane@example.com",
    "totalPrompts": 15,
    "totalCopies": 400,
    "totalReviews": 80
  }
]
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving top creators",
  "error": "Database error"
}
```

### MongoDB Operation Used
`aggregate()` with $group, $sort, $limit

---

## Endpoint 37: Get Featured Prompts

**Method:** GET  
**Route:** `/analytics/featured-prompts`  
**Purpose:** Get featured prompts for homepage. Used to highlight quality content on landing page.

**Authentication:** None (public route)

### Request

**Headers required:**
```
Content-Type: application/json
```

**Query Parameters:** None

**Route Parameters:** None

**Body JSON:** None

**Example Request:**
```bash
GET http://localhost:5000/analytics/featured-prompts
```

### Success Response

**Status:** 200 OK

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Marketing Email Generator",
    "description": "Generate compelling marketing emails",
    "content": "Act as a marketing expert...",
    "category": "Marketing",
    "difficultyLevel": "Intermediate",
    "aiTool": "ChatGPT",
    "tags": ["marketing", "email", "sales"],
    "visibility": "public",
    "status": "approved",
    "creatorId": "john@example.com",
    "copyCount": 150,
    "averageRating": 4.5,
    "reviews": [],
    "featured": true,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Possible Error Responses

**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving featured prompts",
  "error": "Database error"
}
```

### MongoDB Operation Used
`find()` with featured filter, `sort()`, `limit()`

---

# FRONTEND INTEGRATION GUIDE

## HOME PAGE

### GET /analytics/featured-prompts
1. **Which page should call this endpoint:** Home Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with `useState` for data
4. **Which Axios call should be used:** `axios.get('/analytics/featured-prompts')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with featured prompts array to display in hero section or featured section

### GET /analytics/top-creators
1. **Which page should call this endpoint:** Home Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with `useState` for data
4. **Which Axios call should be used:** `axios.get('/analytics/top-creators')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with top creators array to display in leaderboard section

---

## ALL PROMPTS PAGE

### GET /prompts
1. **Which page should call this endpoint:** All Prompts Page
2. **When should it be called:** On page load, after changing filter, after searching, after pagination changes, after changing sort
3. **Which React hook should be used:** `useEffect` with dependency array for filters/search/page/sort, `useState` for prompts data and pagination state
4. **Which Axios call should be used:** `axios.get('/prompts', { params: { category, difficulty, aiTool, search, sort, page, limit } })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with prompts array and pagination info. Show loading state during fetch.

---

## PROMPT DETAILS PAGE

### GET /prompts/:id
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** On page load (using prompt ID from URL params)
3. **Which React hook should be used:** `useEffect` with prompt ID as dependency, `useState` for prompt data
4. **Which Axios call should be used:** `axios.get(\`/prompts/${id}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with prompt details. If 404, redirect to 404 page. If 403 (private without premium), show upgrade modal.

### PATCH /prompts/:id/copy
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** After clicking "Copy Prompt" button
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.patch(\`/prompts/${id}/copy\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Copy content to clipboard, show success toast, optionally refetch prompt to update copy count display

### POST /prompts/:id/reviews
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** After submitting review form
3. **Which React hook should be used:** No hook needed - call in form onSubmit handler
4. **Which Axios call should be used:** `axios.post(\`/prompts/${id}/reviews\`, { userId, userName, rating, comment })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Refetch prompt data to show new review and updated average rating, show success toast, clear form

### GET /bookmarks/check/:promptId
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** On page load to check if prompt is bookmarked
3. **Which React hook should be used:** `useEffect` with prompt ID as dependency, `useState` for bookmark status
4. **Which Axios call should be used:** `axios.get(\`/bookmarks/check/${promptId}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state to set bookmark button as filled/outline based on isBookmarked

### POST /bookmarks
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** After clicking bookmark button (if not bookmarked)
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.post('/bookmarks', { promptId, userEmail })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local bookmark state to true, show success toast

### DELETE /bookmarks/:promptId
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** After clicking bookmark button (if already bookmarked)
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.delete(\`/bookmarks/${promptId}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local bookmark state to false, show success toast

### POST /reports
1. **Which page should call this endpoint:** Prompt Details Page
2. **When should it be called:** After submitting report form
3. **Which React hook should be used:** No hook needed - call in form onSubmit handler
4. **Which Axios call should be used:** `axios.post('/reports', { promptId, userEmail, reason, description })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, close report modal, optionally disable report button

---

## DASHBOARD (USER/CREATOR)

### POST /users
1. **Which page should call this endpoint:** Login/Register callback page
2. **When should it be called:** After successful BetterAuth authentication
3. **Which React hook should be used:** No hook needed - call in auth callback handler
4. **Which Axios call should be used:** `axios.post('/users', { email, name, role, subscription })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Redirect to dashboard, store user info in context/state

### GET /users/profile/:email
1. **Which page should call this endpoint:** Dashboard, Profile Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with user email as dependency, `useState` for profile data
4. **Which Axios call should be used:** `axios.get(\`/users/profile/${email}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with profile info including prompt count

### POST /prompts
1. **Which page should call this endpoint:** Dashboard (Create Prompt form)
2. **When should it be called:** After submitting create prompt form
3. **Which React hook should be used:** No hook needed - call in form onSubmit handler. Use `FormData` if uploading image.
4. **Which Axios call should be used:** 
   - Without image: `axios.post('/prompts', promptData)`
   - With image: `axios.post('/prompts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, redirect to prompt details or dashboard, refetch user prompts list

### GET /prompts/creator/:creatorId
1. **Which page should call this endpoint:** Dashboard (My Prompts tab), Creator Profile Page
2. **When should it be called:** On page load, after creating/deleting/updating prompt
3. **Which React hook should be used:** `useEffect` with creator ID as dependency, `useState` for prompts data
4. **Which Axios call should be used:** `axios.get(\`/prompts/creator/${creatorId}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with creator's prompts array

### PATCH /prompts/:id
1. **Which page should call this endpoint:** Dashboard (Edit Prompt modal/form)
2. **When should it be called:** After submitting edit prompt form
3. **Which React hook should be used:** No hook needed - call in form onSubmit handler
4. **Which Axios call should be used:** `axios.patch(\`/prompts/${id}\`, updatedData)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, close edit modal, refetch creator prompts list

### DELETE /prompts/:id
1. **Which page should call this endpoint:** Dashboard (My Prompts list)
2. **When should it be called:** After confirming delete action
3. **Which React hook should be used:** No hook needed - call in confirm delete handler
4. **Which Axios call should be used:** `axios.delete(\`/prompts/${id}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch creator prompts list to remove deleted prompt

### GET /bookmarks
1. **Which page should call this endpoint:** Dashboard (Bookmarks tab), Bookmarks Page
2. **When should it be called:** On page load, after adding/removing bookmark
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for bookmarks data
4. **Which Axios call should be used:** `axios.get('/bookmarks')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with bookmarks array

### GET /analytics/creator-summary/:email
1. **Which page should call this endpoint:** Dashboard (Creator Analytics tab)
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with email as dependency, `useState` for analytics data
4. **Which Axios call should be used:** `axios.get(\`/analytics/creator-summary/${email}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with creator stats (total prompts, copies, reviews, bookmarks)

---

## ADMIN DASHBOARD

### GET /analytics/admin-summary
1. **Which page should call this endpoint:** Admin Dashboard
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for analytics data
4. **Which Axios call should be used:** `axios.get('/analytics/admin-summary')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with admin stats (users, prompts, revenue, etc.)

### GET /analytics/prompt-growth
1. **Which page should call this endpoint:** Admin Dashboard (Charts section)
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for growth data
4. **Which Axios call should be used:** `axios.get('/analytics/prompt-growth')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with growth data for chart visualization

### GET /users
1. **Which page should call this endpoint:** Admin Dashboard (Users Management tab)
2. **When should it be called:** On page load, after updating user role/deleting user
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for users data
4. **Which Axios call should be used:** `axios.get('/users')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with users array

### PATCH /users/:id/role
1. **Which page should call this endpoint:** Admin Dashboard (Users Management tab)
2. **When should it be called:** After changing user role dropdown
3. **Which React hook should be used:** No hook needed - call in onChange handler
4. **Which Axios call should be used:** `axios.patch(\`/users/${id}/role\`, { role })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch users list to show updated role

### DELETE /users/:id
1. **Which page should call this endpoint:** Admin Dashboard (Users Management tab)
2. **When should it be called:** After confirming delete user action
3. **Which React hook should be used:** No hook needed - call in confirm delete handler
4. **Which Axios call should be used:** `axios.delete(\`/users/${id}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch users list to remove deleted user

### GET /reports
1. **Which page should call this endpoint:** Admin Dashboard (Reports/Moderation tab)
2. **When should it be called:** On page load, after taking action on report
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for reports data
4. **Which Axios call should be used:** `axios.get('/reports')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with reports array including prompt details

### PATCH /reports/:id/status
1. **Which page should call this endpoint:** Admin Dashboard (Reports tab)
2. **When should it be called:** After changing report status dropdown
3. **Which React hook should be used:** No hook needed - call in onChange handler
4. **Which Axios call should be used:** `axios.patch(\`/reports/${id}/status\`, { status })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch reports list

### DELETE /reports/:id/prompt
1. **Which page should call this endpoint:** Admin Dashboard (Reports tab)
2. **When should it be called:** After clicking "Remove Prompt" button
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.delete(\`/reports/${id}/prompt\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch reports list

### POST /reports/:id/warn
1. **Which page should call this endpoint:** Admin Dashboard (Reports tab)
2. **When should it be called:** After clicking "Warn Creator" button and entering message
3. **Which React hook should be used:** No hook needed - call in form onSubmit handler
4. **Which Axios call should be used:** `axios.post(\`/reports/${id}/warn\`, { warningMessage })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch reports list

### PATCH /reports/:id/dismiss
1. **Which page should call this endpoint:** Admin Dashboard (Reports tab)
2. **When should it be called:** After clicking "Dismiss Report" button
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.patch(\`/reports/${id}/dismiss\`, { dismissalReason })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch reports list

### PATCH /prompts/:id/status
1. **Which page should call this endpoint:** Admin Dashboard (Prompt Moderation tab)
2. **When should it be called:** After approving/rejecting a prompt
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.patch(\`/prompts/${id}/status\`, { status, rejectionFeedback })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch pending prompts list

### PATCH /prompts/:id/featured
1. **Which page should call this endpoint:** Admin Dashboard (Featured Prompts tab)
2. **When should it be called:** After toggling featured status
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.patch(\`/prompts/${id}/featured\`, { featured })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success toast, refetch prompts list

### GET /payments
1. **Which page should call this endpoint:** Admin Dashboard (Payments/Revenue tab)
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for payments data
4. **Which Axios call should be used:** `axios.get('/payments')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with payments array

---

## PROFILE PAGE

### GET /users/profile/:email
1. **Which page should call this endpoint:** Profile Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with email as dependency, `useState` for profile data
4. **Which Axios call should be used:** `axios.get(\`/users/profile/${email}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with profile info

### GET /analytics/user-summary/:email
1. **Which page should call this endpoint:** Profile Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with email as dependency, `useState` for stats data
4. **Which Axios call should be used:** `axios.get(\`/analytics/user-summary/${email}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with user stats

### GET /payments/history
1. **Which page should call this endpoint:** Profile Page (Payment History section)
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with dependency, `useState` for payment history
4. **Which Axios call should be used:** `axios.get('/payments/history')`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with payment history array

---

## PAYMENT PAGE

### POST /payments/payment-checkout-session
1. **Which page should call this endpoint:** Payment/Upgrade Page
2. **When should it be called:** After clicking "Upgrade to Premium" button
3. **Which React hook should be used:** No hook needed - call in onClick handler
4. **Which Axios call should be used:** `axios.post('/payments/payment-checkout-session', { userEmail })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Redirect to Stripe checkout URL returned in response

### POST /payments/payment-success
1. **Which page should call this endpoint:** Payment Success callback page
2. **When should it be called:** On page load (when redirected from Stripe with session_id)
3. **Which React hook should be used:** `useEffect` with session_id from URL params
4. **Which Axios call should be used:** `axios.post('/payments/payment-success', null, { params: { session_id } })`
5. **Should the frontend update local state, refetch data, or redirect after success:** Show success message, redirect to dashboard, refetch user profile to show premium status

---

## CREATOR PROFILE PAGE

### GET /prompts/creator/:creatorId
1. **Which page should call this endpoint:** Creator Profile Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with creator ID from URL params, `useState` for prompts data
4. **Which Axios call should be used:** `axios.get(\`/prompts/creator/${creatorId}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with creator's prompts array

### GET /analytics/creator-summary/:email
1. **Which page should call this endpoint:** Creator Profile Page
2. **When should it be called:** On page load
3. **Which React hook should be used:** `useEffect` with email as dependency, `useState` for stats data
4. **Which Axios call should be used:** `axios.get(\`/analytics/creator-summary/${email}\`)`
5. **Should the frontend update local state, refetch data, or redirect after success:** Update local state with creator stats for profile header

---

# FRONTEND DEVELOPMENT CHECKLIST

## HOME PAGE
□ GET /analytics/featured-prompts - Load featured prompts for hero section
□ GET /analytics/top-creators - Load top creators for leaderboard

## ALL PROMPTS PAGE
□ GET /prompts - Load prompts with filters, search, sort, pagination
□ Implement filter change handler - Refetch prompts with new filters
□ Implement search handler - Refetch prompts with search query
□ Implement sort change handler - Refetch prompts with new sort
□ Implement pagination change handler - Refetch prompts with new page

## PROMPT DETAILS PAGE
□ GET /prompts/:id - Load prompt details on page load
□ GET /bookmarks/check/:promptId - Check bookmark status on page load
□ PATCH /prompts/:id/copy - Handle copy prompt button click
□ POST /prompts/:id/reviews - Handle review form submit
□ POST /bookmarks - Handle add bookmark click
□ DELETE /bookmarks/:promptId - Handle remove bookmark click
□ POST /reports - Handle report form submit

## DASHBOARD (USER/CREATOR)
□ POST /users - Create/update user after auth callback
□ GET /users/profile/:email - Load user profile on dashboard load
□ GET /prompts/creator/:creatorId - Load user's prompts in My Prompts tab
□ POST /prompts - Handle create prompt form submit
□ PATCH /prompts/:id - Handle edit prompt form submit
□ DELETE /prompts/:id - Handle delete prompt action
□ GET /bookmarks - Load bookmarks in Bookmarks tab
□ GET /analytics/creator-summary/:email - Load creator stats in Analytics tab

## ADMIN DASHBOARD
□ GET /analytics/admin-summary - Load admin stats on dashboard load
□ GET /analytics/prompt-growth - Load growth data for charts
□ GET /users - Load users in Users Management tab
□ PATCH /users/:id/role - Handle user role change
□ DELETE /users/:id - Handle user delete action
□ GET /reports - Load reports in Moderation tab
□ PATCH /reports/:id/status - Handle report status change
□ DELETE /reports/:id/prompt - Handle remove reported prompt
□ POST /reports/:id/warn - Handle warn creator action
□ PATCH /reports/:id/dismiss - Handle dismiss report action
□ GET /prompts - Load pending prompts in Moderation tab
□ PATCH /prompts/:id/status - Handle approve/reject prompt
□ PATCH /prompts/:id/featured - Handle feature/unfeature prompt
□ GET /payments - Load payments in Revenue tab

## PROFILE PAGE
□ GET /users/profile/:email - Load profile info
□ GET /analytics/user-summary/:email - Load user stats
□ GET /payments/history - Load payment history

## PAYMENT PAGE
□ POST /payments/payment-checkout-session - Handle upgrade button click
□ POST /payments/payment-success - Handle Stripe success callback

## CREATOR PROFILE PAGE
□ GET /prompts/creator/:creatorId - Load creator's prompts
□ GET /analytics/creator-summary/:email - Load creator stats

---

# DEPENDENCY ORDER FOR FRONTEND INTEGRATION

Follow this order to avoid getting blocked while building the frontend:

## PHASE 1: Foundation (Start Here)
1. **GET /prompts** - Core browsing functionality. This is the most important endpoint - without it, users can't see any prompts.
2. **GET /prompts/:id** - Prompt details. Users need to view individual prompts.
3. **GET /analytics/featured-prompts** - Homepage content. Needed for landing page.
4. **GET /analytics/top-creators** - Homepage leaderboard. Complements featured prompts.

## PHASE 2: User Management
5. **POST /users** - User creation/update. Needed after authentication.
6. **GET /users/profile/:email** - User profile data. Needed for dashboard/profile.
7. **GET /analytics/user-summary/:email** - User stats. Complements profile data.

## PHASE 3: Creator Features
8. **GET /prompts/creator/:creatorId** - Creator's prompts. Needed for dashboard and creator profiles.
9. **POST /prompts** - Create prompt. Core creator functionality.
10. **PATCH /prompts/:id** - Edit prompt. Essential for creators to manage content.
11. **DELETE /prompts/:id** - Delete prompt. Essential for creators to manage content.
12. **GET /analytics/creator-summary/:email** - Creator analytics. Nice-to-have for creators.

## PHASE 4: Engagement Features
13. **PATCH /prompts/:id/copy** - Copy prompt. Core engagement feature.
14. **POST /prompts/:id/reviews** - Add review. Core engagement feature.
15. **GET /bookmarks/check/:promptId** - Check bookmark status. Needed for bookmark UI.
16. **POST /bookmarks** - Add bookmark. Core engagement feature.
17. **DELETE /bookmarks/:promptId** - Remove bookmark. Core engagement feature.
18. **GET /bookmarks** - Get user bookmarks. Needed for bookmarks page/tab.

## PHASE 5: Moderation & Safety
19. **POST /reports** - Submit report. Safety feature.
20. **GET /reports** - Get reports (admin). Moderation feature.
21. **PATCH /reports/:id/status** - Update report status (admin). Moderation feature.
22. **DELETE /reports/:id/prompt** - Remove reported prompt (admin). Moderation feature.
23. **POST /reports/:id/warn** - Warn creator (admin). Moderation feature.
24. **PATCH /reports/:id/dismiss** - Dismiss report (admin). Moderation feature.

## PHASE 6: Admin Features
25. **GET /analytics/admin-summary** - Admin dashboard stats. Admin feature.
26. **GET /analytics/prompt-growth** - Growth charts. Admin feature.
27. **GET /users** - User management. Admin feature.
28. **PATCH /users/:id/role** - Update user role. Admin feature.
29. **DELETE /users/:id** - Delete user. Admin feature.
30. **PATCH /prompts/:id/status** - Approve/reject prompts. Admin feature.
31. **PATCH /prompts/:id/featured** - Feature prompts. Admin feature.
32. **GET /payments** - Payment history (admin). Admin feature.

## PHASE 7: Payments (Optional - Can Be Deferred)
33. **POST /payments/payment-checkout-session** - Create checkout. Premium feature.
34. **POST /payments/payment-success** - Handle payment success. Premium feature.
35. **GET /payments/history** - User payment history. Premium feature.

**Note:** Phase 7 (Payments) can be deferred until after the core platform is fully functional. The platform works perfectly without payment integration - it just limits free users to 3 prompts and no private prompt access.
