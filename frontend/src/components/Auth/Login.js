// src/components/Auth/Login.js
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Wallet, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../ThemeContext"; // ✅ import the theme hook

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme(); // ✅ use theme context

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data?.error || "Invalid email or password" });
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth?.(true);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ general: "Could not connect to server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center px-4 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full bg-white dark:bg-black/90 border border-darkGreen/30 dark:border-green-500/50 
                   rounded-2xl shadow-lg shadow-darkGreen/20 dark:shadow-green-500/30 p-8 transition-colors"
      >
        {/* ✅ Toggle Button inside Login card */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 border rounded-lg text-xs md:text-sm 
                       border-darkGreen dark:border-green-400
                       text-darkGreen dark:text-green-400
                       bg-white dark:bg-black transition hover:shadow-md"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-darkGreen/10 dark:bg-green-900/30 rounded-full mb-4">
            <Wallet className="h-8 w-8 text-darkGreen dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-darkGreen dark:text-green-400 drop-shadow-md">
            Welcome Back
          </h2>
          <p className="text-darkGreen/70 dark:text-green-200 mt-2">
            Sign in to manage your finances
          </p>
          {location.state?.registered && (
            <div className="mt-3 text-sm text-darkGreen dark:text-green-400">
              Account created. Please log in.
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-darkGreen dark:text-green-200 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-darkGreen dark:text-green-400" />
              <input
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-darkGreen/30 dark:border-green-500/50 
                           rounded-lg bg-white dark:bg-black/70 
                           text-darkGreen dark:text-green-200 
                           placeholder-darkGreen/50 dark:placeholder-green-400 
                           focus:ring-2 focus:ring-darkGreen dark:focus:ring-green-400 focus:border-transparent transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-darkGreen dark:text-green-200 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-darkGreen dark:text-green-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2 border border-darkGreen/30 dark:border-green-500/50 
                           rounded-lg bg-white dark:bg-black/70 
                           text-darkGreen dark:text-green-200 
                           placeholder-darkGreen/50 dark:placeholder-green-400 
                           focus:ring-2 focus:ring-darkGreen dark:focus:ring-green-400 focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-darkGreen dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-darkGreen/70 dark:text-green-200 text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-darkGreen/40 dark:border-green-500 text-darkGreen dark:text-green-400 focus:ring-darkGreen dark:focus:ring-green-400"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link to="#" className="hover:text-darkGreen dark:hover:text-green-400">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-darkGreen text-white dark:bg-green-400 dark:text-black
                       py-2 px-4 rounded-lg hover:bg-green-900 dark:hover:bg-green-500 
                       transition-colors font-medium shadow-lg 
                       shadow-darkGreen/20 dark:shadow-green-500/30 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Extra links */}
          <div className="text-center text-darkGreen/70 dark:text-green-200 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-darkGreen dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;