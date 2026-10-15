# 🏡 Dream Nest — Full-Stack Vacation Rental Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux%20Toolkit-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Dream Nest** is a full-stack, enterprise-grade vacation rental and home booking platform inspired by Airbnb. Built with modern MERN architecture, it delivers real-time property discovery, multi-step listing creation, interactive booking calendars, optimistic wishlist favoriting, and secure JWT authentication.

---

## ✨ Features

- 🌟 **Dynamic Category Discovery**: 15 distinct vacation categories (Beachfront, Windmills, Iconic cities, Countryside, Amazing Pools, Islands, Lakefront, Ski-in/out, Castles, Caves, Camping, Arctic, Desert, Barns, Luxury).
  - **Deduplicated Feed**: Homepage displays one curated representative property per category for a clean, non-repetitive feed.
  - **Category Drill-Down**: Selecting any category instantly renders all properties matching that category.
- ❤️ **Optimistic Wishlist System**: Instant heart toggle feedback with zero-latency state transitions, synced with Redux-Persist and backed by MongoDB persistence.
- 📅 **Interactive Booking Engine**: Date range selection powered by `react-date-range` with dynamic nightly price computation and duplicate reservation prevention.
- 🏡 **Host Management & Property Creation**: Multi-step property wizard with photo uploads, category tagging, accommodation specs, and amenity checklists.
- 🔍 **Real-Time Search**: Multi-field search across titles, categories, cities, provinces, and countries.
- 🔐 **Robust Authentication**: Secure registration and login flow utilizing Bcrypt password hashing and JWT (JSON Web Tokens).
- 📱 **Fully Responsive UI**: Mobile-first design crafted with Sass (SCSS) and Material-UI icons.

---

## 🛠️ Tech Stack

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **State Management**: Redux Toolkit & Redux-Persist (offline state sync)
- **Styling**: Sass / SCSS (BEM naming conventions, responsive mixins)
- **UI Components**: Material-UI (MUI Icons) & React Icons
- **Calendar**: `react-date-range` & `date-fns`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose 8
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs`
- **File Handling**: Multer (disk storage with unique hash suffixes)
- **Cross-Origin**: CORS middleware with credential support

---

## 📂 Project Architecture

```
Dreams-Nest/
├── client/                     # React Frontend Application
│   ├── public/                 # Static assets, favicon, HTML template
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, ListingCard, Listings, Categories, Footer, etc.)
│   │   ├── pages/              # Route pages (HomePage, ListingDetails, WishList, CreateListing, etc.)
│   │   ├── redux/              # Redux slices, actions, and persisted store
│   │   ├── services/           # Centralized API service & image normalization helpers
│   │   ├── styles/             # Modular SCSS stylesheets, variables, and breakpoints
│   │   └── data.js             # Category definitions and amenities metadata
│   ├── .env.example            # Client environment template
│   └── package.json
│
├── server/                     # Express & Node.js Backend API
│   ├── middleware/             # JWT authentication verification middleware
│   ├── models/                 # Mongoose schemas (User, Listing, Booking)
│   ├── public/uploads/         # Upload directory for listing photos
│   ├── routes/                 # REST API routes (auth, listing, booking, user)
│   ├── seed.js                 # Database seeder (60 luxury listings across 15 categories)
│   ├── index.js                # Server entry point & database connection
│   ├── .env.example            # Server environment template
│   └── package.json
│
├── .gitignore                  # Security-first Git ignore rules
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas cloud URI)
- Git

---

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd "Dreams Nest"
```

---

### 2. Configure Environment Variables

#### Backend (`server/.env`):
Create a `.env` file in the `server` directory based on `server/.env.example`:
```env
PORT=3001
MONGO_URL=mongodb://127.0.0.1:27017/dreams_nest
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:3000
```

#### Frontend (`client/.env`):
Create a `.env` file in the `client` directory based on `client/.env.example`:
```env
REACT_APP_API_URL=http://localhost:3001
GENERATE_SOURCEMAP=false
```

---

### 3. Install Dependencies

#### Install Backend Dependencies:
```bash
cd server
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../client
npm install
```

---

### 4. Seed the Database
Populate the database with 60 curated, luxury property listings (exactly 4 properties per category) and demo accounts:
```bash
cd ../server
node seed.js
```

**Pre-configured Demo Accounts:**
- **Demo User:** `dani@dreamnest.com` | **Password:** `password123`
- **Host User:** `sarah@dreamnest.com` | **Password:** `password123`

---

### 5. Run the Application

Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm start
# Client opens on http://localhost:3000
```

---

## 📡 API Reference

### Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (with profile picture upload) |
| `POST` | `/auth/login` | Authenticate user and issue JWT token |

### Properties (`/properties`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/properties` | Fetch listings (supports `?category=<category>` filter) |
| `GET` | `/properties/search/:search` | Search listings by query string |
| `GET` | `/properties/:listingId` | Get detailed information for a specific property |
| `POST` | `/properties/create` | Create a new listing with photo uploads (Multer) |
| `DELETE` | `/properties/:listingId` | Delete a property (Host only) |

### Bookings (`/bookings`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/bookings/create` | Create a booking reservation |

### User Management (`/users`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users/:userId/trips` | Retrieve user's booked trips |
| `GET` | `/users/:userId/wishList` | Retrieve user's saved wishlist properties |
| `PATCH` | `/users/:userId/:listingId` | Toggle a property in user's wishlist |
| `GET` | `/users/:userId/properties` | Retrieve properties listed by user |
| `GET` | `/users/:userId/reservations` | Retrieve reservations made on host's properties |

---

## 🌐 Deployment Guide

### Deploy Backend (e.g., Render / Railway)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/) or [Railway](https://railway.app/).
3. Set Root Directory to `server`.
4. Set Build Command: `npm install`.
5. Set Start Command: `npm start`.
6. Add Environment Variables:
   - `MONGO_URL`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret.
   - `CLIENT_URL`: Your deployed frontend URL.

### Deploy Frontend (e.g., Vercel / Netlify)
1. Create a new Project on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Set Root Directory to `client`.
3. Set Build Command: `npm run build`.
4. Set Output Directory: `build`.
5. Add Environment Variable:
   - `REACT_APP_API_URL`: Your deployed backend service URL (e.g., `https://your-api.onrender.com`).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
