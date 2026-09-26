# NagrikConnect

NagrikConnect is a production-ready civic issue and Sarpanch management platform with Multi-Village data isolation and Cascading Location Selection (Country → State → District → Village with India LGD Codes). It connects citizens with their local Gram Panchayat administration, allowing them to report issues, track resolutions, and receive important notices.

## Key Features

- **Multi-Village Data Isolation**: Strict village-level scoping for Citizens, Sarpanchs, Complaints, Notices, and Dashboard Analytics.
- **Cascading Location Selector**: Dynamic selection hierarchy (Country → State → District → Sub-District/Tehsil → Village) with India LGD codes support and searchable village lookup.
- **Role-Based Access Control**: Secure JWT-based authentication for Citizens, Sarpanchs, and Super Admin.
- **Complaint Management**: Photo uploads, location tracking, and status timelines (Pending → In Progress → Completed).
- **Notice Board**: Village-scoped notices broadcast system.
- **Analytics Dashboard**: Real-time statistics, category distribution, and recurring problem analytics.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Security**: JWT, bcrypt, Helmet, Rate Limiting, Mongo Sanitize

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB URI

### Backend Setup
1. Navigate to `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `server/.env`.
4. Seed Super Admin & Sarpanch:
   ```bash
   npm run seed:superadmin
   ```
5. Start backend dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start frontend dev server:
   ```bash
   npm run dev
   ```
