# SquadUp 🚀

SquadUp is a premium, real-time collaborative learning platform designed to bridge the gap between students and mentors. It features project-based collaboration, real-time messaging, and high-quality video calling.

## ✨ Features

- **Project Rooms:** Join/create squads, manage tasks, and collaborate on projects.
- **Real-time Messaging:** Project-wide chat and private peer-to-peer messaging.
- **Video Calling:** Integrated, high-performance video calls for mentorship sessions.
- **Mentorship System:** Seamless mentor discovery, slot booking, and availability management.
- **Live Notifications:** Stay updated with instant alerts for messages, bookings, and squad activity.
- **Premium UI:** Modern, responsive "Glassmorphism" design with dark mode support.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion, Axios, Socket.IO-Client, Simple-Peer.
- **Backend:** Node.js, Express, MongoDB, Socket.IO, JWT, Firebase Admin SDK.
- **Authentication:** Firebase Auth (Email/Google).
- **Styling:** CSS3, Tailwind CSS (Modern Design Tokens).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or an Atlas URI)
- Firebase Project (Service Account for Backend, Client Keys for Frontend)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPO_URL>
   cd squad-up
   ```

2. **Backend Setup:**
   ```bash
   cd Backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../Frontend
   npm install
   # Create a .env.local file based on .env.example
   npm run dev
   ```

## 🌍 Deployment

### Backend (Render)
- **Root Directory:** `Backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Env Vars:** Ensure `MONGODB_URI`, `JWT_SECRET`, and `FIREBASE_` keys are set.

### Frontend (Vercel)
- **Root Directory:** `Frontend`
- **Framework Preset:** Next.js
- **Env Vars:** Set `NEXT_PUBLIC_API_URL` to your Render URL.

## 📁 Project Structure

```text
SQUAD-UP/
├── Backend/          # Node.js API & Socket Server
│   ├── config/       # DB & Firebase configurations
│   ├── controllers/  # Business logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   └── socket/       # Real-time event handlers
├── Frontend/         # Next.js Application
│   ├── app/          # Pages & Routing
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities (Axios, Socket service)
│   └── store/        # State management (Zustand)
└── README.md
```

## 📄 License
This project is licensed under the MIT License.
