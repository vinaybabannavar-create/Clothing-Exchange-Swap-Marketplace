<div align="center">

# 👗 SwapWear — Clothing Exchange & Swap Marketplace

### *Swap smart. Wear sustainably. Waste nothing.*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-8E24AA?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

> **SwapWear** is a full-stack clothing exchange marketplace where users can list, browse, and swap wearable clothes — completely free, payment-free, and eco-friendly. Built with a Python (FastAPI) backend and a React + TailwindCSS frontend, it supports swap negotiation powered by **Google Gemini AI**.

<br/>

---

</div>

## 🌟 Why SwapWear?

> Every year, **92 million tonnes** of clothing ends up in landfills. SwapWear tackles that by making direct barter-style clothing exchange as seamless as online shopping.

| 💚 No Payments | 🤝 Direct Swaps | 🌍 Sustainable Fashion | 🤖 AI-Assisted Chat |
|:-:|:-:|:-:|:-:|
| Swap clothes without spending money | Match with real people near you | Reduce fashion waste & CO₂ | Gemini AI helps you negotiate |

---

## ✨ Features

### 🛍️ Marketplace
- **Browse Listings** — Filter by category, size, condition, location & sort by value
- **Smart Search** — Search by title, brand, or category in real time
- **Item Detail View** — Estimated value, nearby matches, fair-value matches, owner info
- **Image Upload** — Upload photos for your listings

### 🔄 Swap System
- **Send Swap Requests** — Offer your item in exchange for another
- **Value Comparison** — See the value difference between items before swapping
- **Delivery Options** — Choose local meetup or courier exchange
- **Swap Status Tracking** — Pending → Accepted → Completed flow

### 💬 Chat & Negotiation
- **Real-Time Chat** — Negotiate details with the other user per swap
- **🤖 Gemini AI Assistant** — AI replies help guide negotiation (size, condition, pickup)
- **Chat Rooms** — Each swap has its own dedicated chat room

### 👤 User System
- **Register & Login** — Secure SHA-256 password hashing
- **Profile Management** — Edit name, bio, and location
- **Swap History** — View all incoming and outgoing swap requests

### 🛡️ Admin Panel
- **Platform KPIs** — Total users, listings, swaps, success rate
- **User Management** — Ban/unban users
- **Listing Moderation** — Remove listings
- **Swap Monitoring** — View all platform swap activity

---

## 🏗️ Project Architecture

```
Clothing Exchange & Swap Marketplace/
│
├── 📁 app/
│   ├── 📁 backend/               # Python FastAPI Backend
│   │   ├── server.py             # All API routes (780 lines)
│   │   ├── requirements.txt      # Python dependencies
│   │   └── .env                  # Backend environment variables
│   │
│   └── 📁 frontend/              # React + TailwindCSS Frontend
│       ├── 📁 src/
│       │   ├── 📁 pages/
│       │   │   ├── Home.js       # Landing page
│       │   │   ├── Auth.js       # Login & Register
│       │   │   ├── Browse.js     # Browse listings with filters
│       │   │   ├── ItemDetail.js # Item detail + swap request
│       │   │   ├── Dashboard.js  # User dashboard
│       │   │   ├── SwapRequests.js # Incoming/outgoing swaps
│       │   │   ├── Chat.js       # Negotiation chat
│       │   │   └── AdminPanel.js # Admin dashboard
│       │   ├── 📁 components/
│       │   │   ├── Navbar.js
│       │   │   └── ListingCard.js
│       │   ├── 📁 contexts/
│       │   │   └── AuthContext.js
│       │   └── 📁 utils/
│       │       ├── api.js
│       │       └── currency.js
│       ├── package.json
│       └── tailwind.config.js
│
├── .gitignore
├── PRD.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Python 3.11+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

---

### ⚙️ Backend Setup (FastAPI)

```bash
# 1. Navigate to the backend directory
cd app/backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. (Optional) Add your Gemini AI API Key for AI chat
#    Create/edit app/backend/.env:
echo GEMINI_API_KEY=your_api_key_here > .env

