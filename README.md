# SquadUp - Collaborative Project Platform

SquadUp is a modern web application that connects students and mentors for collaborative learning and project development. Build amazing projects together, find mentors, and grow your skills.

## 🚀 Features

### Core Features
- **User Authentication**: Secure email/password and Google OAuth authentication
- **Role-Based Access**: Student, Mentor, and Admin roles with specific permissions
- **Squad Management**: Create and join project squads with team collaboration
- **Mentorship System**: Book sessions with verified mentors
- **Real-time Messaging**: Chat with squad members and mentors
- **Video Calling**: Built-in video call functionality for remote collaboration
- **Notifications**: Stay updated with real-time notifications

### Enhanced Squad Features

#### 1. **Squad Roles & Permissions**
- **Admin**: Squad creator with full control
  - Delete squad
  - Manage all members
  - Change member roles
  - Manage squad settings
- **Moderator**: Trusted members with management capabilities
  - Pin/unpin messages
  - Manage squad rules
  - Approve/reject join requests
  - Remove members (except admin)
- **Member**: Regular squad participants
  - View content
  - Send messages
  - Participate in discussions

#### 2. **Squad Rules**
- Admins and moderators can create, update, and delete squad rules
- Rules are displayed in order for all members
- Helps maintain squad culture and expectations

#### 3. **Pinned Messages**
- Admins and moderators can pin important messages
- Pinned messages appear at the top of chat
- Easy access to important announcements and resources

#### 4. **Activity Logs**
- Comprehensive audit trail of all squad activities
- Track member joins/leaves, role changes, rule updates, and more
- Transparent squad management

#### 5. **Join Request System**
- Squads can require approval for new members
- Applicants provide a reason for joining
- Admins/moderators review and approve/reject requests
- Prevents spam and ensures quality members

#### 6. **Squad Discovery**
- Enhanced search with discovery tags
- Category-based filtering (Web, Mobile, AI/ML, Blockchain, Game, IoT)
- Find squads that match your interests and skills

#### 7. **Report System**
- Report users, posts, messages, or projects
- Admin review workflow
- Multiple report categories (spam, harassment, inappropriate content, etc.)
- Action tracking (warnings, content removal, user suspension)

### Admin Features

#### 1. **Delete User**
- Permanently delete users (except other admins)
- Comprehensive cleanup:
  - Remove from all squads
  - Delete or anonymize messages
  - Clean up all related data (bookings, notifications, etc.)
  - Delete user-created projects and associated data
- Session invalidation

#### 2. **Delete Squad**
- Only squad creator (admin) can delete
- Confirmation required
- Complete data cleanup:
  - All messages
  - Squad rules
  - Join requests
  - Activity logs
  - Related reports

#### 3. **Platform Statistics**
- User growth metrics
- Active projects tracking
- Booking and revenue analytics
- Mentor verification status

#### 4. **User Management**
- View all users with filters
- Activate/deactivate accounts
- Verify mentors
- Search by name or email

#### 5. **Report Management**
- Review all reports
- Update report status
- Take action on reported content
- Track resolution history

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: React Icons
- **HTTP Client**: Axios
- **Authentication**: Firebase Auth

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **Real-time**: Firebase Firestore (for chat)
- **Security**: Helmet, CORS
- **Validation**: Express Async Handler

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Firebase project with Authentication enabled

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Security Features

- **Role-Based Access Control (RBAC)**: Granular permissions for different user roles
- **Authentication**: Secure Firebase authentication with JWT tokens
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS policies
- **Helmet Security**: HTTP headers security
- **Rate Limiting**: Protection against brute force attacks
- **Data Sanitization**: Protection against injection attacks

## 📚 API Documentation

### Squad Endpoints

#### Public Routes
- `GET /api/projects` - Get all public squads
- `GET /api/projects/:id` - Get squad details
- `GET /api/projects/:id/rules` - Get squad rules

#### Protected Routes
- `POST /api/projects` - Create new squad
- `PUT /api/projects/:id` - Update squad (Admin/Moderator)
- `DELETE /api/projects/:id` - Delete squad (Admin only)
- `POST /api/projects/:id/join` - Join squad or request to join
- `POST /api/projects/:id/leave` - Leave squad
- `PUT /api/projects/:id/progress` - Update progress (Admin/Moderator)

#### Member Management
- `PUT /api/projects/:id/members/:userId/role` - Update member role (Admin)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Admin/Moderator)

#### Join Requests
- `GET /api/projects/:id/join-requests` - Get pending requests (Admin/Moderator)
- `PUT /api/projects/:id/join-requests/:requestId` - Approve/reject request (Admin/Moderator)

#### Squad Rules
- `POST /api/projects/:id/rules` - Create rule (Admin/Moderator)
- `PUT /api/projects/:id/rules/:ruleId` - Update rule (Admin/Moderator)
- `DELETE /api/projects/:id/rules/:ruleId` - Delete rule (Admin/Moderator)

#### Messages
- `PUT /api/projects/:id/messages/:messageId/pin` - Pin/unpin message (Admin/Moderator)

#### Activity
- `GET /api/projects/:id/activity` - Get activity logs (Members)

### Report Endpoints

- `POST /api/reports` - Create report (Authenticated users)
- `GET /api/reports` - Get all reports (Admin)
- `GET /api/reports/:id` - Get report details (Admin)
- `PUT /api/reports/:id` - Update report status (Admin)
- `DELETE /api/reports/:id` - Delete report (Admin)

### Admin Endpoints

- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user permanently
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `PUT /api/admin/mentors/:id/verify` - Verify mentor
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/projects` - Get all projects

## 🗄️ Database Models

### New Models

1. **SquadActivityLog**: Tracks all squad activities
2. **SquadRule**: Stores squad rules and guidelines
3. **JoinRequest**: Manages squad join requests
4. **Report**: Handles user and content reports

### Enhanced Models

1. **Project**: Added squad roles, pinned messages, join approval, discovery tags
2. **Message**: Added pinning, editing tracking
3. **User**: Existing model with isActive flag for account management

## 🚀 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Import project to Vercel
2. Set environment variables
3. Deploy

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@squadup.com or join our Discord community.

---

Built with ❤️ by the SquadUp Team
