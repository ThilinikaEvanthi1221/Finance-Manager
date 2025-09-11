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

1. Clone the repository
   Bash:
   git clone https://github.com/your-username/finance-tracker.git
   cd finance-tracker

2. Install dependencies
   Bash:
   npm install

3. Configure environment variables
   In the project root, create a .env file:

env
REACT_APP_API_URL=http://localhost:5000
Or if using Vite:

env
VITE_API_URL=http://localhost:5000

4. Run the app locally
   Bash

npm start
Open 👉 http://localhost:3000

📦 Available Scripts

npm start → start dev server
npm run build → build for production (/build)
npm test → run tests (Jest/RTL)
npm run eject → CRA eject

🛠️ Tech Stack

Frontend: React (CRA or Vite), React Router, Framer Motion
Styling: TailwindCSS (full Light/Dark theme support)
Charts: Chart.js (Line, Doughnut, Bar)
Icons: Lucide React (Feather‑style icons)
Backend: Node.js/Express (API for auth + finance data)
Auth: JWT via API

👩‍💻 Project Structure
text

src/
├── components/ # Buttons, Auth forms, Footer, etc.
├── pages/ # LandingPage, Login, Register, Dashboard, Chatbot
├── ThemeContext.js # Light/Dark context + toggle
├── index.css # Tailwind imports
├── App.jsx # Routes
└── main.jsx # Entry

# .env.example

VITE_API_URL=http://localhost:5000
JWT_SECRET=your-jwt-secret
MONGO_URI=your-mongo-uri
