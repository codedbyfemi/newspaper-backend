# Newspaper Admin Backend API

## Overview
Backend system for managing a school newspaper. Built with Express.js, TypeScript, Prisma, and PostgreSQL.

**Base URL:** `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/newspaper_db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Sanity CMS
SANITY_PROJECT_ID="your-sanity-project-id"
SANITY_DATASET="production"
SANITY_API_VERSION="2023-05-03"
SANITY_TOKEN="your-sanity-read-token"  # Optional for private datasets

# Email Service (nodemailer)
EMAIL_SERVICE="smtp"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@schoolnewspaper.com"

# OTP Configuration
OTP_EXPIRY_MINUTES="10"
```

### Email Service Configuration

The system uses **nodemailer** for sending emails. Supported configurations:

#### Option 1: Gmail (Recommended for Development)
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-app-password"  # Generate at myaccount.google.com/apppasswords
```

#### Option 2: Custom SMTP
```env
EMAIL_HOST="your-smtp-server.com"
EMAIL_PORT="587"
EMAIL_USER="your-smtp-username"
EMAIL_PASSWORD="your-smtp-password"
```

#### Option 3: SendGrid, Mailgun (Production)
Update `src/utils/email.util.ts` to use their respective SDKs.

---

## 📋 Implementation Status

### ✅ Completed Sections
- **Section 1:** Admin Authentication (Email allowlist with password setup)
- **Section 2:** Articles Management (Sanity sync, visibility control, Editor's Pick)
- **Section 4:** Community Submissions & Management (Approve/reject, list communities)
- **Section 5:** Community Member Management (OTP-based join/leave, admin controls)

### ❌ Not Implemented (Out of Scope - v1)
- **Section 3:** Article/Story Submissions (user-submitted article ideas)
- **Community Owner Dashboards** (will be added later)
- **Announcements** (community-specific announcements)
- **Events** (community event management)
- **Member Roles** (beyond basic membership)
- **Comments/Discussions** (on articles or communities)
- **Moderation Tools** (content moderation interface)
- **Analytics Dashboard** (usage statistics, metrics)
- **Email Automation Logic** (automated campaigns)
- **Article Read Tracking** (by IP address)
- **Reactions System** (like/love/insightful on articles)

**Note:** Article submissions, read tracking, and reactions were mentioned in the original spec but deprioritized for v1. These will be implemented in future versions.

---

## Table of Contents
- [Implementation Status](#-implementation-status)
- [Project Structure](#-project-structure)
- [Authentication](#authentication)
- [Articles](#articles)
- [Community Submissions](#community-submissions)
- [Communities](#communities)
- [Member Management](#member-management)
- [Setup & Installation](#setup--installation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Development Scripts](#development-scripts)

---

## 📁 Project Structure

```
newspaper-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client instance
│   │   ├── env.ts               # Environment variable validation
│   │   └── sanity.ts            # Sanity CMS client configuration
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification middleware
│   │   └── error.middleware.ts  # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.types.ts
│   │   ├── articles/
│   │   │   ├── articles.controller.ts
│   │   │   ├── articles.service.ts
│   │   │   ├── articles.routes.ts
│   │   │   ├── articles.types.ts
│   │   │   ├── public.routes.ts    # Public article endpoints
│   │   │   └── cron.routes.ts      # Internal sync endpoint
│   │   └── communities/
│   │       ├── communities.controller.ts
│   │       ├── communities.service.ts
│   │       ├── communities.routes.ts
│   │       ├── communities.types.ts
│   │       └── public.routes.ts    # Public community endpoints
│   ├── utils/
│   │   ├── jwt.util.ts          # JWT generation & verification
│   │   ├── password.util.ts     # bcrypt hashing & validation
│   │   ├── response.util.ts     # Standardized API responses
│   │   ├── slug.util.ts         # URL slug generation
│   │   ├── email.util.ts        # Email service (nodemailer)
│   │   └── otp.util.ts          # OTP generation & validation
│   ├── types/
│   │   └── express.d.ts         # Express type extensions
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed script for admin allowlist
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Authentication

All admin endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Setup Password (First Login)
**Endpoint:** `POST /admin/auth/setup`

**Description:** First-time password setup for allowlisted admins.

**Request Body:**
```json
{
  "email": "admin@school.edu",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "uuid",
      "email": "admin@school.edu",
      "name": "Admin User"
    }
  }
}
```