# 6. Start the backend server
uvicorn server:app --reload --port 8000
```

✅ Backend running at: **http://localhost:8000**  
📄 API Docs available at: **http://localhost:8000/docs**

---

### 🎨 Frontend Setup (React)

```bash
# 1. Navigate to the frontend directory
cd app/frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

✅ Frontend running at: **http://localhost:3000**

---

### 🔑 Demo Login Credentials

Use these credentials to log in without registering:

| Field | Value |
|-------|-------|
| **Email** | `demo@swapwear.local` |
| **Password** | `demo123` |
| **Role** | Admin (full access) |

> The demo account has access to the Admin Panel and all platform features.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with email/password |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/listings` | Browse listings (filter, sort, paginate) |
| `POST` | `/api/listings` | Create a new listing |
| `GET` | `/api/listings/{id}` | Get listing details |
| `GET` | `/api/listings/{id}/matches` | Get nearby & fair-value matches |
| `POST` | `/api/swaps` | Create a swap request |
| `GET` | `/api/swaps` | Get all swap requests |
| `PUT` | `/api/swaps/{id}/{action}` | Accept / reject / complete a swap |
| `GET` | `/api/chat/rooms` | Get all chat rooms |
| `POST` | `/api/chat/rooms/{id}/messages` | Send a message + get AI reply |
| `GET` | `/api/admin/stats` | Admin platform KPIs |
| `GET` | `/api/admin/users` | Admin: list all users |
| `PUT` | `/api/admin/users/{id}/ban` | Admin: ban/unban user |

> Full interactive API docs available at `http://localhost:8000/docs` (Swagger UI)

---

## 🤖 Gemini AI Integration

SwapWear uses **Google Gemini 2.0 Flash** to power the in-chat AI assistant:

- The AI assistant replies to every chat message automatically
- It helps users negotiate swap terms — sizes, conditions, pickup/delivery
- Context-aware: reads the last 8 messages and swap details before replying

**To enable AI chat:**
1. Get a free API key at [Google AI Studio](https://aistudio.google.com/)
2. Add it to `app/backend/.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. Restart the backend server

> Without the API key, the app still works fully — AI chat will show a friendly placeholder message.

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Core language |
| **FastAPI** | 0.110.1 | REST API framework |
| **Uvicorn** | 0.25.0 | ASGI server |
| **Pydantic** | v2 | Data validation |
| **Google Gemini** | 2.0 Flash | AI chat assistant |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework |
| **React Router** | v6 | Client-side routing |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 11 | Animations |
| **Axios** | 1.8 | HTTP client |
| **Lucide React** | 0.507 | Icon library |

---

## 📱 Application Pages

| Page | Route | Description |
|------|-------|-------------|
| 🏠 **Home** | `/` | Landing page with hero & features |
| 🔐 **Auth** | `/auth` | Login & Registration |
| 🔍 **Browse** | `/browse` | Browse & filter all listings |
| 👕 **Item Detail** | `/listings/:id` | View item + send swap request |
| 📊 **Dashboard** | `/dashboard` | User's listings & profile |
| 🔄 **Swap Requests** | `/swaps` | Incoming & outgoing swaps |
| 💬 **Chat** | `/chat/:roomId` | Swap negotiation chat |
| 🛡️ **Admin Panel** | `/admin` | Platform management |

---

## 🌍 Eco Impact

SwapWear tracks and displays the **environmental impact** of every swap:

- ♻️ CO₂ saved compared to buying new
- 📦 Wardrobe reuse value in INR
- 🌱 Items kept in circulation

> *"Every swap is a vote for a more sustainable world."*

---

## 🔮 Future Roadmap

- [ ] 💳 Online payment for partial value top-ups
- [ ] 📱 React Native mobile app (iOS & Android)
- [ ] 🔍 AR Virtual Try-On
- [ ] 🚚 Live courier API integration
- [ ] 🗄️ PostgreSQL persistent database
- [ ] 📧 Email notifications for swap updates
- [ ] ⭐ User ratings & reviews after swaps

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ If you like SwapWear, please give it a star on GitHub! ⭐

**Made with 💚 for sustainable fashion**

*SwapWear — Because your wardrobe's next chapter is someone else's new favourite.*

</div>
