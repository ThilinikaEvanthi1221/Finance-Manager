📊 FinanceTracker

A modern personal finance management web app built with React + Tailwind + Chart.js + Framer Motion.

FinanceTracker helps you track income & expenses, set goals, get insights, plan ahead, and manage your salary around the “Perfect Money Plan” — all with a sleek light/dark theme and engaging UI.

✨ Features

💰 Track Income & Expenses
Add or import transactions with support for categories, methods, and auto-suggestions.

🧠 Smart Auto‑Suggest
Auto-detects type/category and generates meaningful descriptions (“Salary – March (LKR 150,000)”, “Rent – April”).

🪙 Perfect Money Plan (Salary Envelopes)
Automatically splits your salary into buckets (Needs, Savings, Investments, Education, Fun, Giving).

📈 Interactive Charts & Insights
Income vs Expenses trend
Expenses by category
Payment method breakdown
Monthly story recap

🔮 Future Projections
“If you keep this pace…”
Trim top category by 15% scenario
Income growth by 5% scenario

📝 Notes + Future Balance Impact
Add upcoming income/expense notes (e.g. bills, bonuses) and instantly see projected balance impact.

✍️ Story Recap
Friendly summaries like:
“In March, you earned LKR 150,000 and spent LKR 142,000, leaving a surplus of LKR 8,000. Biggest spend: Food. Spending rose by 12% vs last month.”

🤖 Built‑in Chatbot Assistant
Ask questions about your transactions or budget, interact with your data smarter.

🎨 Full Light/Dark Mode
Theming supported on Landing, Login, Register, Dashboard — yes, even modals & settings.

🔔 Reminders & Quick Access
Quick add salary/transaction buttons, and notification area.

🚀 Getting Started

## Option 1: Run with Docker (Recommended)

1. **Prerequisites**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop).

2. **Clone the repository**:

   ```bash
   git clone https://github.com/ThilinikaEvanthi1221/debugnerds_hackelite2.0.git
   cd debugnerds_hackelite2.0
   ```

3. **Run with Docker Compose**:

   ```bash
   docker compose up
   ```

   - Frontend: http://localhost
   - Backend API: http://localhost:5000

   This pulls pre-built images from Docker Hub and starts the full-stack app.

## Option 2: Run Locally (Development)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ThilinikaEvanthi1221/debugnerds_hackelite2.0.git
   cd debugnerds_hackelite2.0
   ```

2. **Backend Setup**:

   ```bash
   cd backend
   npm install
   ```

   - Create `backend/.env` with:
     ```
     MONGO_URI=your-mongo-uri
     JWT_SECRET=your-jwt-secret
     HF_API_KEY=your-huggingface-api-key
     ```
   - Run: `npm run dev` (starts on port 5000)

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   - Create `frontend/.env` with:
     ```
     REACT_APP_API_URL=http://localhost:5000
     ```
   - Run: `npm start` (starts on port 3000)

## Environment Variables

- **Backend (.env)**:

  - `MONGO_URI`: MongoDB connection string (currently set to MongoDB Atlas)
  - `JWT_SECRET`: Secret for JWT tokens
  - `HF_API_KEY`: Hugging Face API key for AI features

- **Frontend (.env)**:
  - `REACT_APP_API_URL`: Backend API URL

## Docker Images

Pre-built images are available on Docker Hub:

- Backend: `thilinika1/debugnerds_hackelite2.0-backend`
- Frontend: `thilinika1/debugnerds_hackelite2.0-frontend`

To build locally:

```bash
docker compose up --build
```

## Deployment

The app is containerized and can be deployed to:

- Cloud platforms (Heroku, AWS ECS, Google Cloud Run)
- Kubernetes
- Any Docker-compatible host

Ensure environment variables are set for production.

🛠️ Tech Stack

- **Frontend**: React (CRA), React Router, Framer Motion, TailwindCSS, Chart.js, Lucide React
- **Backend**: Node.js/Express, MongoDB (Atlas), JWT Auth, AI integration (@xenova/transformers)
- **Deployment**: Docker, Docker Compose
- **Database**: MongoDB Atlas (cloud)

👩‍💻 Project Structure

```
.
├── backend/                 # Node.js/Express API server
│   ├── models/             # Mongoose schemas (User, Finance)
│   ├── routes/             # API routes (auth, finance, ai)
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── Dockerfile          # Backend container config
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # App pages
│   │   └── App.js          # Main app component
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml      # Multi-container setup
└── README.md               # This file
```