**Error Responses:**
- `403` - Email not allowlisted
- `400` - Account already activated
- `400` - Invalid password (must be 8+ chars, 1 uppercase, 1 lowercase, 1 number)

---

### Login
**Endpoint:** `POST /admin/auth/login`

**Description:** Standard login for activated accounts.

**Request Body:**
```json
{
  "email": "admin@school.edu",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "uuid",
      "email": "admin@school.edu",
      "name": "Admin User"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account not activated (password not set)

---

### Get Current Admin
**Endpoint:** `GET /admin/auth/me`

**Description:** Get current authenticated admin's profile.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@school.edu",
      "name": "Admin User"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

### Logout
**Endpoint:** `POST /admin/auth/logout`

**Description:** Logout (client-side token deletion).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Articles

### Sync Articles from Sanity
**Endpoint:** `POST /admin/articles/sync`

**Description:** Fetch articles from Sanity CMS and sync to database. Creates new articles or updates existing ones (preserves visibility and editor's pick status).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Articles synced successfully",
    "created": 5,
    "updated": 3,
    "total": 8
  }
}
```

**Notes:**
- New articles default to `visibility: "private"`
- `isPost` is automatically inferred from `type` field (`type === "post"`)
- Metadata (title, slug, author, type) is updated on sync
- Visibility and editor's pick status are preserved

---

### List All Articles (Admin)
**Endpoint:** `GET /admin/articles`

**Description:** Get all articles with admin metadata.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "sanityId": "sanity-id",
        "title": "Article Title",
        "slug": "article-slug",
        "author": "John Doe",
        "type": "post",
        "isPost": true,
        "visibility": "public",
        "isEditorsPick": true,
        "lastSyncedAt": "2026-01-03T10:00:00Z"
      }
    ]
  }
}
```

---

### Update Article Visibility
**Endpoint:** `PATCH /admin/articles/:id/visibility`

**Description:** Change article visibility between public and private.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "visibility": "public"
}
```

**Valid Values:** `"public"` | `"private"`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "sanityId": "sanity-id",
      "title": "Article Title",
      "slug": "article-slug",
      "author": "John Doe",
      "type": "post",
      "isPost": true,
      "visibility": "public",
      "isEditorsPick": false,
      "lastSyncedAt": "2026-01-03T10:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid visibility value
- `404` - Article not found

---

### Set Editor's Pick
**Endpoint:** `POST /admin/articles/:id/editors-pick`

**Description:** Set article as Editor's Pick. Only ONE article can be Editor's Pick at a time. Only articles with `type === "post"` can be set as Editor's Pick.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Article set as Editor's Pick",
    "article": {
      "id": "uuid",
      "sanityId": "sanity-id",
      "title": "Article Title",
      "slug": "article-slug",
      "author": "John Doe",
      "type": "post",
      "isPost": true,
      "visibility": "public",
      "isEditorsPick": true,
      "lastSyncedAt": "2026-01-03T10:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Article not found
- `400` - Only posts can be set as Editor's Pick (when `isPost === false`)

**Business Rules:**
- Previous Editor's Pick is automatically unset
- Only articles where `type === "post"` (i.e., `isPost === true`) can be Editor's Pick
- Articles with `type === "opinion"`, `"news"`, `"article"`, etc. cannot be Editor's Pick

---

### Get Public Articles (Frontend)
**Endpoint:** `GET /articles`

**Description:** Get all public articles (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "sanityId": "sanity-id",
        "title": "Article Title",
        "slug": "article-slug",
        "author": "John Doe",
        "type": "post",
        "isPost": true,
        "isEditorsPick": true,
        "lastSyncedAt": "2026-01-03T10:00:00Z"
      }
    ]
  }
}
```

**Notes:**
- Only returns articles with `visibility: "public"`
- Editor's Pick is included in the list

---

### Get Single Public Article
**Endpoint:** `GET /articles/:slug`

**Description:** Get a single public article by slug (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "sanityId": "sanity-id",
      "title": "Article Title",
      "slug": "article-slug",
      "author": "John Doe",
      "type": "post",
      "isPost": true,
      "isEditorsPick": false,
      "lastSyncedAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Article not found or not public

---

### Cron Sync (Internal)
**Endpoint:** `POST /internal/articles/sync`

**Description:** Internal endpoint for automated article syncing (e.g., via cron jobs).

**Response:** Same as `POST /admin/articles/sync`

**Security Note:** In production, this endpoint should be protected by IP allowlist or secret token.

---

## Community Submissions

### List Community Submissions
**Endpoint:** `GET /admin/communities/submissions`

**Description:** Get all community submissions. Optionally filter by status.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status` (optional): `"pending"` | `"approved"` | `"rejected"`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "organizerName": "Jane Doe",
        "organizerEmail": "jane@school.edu",
        "communityName": "Robotics Club",
        "description": "A community for robotics enthusiasts",
        "status": "pending",
        "createdAt": "2026-01-03T10:00:00Z"
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Invalid status value

