# VibeVault

VibeVault is a full-stack marketplace web application that lets users buy, sell, and rent items across categories like clothes, books, appliances, furniture, snacks, and stationery.

**Live Demo:** 
https://vibevault-1.onrender.com

**Backend API:** 
https://vibevault-7tc6.onrender.com


---

## Features

- **Authentication** — Session-based auth with OTP verification via email/SMS at signup and password reset
(CURRENTLY ONLY E-MAIL)
- **Role-based access** — Separate flows for regular users and admins
- **Buy & Rent flows** — Users can purchase items outright or rent them, with dedicated confirmation and order pages
- **Seller dashboard** — Sellers can manage buy orders in one place
- **Product browsing** — Category pages, search, and detailed item views with image galleries
- **Reviews & ratings** — Star ratings with review creation and deletion
- **Cart system** — Persistent cart with live product data and image rendering
- **Dark mode** — App-wide theme toggle built with a consistent design token system
- **Image uploads** — In-memory multer handling for product images stored directly in MongoDB

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js / Express
- MongoDB with Mongoose
- Session-based authentication
- Multer (image uploads)
- Brevo (transactional email/OTP delivery)

**Deployment**
- Render (separate frontend static site + backend web service)
- MongoDB Atlas

---

## Architecture

```
vibevault/
├── frontend/          # React + Vite 
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/     # Auth & dark mode context
│   │   └── api.js       # Centralized Axios instance
├── appback/ 
|seller/     # Express backend
│   ├── models/          # Mongoose customer
│   ├── routes/
│   ├── controllers/
│   └── utils/ 
│              # OTP, email helpers
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)
- Brevo account for transactional email

### Installation

```bash
# Clone the repo
git clone https://github.com/Aseem2211/vibevault.git
cd vibevault

# Install backend dependencies
cd appback
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**appback/.env**
```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
BREVO_API_KEY=your_brevo_api_key
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3004
```

### Running Locally

```bash
# Start backend (from /server)
npm start

# Start frontend (from /client)
npm run dev
```

---

## Screenshots

*(Add a few screenshots or a short GIF here — product listing page, seller dashboard, and cart work well)*

---

## Key Challenges & Solutions

- **Cross-domain sessions on Render** — Solved by configuring `sameSite: "none"` and `secure: true` on session cookies for the separate frontend/backend deployments.
- **Email delivery on Render's free tier** — SMTP ports were blocked, so email sending was migrated to Brevo's HTTP API.
- **Image rendering** — Product images are stored as buffers in MongoDB and converted to base64 on the fly for display.

---

## License

This project is for educational purposes.