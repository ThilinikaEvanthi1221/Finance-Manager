import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../ThemeContext"; // <- import hook

// Reusable Button
const Button = ({ children, to, className }) => {
  if (to) {
    return (
      <Link
        to={to}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 inline-block ${className}`}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

// Toggle Component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 border rounded-lg text-sm hover:shadow-md
                 border-darkGreen dark:border-green-400
                 text-darkGreen dark:text-green-400
                 bg-white dark:bg-black transition"
    >
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-darkGreen dark:bg-black dark:text-green-400 flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-darkGreen/30 dark:border-green-500/30">
        <h1 className="text-2xl font-extrabold tracking-wide text-darkGreen dark:text-green-400 drop-shadow-lg">
          FinanceTracker
        </h1>
        <div className="space-x-4 flex items-center">
          <Button
            to="/login"
            className="bg-transparent border border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-white 
                       dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-black
                       shadow-md transition"
          >
            Login
          </Button>
          <Button
            to="/register"
            className="bg-darkGreen text-white hover:bg-green-900
                       dark:bg-green-400 dark:text-black dark:hover:bg-green-500
                       shadow-md transition"
          >
            Signup
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-darkGreen dark:text-green-400 drop-shadow-lg"
        >
          Take Control of Your Finances
        </motion.h2>
        <p className="mt-4 text-lg md:text-xl text-darkGreen/80 dark:text-green-200 max-w-2xl">
          Track income and expenses, manage budgets, and plan your future with
          smart insights and analytics — all in one platform.
        </p>

        <div className="mt-8 flex space-x-6">
          <Button
            to="/login"
            className="bg-transparent border border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-white
                       dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-black
                       px-6 py-3 shadow-md"
          >
            Login
          </Button>
          <Button
            to="/register"
            className="bg-darkGreen text-white hover:bg-green-900
                       dark:bg-green-400 dark:text-black dark:hover:bg-green-500
                       px-6 py-3 shadow-md"
          >
            Signup
          </Button>
        </div>
      </main>

      {/* Journey Steps Section */}
      <section className="bg-gray-100 dark:bg-black/95 py-16 px-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-darkGreen dark:text-green-400 mb-4 drop-shadow-lg">
              How <span className="text-green-700 dark:text-green-300">FinanceTracker</span> Works
            </h2>
            <p className="text-darkGreen/70 dark:text-green-200 text-lg max-w-2xl mx-auto">
              Our 5-step process makes financial tracking and planning simple and effective
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Sign Up", description: "Create your free account in minutes." },
              { step: "02", title: "Add Income & Expenses", description: "Log transactions or connect bank accounts." },
              { step: "03", title: "Set Goals", description: "Define goals like saving, investing, or debt reduction." },
              { step: "04", title: "Get Insights", description: "View analytics and graphs to understand habits." },
              { step: "05", title: "Plan Ahead", description: "Create budgets and money plans to stay on track." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="flex items-center space-x-8 border-l-2 border-darkGreen/30 dark:border-green-500/50 pl-8 py-4"
              >
                <div className="text-3xl font-bold text-darkGreen dark:text-green-500 w-16">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-darkGreen dark:text-green-400 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-darkGreen/70 dark:text-green-200">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 py-16 bg-gray-100 dark:bg-black/90 transition-colors">
        {[
          {
            title: "Track Income",
            desc: "Record income sources and visualize your earnings."
          },
          {
            title: "Analyze Expenses",
            desc: "Understand where your money goes with reports & charts."
          },
          {
            title: "Plan Future",
            desc: "Set budgets and achieve your financial goals."
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl border border-darkGreen/30 dark:border-green-500/40 
                       bg-white dark:bg-black p-6 
                       shadow-lg shadow-darkGreen/20 dark:shadow-green-500/30 text-center transition-colors"
          >
            <h3 className="text-2xl font-bold text-darkGreen dark:text-green-400 mb-2 drop-shadow-md">
              {feature.title}
            </h3>
            <p className="text-darkGreen/70 dark:text-green-200">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 dark:bg-black/95 py-16 px-8 border-y border-darkGreen/30 dark:border-green-500/20 transition-colors">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-darkGreen dark:text-green-400 mb-12">
            Helping Users Achieve Financial Freedom
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "$50M+", label: "Expenses Tracked" },
              { number: "95%", label: "Goal Success Rate" },
              { number: "24/7", label: "Smart Insights" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-darkGreen dark:text-green-400 drop-shadow-lg">
                  {stat.number}
                </div>
                <div className="text-darkGreen/70 dark:text-green-200 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Boost Business CTA */}
      <section className="bg-gray-100 dark:bg-black py-16 px-8 transition-colors">
  <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-darkGreen dark:text-green-400 mb-6 drop-shadow-lg"
          >
            Smarter Money Management Starts Here
          </motion.h2>
          <p className="text-darkGreen/70 dark:text-green-200 text-lg mb-8 max-w-2xl mx-auto">
            Simplify your finances, gain insights, and take the next step
            towards financial success.
          </p>
           <Button
            to="/register"
            className="bg-darkGreen text-white hover:bg-green-900
                       dark:bg-green-400 dark:text-black dark:hover:bg-green-500
                       text-lg px-8 py-4 shadow-xl transition-colors"
          >
            Start Tracking for Free
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 dark:bg-black py-16 px-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-darkGreen dark:text-green-400 text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ayesha Perera",
                role: "Student",
                quote:
                  "FinanceTracker helped me track my allowance and save more each month. I love the simple design!"
              },
              {
                name: "Ravi Kumar",
                role: "Small Business Owner",
                quote:
                  "Managing both income and expenses was a mess before. Now I can see everything clearly with FinanceTracker."
              },
              {
                name: "Emily Rodriguez",
                role: "Financial Advisor",
                quote:
                  "I recommend FinanceTracker to my clients — it’s the best way to build good money habits."
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white dark:bg-black/50 border border-darkGreen/30 dark:border-green-500/30 rounded-lg p-6 shadow-lg shadow-darkGreen/20 dark:shadow-green-500/20 transition-colors"
              >
                <p className="text-darkGreen/70 dark:text-green-200 italic mb-4">"{testimonial.quote}"</p>
                <div className="border-t border-darkGreen/20 dark:border-green-500/20 pt-4">
                  <div className="text-darkGreen dark:text-green-400 font-bold">{testimonial.name}</div>
                  <div className="text-darkGreen/70 dark:text-green-300 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 border-t border-darkGreen/30 dark:border-green-500/20 bg-gray-100 dark:bg-black/95 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-darkGreen dark:text-green-400 mb-4">
            Ready to Master Your Money?
          </h2>
          <p className="text-darkGreen/70 dark:text-green-200 mb-8 max-w-xl mx-auto">
            Join thousands of users who are already tracking smarter and planning better
          </p>
           <Button
            to="/register"
            className="bg-darkGreen text-white hover:bg-green-900
                       dark:bg-green-400 dark:text-black dark:hover:bg-green-500
                       text-lg px-8 py-4 shadow-xl transition-colors"
          >
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-gray-100 dark:bg-black border-t border-darkGreen/30 dark:border-green-500/30 px-8 py-12 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-darkGreen dark:text-green-400 mb-4 drop-shadow-md">
                FinanceTracker
              </h3>
              <p className="text-darkGreen/70 dark:text-green-200 text-sm mb-4">
                The simplest way to track income, expenses, and plan for a better tomorrow.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-darkGreen/10 dark:bg-green-500/20 border border-darkGreen/30 dark:border-green-500/50 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="text-darkGreen dark:text-green-400 text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-darkGreen/10 dark:bg-green-500/20 border border-darkGreen/30 dark:border-green-500/50 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="text-darkGreen dark:text-green-400 text-xs">@</span>
                </div>
                <div className="w-8 h-8 bg-darkGreen/10 dark:bg-green-500/20 border border-darkGreen/30 dark:border-green-500/50 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="text-darkGreen dark:text-green-400 text-xs">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-darkGreen dark:text-green-400 mb-4">Menu</h4>
              <ul className="space-y-2 text-sm text-darkGreen/70 dark:text-green-200">
                <li className="hover:text-darkGreen dark:hover:text-green-400 cursor-pointer">Features</li>
                <li className="hover:text-darkGreen dark:hover:text-green-400 cursor-pointer">Pricing</li>
                <li className="hover:text-darkGreen dark:hover:text-green-400 cursor-pointer">About</li>
                <li className="hover:text-darkGreen dark:hover:text-green-400 cursor-pointer">Testimonials</li>
                <li className="hover:text-darkGreen dark:hover:text-green-400 cursor-pointer">Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-darkGreen dark:text-green-400 mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-darkGreen/70 dark:text-green-200">
                <li>Income Tracking</li>
                <li>Expense Reports</li>
                <li>Budget Planning</li>
                <li>Goal Setting</li>
                <li>Financial Insights</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-darkGreen dark:text-green-400 mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm text-darkGreen/70 dark:text-green-200">
                <div className="flex items-center space-x-2">
                  <span className="text-darkGreen dark:text-green-400">📞</span>
                  <span>+94 71 234 5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-darkGreen dark:text-green-400">✉️</span>
                  <span>support@financetracker.com</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-darkGreen dark:text-green-400">📍</span>
                  <div>
                    <div>Finance Tracker</div>
                    <div>Colombo, Sri Lanka</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-darkGreen/20 dark:border-green-500/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-darkGreen/70 dark:text-green-200 text-sm mb-4 md:mb-0">
              © 2025 FinanceTracker. All rights reserved.
            </div>
            <div className="text-darkGreen dark:text-green-400 text-sm">
              Built for Smarter Money Management
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}