---

### Get Single Submission
**Endpoint:** `GET /admin/communities/submissions/:id`

**Description:** Get details of a specific community submission.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "uuid",
      "organizerName": "Jane Doe",
      "organizerEmail": "jane@school.edu",
      "communityName": "Robotics Club",
      "description": "A community for robotics enthusiasts",
      "status": "pending",
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Submission not found

---

### Approve Submission
**Endpoint:** `POST /admin/communities/submissions/:id/approve`

**Description:** Approve a community submission. This will:
1. Create the community with a unique slug
2. Add the organizer as the first member
3. Enable notifications for the organizer by default
4. Update submission status to "approved"

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Community submission approved",
    "submission": {
      "id": "uuid",
      "organizerName": "Jane Doe",
      "organizerEmail": "jane@school.edu",
      "communityName": "Robotics Club",
      "description": "A community for robotics enthusiasts",
      "status": "approved",
      "createdAt": "2026-01-03T10:00:00Z"
    },
    "community": {
      "id": "uuid",
      "name": "Robotics Club",
      "slug": "robotics-club",
      "description": "A community for robotics enthusiasts",
      "createdAt": "2026-01-03T10:05:00Z"
    },
    "member": {
      "id": "uuid",
      "communityId": "uuid",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "notificationsEnabled": true,
      "deletedAt": null,
      "createdAt": "2026-01-03T10:05:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Submission not found
- `400` - Submission has already been processed

**Business Rules:**
- Slug is auto-generated from community name
- If slug exists, a number is appended (e.g., `robotics-club-2`)
- Organizer becomes first member with notifications enabled
- Transaction ensures atomicity (all operations succeed or none do)

---

### Reject Submission
**Endpoint:** `POST /admin/communities/submissions/:id/reject`

**Description:** Reject a community submission. Updates status to "rejected".

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Community submission rejected",
    "submission": {
      "id": "uuid",
      "organizerName": "Jane Doe",
      "organizerEmail": "jane@school.edu",
      "communityName": "Robotics Club",
      "description": "A community for robotics enthusiasts",
      "status": "rejected",
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Submission not found
- `400` - Submission has already been processed

---

## Communities

### List All Communities (Admin)
**Endpoint:** `GET /admin/communities`

**Description:** Get all communities with member counts.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "uuid",
        "name": "Robotics Club",
        "slug": "robotics-club",
        "description": "A community for robotics enthusiasts",
        "createdAt": "2026-01-03T10:00:00Z",
        "_count": {
          "members": 15
        }
      }
    ]
  }
}
```

**Notes:**
- Only counts active members (where `deletedAt` is null)

---

### Get Community Details (Admin)
**Endpoint:** `GET /admin/communities/:id`

**Description:** Get community details including all active members.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "community": {
      "id": "uuid",
      "name": "Robotics Club",
      "slug": "robotics-club",
      "description": "A community for robotics enthusiasts",
      "createdAt": "2026-01-03T10:00:00Z",
      "members": [
        {
          "id": "uuid",
          "communityId": "uuid",
          "name": "Jane Doe",
          "email": "jane@school.edu",
          "notificationsEnabled": true,
          "deletedAt": null,
          "createdAt": "2026-01-03T10:00:00Z"
        }
      ]
    }
  }
}
```

**Error Responses:**
- `404` - Community not found

**Notes:**
- Only returns active members (soft-deleted members excluded)

---

### Get Public Communities (Frontend)
**Endpoint:** `GET /communities`

**Description:** Get all communities (public, no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "uuid",
        "name": "Robotics Club",
        "slug": "robotics-club",
        "description": "A community for robotics enthusiasts",
        "createdAt": "2026-01-03T10:00:00Z",
        "_count": {
          "members": 15
        }
      }
    ]
  }
}
```

---

### Get Single Public Community
**Endpoint:** `GET /communities/:slug`

**Description:** Get a single community by slug (public, no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "community": {
      "id": "uuid",
      "name": "Robotics Club",
      "slug": "robotics-club",
      "description": "A community for robotics enthusiasts",
      "createdAt": "2026-01-03T10:00:00Z",
      "_count": {
        "members": 15
      }
    }
  }
}
```

**Error Responses:**
- `404` - Community not found

---

## Member Management

### Request to Join Community (Public)
**Endpoint:** `POST /communities/:communityId/join/request`

**Description:** Send OTP to email for joining a community. No authentication required.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@school.edu"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Verification code sent to your email"
  }
}
```

**Business Rules:**
- 6-digit OTP sent to email
- OTP expires in 10 minutes
- Cannot join if already a member
- OTP is single-use

**Error Responses:**
- `404` - Community not found
- `400` - Already a member of this community
- `400` - Name and email are required

---

### Verify Join OTP (Public)
**Endpoint:** `POST /communities/:communityId/join/verify`

**Description:** Verify OTP and complete membership. No authentication required.

**Request Body:**
```json
{
  "email": "jane@school.edu",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully joined community",
    "member": {
      "id": "uuid",
      "communityId": "uuid",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "notificationsEnabled": true,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid verification code
- `400` - Verification code has expired
- `404` - Community not found

---

### Request to Leave Community (Public)
**Endpoint:** `POST /communities/:communityId/leave/request`

**Description:** Send OTP to email for leaving a community. No authentication required.

**Request Body:**
```json
{
  "email": "jane@school.edu"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Verification code sent to your email"
  }
}
```

**Business Rules:**
- Must be an active member
- OTP sent for identity verification
- Prevents unauthorized removal

**Error Responses:**
- `404` - Not a member of this community
- `400` - Email is required

---

### Verify Leave OTP (Public)
**Endpoint:** `POST /communities/:communityId/leave/verify`

**Description:** Verify OTP and leave community (soft delete). No authentication required.

**Request Body:**
```json
{
  "email": "jane@school.edu",
  "otp": "654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully left community"
  }
}
```

**Database Changes:**
- Member is soft-deleted (`deletedAt` set to current timestamp)
- `deletedBy` set to `"self"` (indicates voluntary exit)
- Data preserved for audit trail

**Error Responses:**
- `400` - Invalid verification code
- `400` - Verification code has expired

---

### Admin: Add Member (No OTP)
**Endpoint:** `POST /admin/communities/:id/members`

**Description:** Admin adds member directly without email verification.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@school.edu",
  "notificationsEnabled": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Member added successfully",
    "member": {
      "id": "uuid",
      "communityId": "uuid",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "notificationsEnabled": true,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Business Rules:**
- No OTP required (admin override)
- Instant membership
- If member was previously soft-deleted, restores the member
- No email notification sent

**Error Responses:**
- `404` - Community not found
- `400` - Member already exists in this community
- `400` - Name and email are required

---

### Admin: Update Member Notifications
**Endpoint:** `PATCH /admin/communities/:communityId/members/:memberId`

**Description:** Admin updates member's notification preference.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "notificationsEnabled": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Member updated successfully",
    "member": {
      "id": "uuid",
      "communityId": "uuid",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "notificationsEnabled": false,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `404` - Member not found
- `400` - notificationsEnabled must be a boolean

---

### Admin: Remove Member (No OTP)
**Endpoint:** `DELETE /admin/communities/:communityId/members/:memberId`

**Description:** Admin removes member without verification. Sends notification email to member.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully",
    "member": {
      "id": "uuid",
      "communityId": "uuid",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "notificationsEnabled": false,
      "deletedAt": "2026-01-03T10:30:00Z",
      "deletedBy": "admin-uuid-here",
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
}
```

**Business Rules:**
- Soft delete (preserves data)
- `deletedBy` contains admin's UUID (from JWT token)
- Email notification sent to member
- All actions are auditable

**Email Sent to Member:**
- Subject: "Membership Update - [Community Name]"
- Informs member of removal by admin

**Error Responses:**
- `404` - Member not found

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Sanity CMS project

### Installation

1. **Clone and Install Dependencies:**
```bash
npm install
```

2. **Configure Environment Variables:**

Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/newspaper_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# Sanity
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_API_VERSION="2023-05-03"
SANITY_TOKEN="your-read-token"
```

3. **Run Database Migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Seed Allowlisted Admins:**
```bash
npm run prisma:seed
```

Edit `prisma/seed.ts` to add your admin emails.

5. **Start Development Server:**
```bash
npm run dev
```

---

## Database Schema

### Admin
```prisma
model Admin {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Article
```prisma
model Article {
  id             String    @id @default(uuid())
  sanityId       String    @unique
  title          String
  slug           String    @unique
  author         String?
  type           String    @default("article")
  isPost         Boolean   // Computed: true if type == "post"
  visibility     String    @default("private")
  isEditorsPick  Boolean   @default(false)
  lastSyncedAt   DateTime  @default(now())
  createdAt      DateTime  @default(now())
}
```

### CommunitySubmission
```prisma
model CommunitySubmission {
  id              String    @id @default(uuid())
  organizerName   String
  organizerEmail  String
  communityName   String
  description     String?
  status          String    @default("pending") // 'pending', 'approved', 'rejected'
  createdAt       DateTime  @default(now())
}
```

### Community
```prisma
model Community {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  members     CommunityMember[]
}
```

### CommunityMember
```prisma
model CommunityMember {
  id                    String    @id @default(uuid())
  communityId           String
  name                  String
  email                 String
  notificationsEnabled  Boolean   @default(true)
  deletedAt             DateTime? // Soft delete
  deletedBy             String?   // Admin ID or 'self' for voluntary exit
  createdAt             DateTime  @default(now())
  community             Community @relation(...)
  @@unique([communityId, email])
}
```

### CommunityOtp (New in Section 5)
```prisma
model CommunityOtp {
  id              String    @id @default(uuid())
  communityId     String
  email           String
  name            String?   // For join requests
  otp             String
  action          String    // 'join' or 'leave'
  expiresAt       DateTime
  verified        Boolean   @default(false)
  verifiedAt      DateTime?
  createdAt       DateTime  @default(now())
  @@index([communityId, email, action])
}
```

---

## Key Features & Business Logic

### Authentication
- **Email Allowlist:** Only pre-approved emails can access admin panel
- **Phased Authentication:** 
  1. First login: Set password (account activation)
  2. Subsequent logins: Email + password
- **JWT Tokens:** 7-day expiration (configurable)
- **Password Requirements:** 8+ characters, 1 uppercase, 1 lowercase, 1 number

### Articles
- **Sanity as Source of Truth:** Articles authored in Sanity CMS
- **Backend Controls:**
  - Visibility (public/private)
  - Editor's Pick (exclusive - only ONE at a time)
  - Only posts (`type === "post"`) can be Editor's Pick
- **Sync Logic:**
  - Creates new articles as `private` by default
  - Updates metadata on sync
  - Preserves visibility and Editor's Pick status
- **Auto-computed:** `isPost = (type === "post")`

### Communities
- **Submission Workflow:**
  1. Admin receives submission (created externally or seeded)
  2. Admin approves → Community created + Organizer becomes first member
  3. Admin rejects → Submission marked as rejected
- **Slug Generation:**
  - Auto-generated from community name
  - URL-friendly (lowercase, hyphens, no special chars)
  - Handles duplicates (appends `-2`, `-3`, etc.)

### Member Management
- **Join Flow (OTP-based):**
  1. User requests to join → OTP sent to email
  2. User verifies OTP → Membership granted
  3. Notifications enabled by default
- **Leave Flow (OTP-based):**
  1. Member requests to leave → OTP sent to email
  2. Member verifies OTP → Soft delete with `deletedBy: "self"`
- **Admin Override:**
  - Add members instantly (no OTP)
  - Remove members with email notification
  - Soft delete with `deletedBy: adminId`
- **Rejoin Capability:**
  - Soft-deleted members can rejoin
  - Restores existing record (no duplicate)

### Security Features
- **OTP Security:**
  - 6-digit random codes
  - 10-minute expiration
  - Single-use (marked as verified after use)
  - Action-specific (join vs leave)
- **Soft Delete:**
  - Preserves all data for audit trail
  - Tracks deletion source (`self` vs `adminId`)
  - Enables data recovery

### Email Notifications
- **Join OTP:** Verification code with community name
- **Leave OTP:** Confirmation code with warning
- **Admin Removal:** Notification to removed member

---

## API Design Patterns

### Response Format
All endpoints follow consistent response structure:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not allowlisted, account not activated)
- `404` - Not Found
- `500` - Internal Server Error

### Authentication Pattern
Protected endpoints require JWT in header:
```
Authorization: Bearer <jwt-token>
```

### Pagination (Not Implemented - Future)
Currently all list endpoints return full datasets. Pagination will be added in future versions.

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not allowlisted, account not activated)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run migrations
npm run prisma:studio        # Open Prisma Studio (database GUI)
npm run prisma:seed          # Seed admin allowlist

# Create new migration
npx prisma migrate dev --name migration_name
```

---

## Testing

### Manual Testing with cURL
See separate test documentation for complete cURL commands covering:
- Authentication flow
- Article management
- Community submissions
- Member join/leave with OTP
- Admin member management

### Automated Testing (Not Implemented)
Unit tests, integration tests, and E2E tests will be added in future versions using Jest/Supertest.

---

## Deployment Considerations

### Production Checklist
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV="production"`
- [ ] Use production email service (SendGrid, Mailgun)
- [ ] Enable HTTPS
- [ ] Set up proper CORS policies
- [ ] Implement rate limiting (not included in v1)
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Protect `/internal/*` endpoints with IP allowlist or secret token
- [ ] Review and update admin allowlist in `prisma/seed.ts`

### Environment-Specific Configuration
```bash
# Development
NODE_ENV="development"
PORT=3000

# Staging
NODE_ENV="staging"
PORT=3001

# Production
NODE_ENV="production"
PORT=80
```

---

## Future Enhancements (v2+)

### Planned Features
1. **Article Submissions**
   - Public submission form
   - Admin review workflow
   - Status tracking (pending/approved/rejected)

2. **Analytics & Engagement**
   - Article read tracking by IP
   - Reactions system (like/love/insightful)
   - Community activity metrics
   - User engagement reports

3. **Community Features**
   - Announcements (community-specific posts)
   - Events (with RSVP functionality)
   - Member roles (organizer, moderator, member)
   - Owner dashboards

4. **Moderation**
   - Content flagging system
   - Automated moderation tools
   - Admin moderation queue

5. **Email Automation**
   - Welcome emails for new members
   - Weekly digest emails
   - Event reminders
   - Community updates

6. **Performance**
   - Pagination for all list endpoints
   - Caching layer (Redis)
   - Rate limiting
   - Database indexing optimization

7. **API Enhancements**
   - GraphQL API option
   - Webhooks for real-time updates
   - Batch operations
   - Bulk import/export

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
Error: Can't reach database server
```
**Solution:** Verify PostgreSQL is running and `DATABASE_URL` is correct

#### 2. Email Not Sending
```bash
Error: Invalid login
```
**Solution:** 
- For Gmail: Enable 2FA and generate App Password
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Check firewall/port 587 is open

#### 3. JWT Token Invalid
```bash
Error: Invalid or expired token
```
**Solution:**
- Token expired (7 days) - login again
- `JWT_SECRET` changed - all existing tokens invalidated
- Token format incorrect - must be `Bearer <token>`

#### 4. Prisma Migration Errors
```bash
Error: Migration failed
```
**Solution:**
```bash
npx prisma migrate reset  # CAUTION: Deletes all data
npx prisma migrate dev
npx prisma generate
```

#### 5. OTP Not Received
**Possible causes:**
- Check spam/junk folder
- OTP expired (10 minutes)
- Email service not configured
- Wrong email address

---

## Contributing

### Code Style
- TypeScript strict mode enabled
- Use ESLint + Prettier (add configuration in v2)
- Follow existing folder structure
- Add JSDoc comments for public methods

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/article-reactions

# Make changes and commit
git add .
git commit -m "feat: add article reactions system"

# Push and create PR
git push origin feature/article-reactions
```

### Commit Message Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## Tech Stack Summary

### Core Technologies
- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 5.x
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Email:** nodemailer
- **CMS:** Sanity (read-only integration)

### Dependencies
```json
{
  "dependencies": {
    "@prisma/adapter-pg": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "@sanity/client": "^7.13.2",
    "bcryptjs": "^3.0.3",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "nodemailer": "^7.0.12",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "@sanity/types": "^5.1.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^25.0.3",
    "@types/nodemailer": "^7.0.4",
    "@types/pg": "^8.16.0",
    "cors": "^2.8.5",
    "nodemon": "^3.1.11",
    "prisma": "^7.2.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
```

---

## Changelog

### v1.0.0 (January 2026)
- ✅ Admin authentication with email allowlist
- ✅ Article management with Sanity sync
- ✅ Community submission approval workflow
- ✅ OTP-based member join/leave
- ✅ Admin member management
- ✅ Soft delete with audit trail
- ✅ Email notifications

### Upcoming (v1.1.0)
- Article submissions
- Community submissioms
- Read tracking
- Reactions system

---

**Last Updated:** January 4, 2026  
**API Version:** v1.0.0  
**Documentation Version:** 1.0