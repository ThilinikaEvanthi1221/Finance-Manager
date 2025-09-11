// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import Chatbot from "./Chatbot";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  FileText,
  Notebook,
  Settings,
  HelpCircle,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  X,
  PieChart,
  TrendingUp,
  Calendar,
  Info,
  LogOut,
  User2,
  Twitter,
  Facebook,
  Instagram,
  Github,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ArcElement
);


const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

// Utils
const cn = (...c) => c.filter(Boolean).join(" ");
const currencyFmt = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});
const currency = (n) => currencyFmt.format(n || 0);
const todayStr = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().split("T")[0]; };
const parseLocalMidday = (dateStr) => new Date(`${dateStr}T12:00:00`);
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const uid = () => Math.random().toString(36).slice(2);
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
const initialsFromName = (name) =>
  (name || "User")
    .split(" ")
    .slice(0, 2)
    .map((n) => (n[0] || "").toUpperCase())
    .join("") || "U";

// Category normalization and colors
const CATEGORY_SYNONYMS = {
  groceries: "food", grocery: "food", restaurant: "food", dining: "food", takeaway: "food",
  gas: "transport", fuel: "transport", transportation: "transport",
  electricity: "utilities", water: "utilities", internet: "utilities", phone: "utilities",
  doctor: "healthcare", medical: "healthcare",
  paycheck: "salary", wage: "salary", bonus: "salary",
};
const normalizeCat = (c = "") => (CATEGORY_SYNONYMS[c.toLowerCase().trim()] || c.toLowerCase().trim());
const CATEGORY_COLORS = {
  food: "#ef4444", rent: "#f97316", transport: "#3b82f6", utilities: "#6b7280", entertainment: "#a855f7",
  healthcare: "#10b981", salary: "#0ea5e9", freelance: "#22c55e", education: "#6366f1",
  shopping: "#fb7185", insurance: "#f59e0b", travel: "#06b6d4", other: "#14b8a6",
};
const FALLBACK_COLORS = ["#34D399","#10B981","#059669","#6EE7B7","#A7F3D0","#99F6E4","#5EEAD4","#2DD4BF","#14B8A6","#0D9488"];
const getCategoryColor = (cat = "", idx = 0) => CATEGORY_COLORS[normalizeCat(cat)] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

// Payment methods
const PAYMENT_METHODS = ["card", "cash", "bank", "bill", "upi", "wallet", "other"];

// Default Salary Plan
const defaultSalaryPlan = [
  { id: "needs", label: "Needs", pct: 0.5, color: "#16a34a" },
  { id: "savings", label: "Savings", pct: 0.2, color: "#2563eb" },
  { id: "investments", label: "Investments", pct: 0.1, color: "#f59e0b" },
  { id: "education", label: "Education", pct: 0.1, color: "#a855f7" },
  { id: "fun", label: "Fun", pct: 0.05, color: "#ec4899" },
  { id: "giving", label: "Giving", pct: 0.05, color: "#ef4444" },
];

// Map expense categories into plan buckets
const BUCKET_MAP = {
  rent: "needs", utilities: "needs", food: "needs", healthcare: "needs", transport: "needs", insurance: "needs",
  education: "education",
  investment: "investments", investments: "investments",
  entertainment: "fun", shopping: "fun", travel: "fun", dining: "fun",
  giving: "giving", donation: "giving",
};
const bucketForCategory = (c) => BUCKET_MAP[normalizeCat(c)] || "needs";

const prettyDate = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};
const monthYear = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
};

// Build last 6 months
const buildMonthlyData = (tx = []) => {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthLabel = date.toLocaleString(undefined, { month: "short" });
    let income = 0, expenses = 0;
    tx.forEach((t) => {
      const td = parseLocalMidday(t.date);
      if (td.getMonth() === monthIndex && td.getFullYear() === year) {
        if (t.type === "income") income += t.amount || 0;
        else if (t.type === "expense") expenses += t.amount || 0;
      }
    });
    result.push({ month: monthLabel, monthIndex, year, income: Math.round(income), expenses: Math.round(expenses) });
  }
  return result;
};

// Months with data only
const buildAvailableMonthlyData = (tx = []) => {
  const map = new Map();
  tx.forEach((t) => {
    const d = parseLocalMidday(t.date);
    const key = monthKey(d);
    if (!map.has(key)) map.set(key, { income: 0, expenses: 0, date: new Date(d.getFullYear(), d.getMonth(), 1) });
    const entry = map.get(key);
    if (t.type === "income") entry.income += t.amount || 0;
    else if (t.type === "expense") entry.expenses += t.amount || 0;
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, v]) => ({
      key,
      month: v.date.toLocaleString(undefined, { month: "short" }),
      longMonth: v.date.toLocaleString(undefined, { month: "long" }),
      monthIndex: v.date.getMonth(),
      year: v.date.getFullYear(),
      income: Math.round(v.income),
      expenses: Math.round(v.expenses),
    }));
};

const inferTypeFromCategory = (cat, historyMap) => {
  if (!cat) return null;
  const k = normalizeCat(cat);
  if (historyMap[k]) return historyMap[k];
  if (/salary|paycheck|wage|bonus/i.test(cat)) return "income";
  return "expense";
};
const suggestDescription = (cat, type, dateStr, amount) => {
  const k = normalizeCat(cat || "");
  if (/salary|paycheck|wage/i.test(k || "")) return `Salary - ${monthYear(dateStr)} (${currency(amount || 0)})`;
  if (/rent/.test(k)) return `Rent - ${monthYear(dateStr)}`;
  if (/food/.test(k)) return `Groceries - ${prettyDate(dateStr)}`;
  if (/transport/.test(k)) return `Transport - ${prettyDate(dateStr)}`;
  if (/utilities/.test(k)) return `Utilities - ${prettyDate(dateStr)}`;
  if (/healthcare/.test(k)) return `Healthcare - ${prettyDate(dateStr)}`;
  return `${cap(cat || "Transaction")} - ${prettyDate(dateStr)}`;
};

const InfoTooltip = ({ text, className = "" }) => (
  <span className={cn("relative inline-flex items-center group", className)}>
    <Info className="h-4 w-4 text-green-400 cursor-help" />
    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-6 hidden group-hover:block whitespace-pre rounded-md border border-green-500/40 bg-white px-3 py-2 text-xs text-black shadow shadow-green-500/20 z-10 w-56">
      {text}
    </span>
  </span>
);

const FinanceTracker = () => {
  // Header profile
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const profileRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [errorMsg, setErrorMsg] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);

  // Settings (localStorage)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("iftiak_settings");
    return (
      JSON.parse(saved || "null") || {
        currency: "LKR",
        defaultPaymentMethod: "card",
        enableAutoSuggest: true,
        weekStartsOn: "Mon",
        theme: "light",
        salaryPlan: defaultSalaryPlan,
      }
    );
  });
  useEffect(() => { localStorage.setItem("iftiak_settings", JSON.stringify(settings)); }, [settings]);
  const salaryPlan = settings.salaryPlan;

  // smart fill helpers
  const [descEdited, setDescEdited] = useState(false);
  const [descSuggestion, setDescSuggestion] = useState("");

  // Add Transaction state
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    type: "expense",
    paymentMethod: settings.defaultPaymentMethod || "card",
    description: "",
    date: todayStr(),
  });
  useEffect(() => { setFormData((f) => ({ ...f, paymentMethod: settings.defaultPaymentMethod || "card" })); }, [settings.defaultPaymentMethod]);

  // Salary form state
  const [salaryData, setSalaryData] = useState({ amount: "", date: todayStr(), description: "" });

  // Notes (localStorage)
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("iftiak_notes") || "[]"));
  useEffect(() => { localStorage.setItem("iftiak_notes", JSON.stringify(notes)); }, [notes]);

  // Data (from backend)
  const [transactions, setTransactions] = useState([]);

  // Fetch from backend on mount (with Authorization)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setFetchError("");
        const res = await fetch(`${API_BASE}/api/finance`, { headers: { ...authHeader() } });
        if (res.status === 401) { setFetchError("Unauthorized. Please log in again."); handleUnauthorized(); return; }
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        const mapped = data.map((rec) => ({
          id: rec._id,
          amount: rec.amount,
          category: rec.category,
          type: rec.type,
          date: new Date(rec.date).toISOString().split("T")[0],
          description: rec.title || rec.notes || rec.category,
          paymentMethod: rec.paymentMethod || "other",
        }));
        setTransactions(mapped);
      } catch (e) {
        console.error(e);
        setFetchError(e.message || "Could not load transactions from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Category -> frequent type (history)
  const categoryTypeHistory = useMemo(() => {
    const tally = {};
    transactions.forEach((t) => {
      const k = normalizeCat(t.category);
      if (!tally[k]) tally[k] = { income: 0, expense: 0 };
      tally[k][t.type] = (tally[k][t.type] || 0) + 1;
    });
    const res = {};
    Object.keys(tally).forEach((k) => { res[k] = tally[k].income >= tally[k].expense ? "income" : "expense"; });
    return res;
  }, [transactions]);

  // Smart auto-fill
  useEffect(() => {
    if (!settings.enableAutoSuggest) return;
    const cat = formData.category?.trim();
    if (!cat) { setDescSuggestion(""); return; }
    const inferredType = inferTypeFromCategory(cat, categoryTypeHistory) || formData.type;
    if (formData.type !== inferredType) setFormData((p) => ({ ...p, type: inferredType }));
    const sug = suggestDescription(cat, inferredType, formData.date, formData.amount);
    setDescSuggestion(sug);
    if (!descEdited && !formData.description) setFormData((p) => ({ ...p, description: sug }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category, formData.date, formData.amount, categoryTypeHistory, settings.enableAutoSuggest]);

  // Derived
  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
    const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const last = monthlyData[monthlyData.length - 1] || { income: 0, expenses: 0 };
  const prev = monthlyData[monthlyData.length - 2] || last;
  const incomeDelta = prev.income ? ((last.income - prev.income) / prev.income) * 100 : 0;
  const expenseDelta = prev.expenses ? ((last.expenses - prev.expenses) / prev.expenses) * 100 : 0;
  const turnoverNow = Math.max((last.income || 0) - (last.expenses || 0), 0);
  const turnoverPrev = Math.max((prev.income || 0) - (prev.expenses || 0), 0);
  const turnoverDelta = turnoverPrev ? ((turnoverNow - turnoverPrev) / turnoverPrev) * 100 : 0;

  const expenseByCategory = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + (t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);
  const totalExpensesAll = expenseByCategory.reduce((s, [, v]) => s + v, 0);
  const barLabelsWithPct = expenseByCategory.map(([c, v]) => `${c} (${totalExpensesAll ? Math.round((v / totalExpensesAll) * 100) : 0}%)`);

  const lastTx = useMemo(() => [...transactions].sort((a, b) => parseLocalMidday(b.date) - parseLocalMidday(a.date)).slice(0, 12), [transactions]);

  // Weekly spend and WoW delta
  const { weekSpend, weekDelta } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startThisWeek = new Date(today); startThisWeek.setDate(today.getDate() - 6);
    const endThisWeek = today;
    const startPrevWeek = new Date(startThisWeek); startPrevWeek.setDate(startThisWeek.getDate() - 7);
    const endPrevWeek = new Date(startThisWeek); endPrevWeek.setDate(startThisWeek.getDate() - 1);
    const sumInRange = (start, end) => transactions
      .filter((t) => t.type === "expense")
      .filter((t) => { const d = parseLocalMidday(t.date); d.setHours(0, 0, 0, 0); return d >= start && d <= end; })
      .reduce((s, t) => s + (t.amount || 0), 0);
    const curr = sumInRange(startThisWeek, endThisWeek);
    const prevW = sumInRange(startPrevWeek, endPrevWeek);
    const delta = prevW ? ((curr - prevW) / prevW) * 100 : 0;
    return { weekSpend: curr, weekDelta: delta };
  }, [transactions]);

  const lastSalaryTx = useMemo(
    () => [...transactions]
      .filter((t) => t.type === "income" && /salary/i.test(normalizeCat(t.category)))
      .sort((a, b) => parseLocalMidday(b.date) - parseLocalMidday(a.date))[0],
    [transactions]
  );

  const budgetThisMonth = useMemo(() => {
    const now = new Date();
    const inMonth = (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const totalSalary = transactions
      .filter((t) => t.type === "income" && /salary/i.test(normalizeCat(t.category)) && inMonth(parseLocalMidday(t.date)))
      .reduce((s, t) => s + (t.amount || 0), 0);
    if (!totalSalary) return null;

    const allocations = salaryPlan.map((p) => ({ ...p, amount: Math.round(totalSalary * p.pct) }));
    const spentByBucket = {}; salaryPlan.forEach((p) => (spentByBucket[p.id] = 0));
    transactions
      .filter((t) => t.type === "expense" && inMonth(parseLocalMidday(t.date)))
      .forEach((t) => { const b = bucketForCategory(t.category); if (spentByBucket[b] == null) spentByBucket[b] = 0; spentByBucket[b] += t.amount || 0; });
    const rows = allocations.map((p) => {
      const spent = Math.round(spentByBucket[p.id] || 0);
      const remaining = Math.round(p.amount - spent);
      const pctUsed = p.amount ? Math.min(100, Math.round((spent / p.amount) * 100)) : 0;
      return { ...p, spent, remaining, pctUsed };
    });
    return { totalSalary, rows };
  }, [transactions, salaryPlan]);

  // Charts config
  const sparkOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } };
  const sparkBarData = { labels: monthlyData.map((d) => d.month), datasets: [{ data: monthlyData.map((d) => Math.round((d.expenses || 0) / 7)), backgroundColor: "rgba(34,197,94,0.25)", borderRadius: 6, barThickness: 8 }] };
  const sparkLineData = { labels: monthlyData.map((d) => d.month), datasets: [{ data: monthlyData.map((d) => d.expenses || 0), borderColor: "#34D399", backgroundColor: "rgba(52,211,153,0.18)", pointRadius: 0, tension: 0.35, fill: true }] };
  const incomeSparkData = { labels: monthlyData.map((d) => d.month), datasets: [{ data: monthlyData.map((d) => d.income || 0), borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.12)", pointRadius: 0, tension: 0.35, fill: true }] };

  const mainLineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { color: "#000", usePointStyle: true, padding: 16 } },
      tooltip: { backgroundColor: "#fff", titleColor: "#000", bodyColor: "#000", borderColor: "#34D399", borderWidth: 1 } },
    scales: { x: { ticks: { color: "#000" }, grid: { color: "#ecfdf5" } }, y: { ticks: { color: "#000" }, grid: { color: "#ecfdf5" } } },
  };
  const mainLineData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      { label: "Income", data: monthlyData.map((d) => d.income || 0), borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.12)", tension: 0.4, fill: true, pointRadius: 3 },
      { label: "Expenses", data: monthlyData.map((d) => d.expenses || 0), borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", tension: 0.4, fill: true, pointRadius: 3 },
    ],
  };
  const barData = useMemo(() => {
    const colors = expenseByCategory.map(([c], i) => getCategoryColor(c, i));
    const values = expenseByCategory.map(([, v]) => v);
    return { labels: barLabelsWithPct, datasets: [{ label: "Expenses by Category", data: values, backgroundColor: colors, borderColor: colors, borderWidth: 1, borderRadius: 8 }] };
  }, [expenseByCategory, barLabelsWithPct]);
  const doughnutData = useMemo(() => {
    const colors = expenseByCategory.map(([c], i) => getCategoryColor(c, i));
    const values = expenseByCategory.map(([, v]) => v);
    const labels = expenseByCategory.map(([c, v]) => `${c} (${totalExpensesAll ? Math.round((v / totalExpensesAll) * 100) : 0}%)`);
    return { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: "#ffffff", borderWidth: 2 }] };
  }, [expenseByCategory, totalExpensesAll]);
  const stackedData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), label: d.toLocaleString(undefined, { month: "short" }) });
    }
    const totalsByCat = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const k = normalizeCat(t.category);
      totalsByCat[k] = (totalsByCat[k] || 0) + (t.amount || 0);
    });
    const topCats = Object.entries(totalsByCat).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
    const datasets = topCats.map((cat, idx) => {
      const color = CATEGORY_COLORS[cat] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
      const data = months.map((m) => transactions
        .filter((t) => t.type === "expense")
        .filter((t) => monthKey(parseLocalMidday(t.date)) === m.key)
        .filter((t) => normalizeCat(t.category) === cat)
        .reduce((s, t) => s + (t.amount || 0), 0));
      return { label: cap(cat), data, backgroundColor: color, stack: "expenses" };
    });
    return { labels: months.map((m) => m.label), datasets };
  }, [transactions]);
  const methodSplit = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const m = (t.paymentMethod || "other").toLowerCase();
      map[m] = (map[m] || 0) + (t.amount || 0);
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([m]) => cap(m));
    const values = entries.map(([, v]) => v);
    const colors = labels.map((_, i) => FALLBACK_COLORS[i % FALLBACK_COLORS.length]);
    return { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }] };
  }, [transactions]);

  // Add transaction (Authorized)
  const addTransaction = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) return setErrorMsg("Amount must be greater than 0");
    if (!formData.category?.trim()) return setErrorMsg("Category is required");
    if (!formData.date) return setErrorMsg("Date is required");
    const selected = new Date(`${formData.date}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selected > today) return setErrorMsg("Date cannot be in the future");

    try {
      setErrorMsg("");
      const payload = {
        title: formData.description || `${formData.type} transaction`,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        notes: "",
      };
      const res = await fetch(`${API_BASE}/api/finance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to add: ${res.status}`);
      }
      const saved = await res.json();
      const newTx = {
        id: saved._id,
        amount: saved.amount,
        category: saved.category,
        type: saved.type,
        date: new Date(saved.date).toISOString().split("T")[0],
        description: saved.title || saved.notes || saved.category,
        paymentMethod: saved.paymentMethod || "other",
      };
      setTransactions((prev) => [newTx, ...prev]);
      setFormData({ amount: "", category: "", type: "expense", paymentMethod: settings.defaultPaymentMethod || "card", description: "", date: todayStr() });
      setDescEdited(false); setDescSuggestion(""); setShowAddModal(false);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Failed to add transaction.");
    }
  };

  // Add salary (Authorized)
  const addSalary = async () => {
    if (!salaryData.amount || Number(salaryData.amount) <= 0) return setErrorMsg("Salary must be greater than 0");
    if (!salaryData.date) return setErrorMsg("Date is required");
    const selected = new Date(`${salaryData.date}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selected > today) return setErrorMsg("Date cannot be in the future");

    try {
      setErrorMsg("");
      const payload = {
        title: salaryData.description || `Salary - ${monthYear(salaryData.date)} (${currency(Number(salaryData.amount))})`,
        amount: parseFloat(salaryData.amount),
        category: "Salary",
        type: "income",
        paymentMethod: "bank",
        date: salaryData.date,
        notes: "",
      };
      const res = await fetch(`${API_BASE}/api/finance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to add: ${res.status}`);
      }
      const saved = await res.json();
      const newTx = {
        id: saved._id,
        amount: saved.amount,
        category: saved.category,
        type: saved.type,
        date: new Date(saved.date).toISOString().split("T")[0],
        description: saved.title || saved.notes || saved.category,
        paymentMethod: saved.paymentMethod || "bank",
      };
      setTransactions((prev) => [newTx, ...prev]);
      setSalaryData({ amount: "", date: todayStr(), description: "" });
      setShowSalaryModal(false);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Failed to add salary.");
    }
  };

  // Documents
  const documents = useMemo(() => buildAvailableMonthlyData(transactions), [transactions]);
  const exportStatementCSV = (doc) => {
    const monthTx = transactions.filter((t) => {
      const td = parseLocalMidday(t.date);
      return td.getMonth() === doc.monthIndex && td.getFullYear() === doc.year;
    });
    const header = ["Date", "Type", "Category", "Method", "Amount", "Description"].join(",");
    const rows = monthTx.map((t) => [t.date, t.type, `"${t.category}"`, t.paymentMethod || "other", t.amount, `"${(t.description || "").replaceAll('"', '""')}"`].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement_${doc.year}-${String(doc.monthIndex + 1).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upcomingNotes = useMemo(() => notes.filter((n) => parseLocalMidday(n.date) >= parseLocalMidday(todayStr())), [notes]);
  const notesImpact = useMemo(() => {
    const add = upcomingNotes.reduce((s, n) => s + (n.type === "income" ? Number(n.amount) || 0 : 0), 0);
    const sub = upcomingNotes.reduce((s, n) => s + (n.type === "expense" ? Number(n.amount) || 0 : 0), 0);
    const projected = totals.balance + add - sub;
    return { add, sub, projected };
  }, [upcomingNotes, totals.balance]);

  // Sidebar menu
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "charts", icon: PieChart, label: "Charts" },
    { id: "transactions", icon: CreditCard, label: "Transactions" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "notes", icon: Notebook, label: "Notes" },
    { id: "story", icon: TrendingUp, label: "Story Recap" },
    { id: "future", icon: Calendar, label: "Future You" },
    { id: "insights", icon: BarChart3, label: "Insights" },
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "help", icon: HelpCircle, label: "Help" },
  ];
  const cardClass = "rounded-2xl bg-white border border-green-500/50 shadow-md shadow-green-500/30";

  // Sections
  const OverviewSection = () => (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI
          title="Income"
          value={currency(totals.income)}
          delta={incomeDelta}
          note={`Compared to ${currency(prev.income)} last month`}
          positive
        />
        <KPI
          title="Expense"
          value={currency(totals.expenses)}
          delta={expenseDelta}
          note={`Compared to ${currency(prev.expenses)} last month`}
          positive={false}
        />
        {/* Replaced Cashback with Income trend */}
        <div className="rounded-2xl bg-white border border-green-500/50 shadow-md shadow-green-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Income trend</div>
            <MoreHorizontal className="h-4 w-4 text-green-400" />
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-2xl font-bold text-black">{currency(last.income || 0)}</div>
            <div
              className={cn(
                "text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1 border border-green-500/40",
                (incomeDelta || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {(incomeDelta || 0) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(Math.round((incomeDelta || 0) * 10) / 10)}%
            </div>
          </div>
          <div className="h-16 mt-3">
            <Line data={incomeSparkData} options={sparkOptions} />
          </div>
          <div className="mt-1 text-xs text-green-200">Vs previous month</div>
        </div>

        <div className="rounded-2xl bg-white border border-green-500/50 shadow-md shadow-green-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Monthly turnover</div>
            <InfoTooltip text={"Income minus expenses for the latest month.\nPositive is surplus; negative would be deficit."} />
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-2xl font-bold text-black">{currency(turnoverNow)}</div>
            <div
              className={cn(
                "text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1 border border-green-500/40",
                turnoverDelta >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {turnoverDelta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(Math.round(turnoverDelta * 10) / 10)}%
            </div>
          </div>
          <div className="mt-1 text-xs text-green-200">Compared to {currency(turnoverPrev)} last month</div>
        </div>
      </div>

      {/* Quick tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(cardClass, "p-4")}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Spend (last 7 days)</div>
            <MoreHorizontal className="h-4 w-4 text-green-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-black">{currency(Math.round(weekSpend))}</div>
          <div className="h-16 mt-3"><Bar data={sparkBarData} options={sparkOptions} /></div>
          <div className={cn("mt-2 text-xs font-medium flex items-center gap-1", weekDelta >= 0 ? "text-red-600" : "text-green-600")}>
            {weekDelta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(Math.round(weekDelta * 10) / 10)}% vs prev week
          </div>
        </div>

        <div className={cn(cardClass, "p-4")}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Spending trend</div>
            <MoreHorizontal className="h-4 w-4 text-green-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-black">{Math.round(((last.expenses || 0) / (last.income || 1)) * 100)}%</div>
          <div className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> {Math.abs(Math.round(((expenseDelta || 0) * 10)) / 10)}%
          </div>
          <div className="h-16 mt-3"><Line data={sparkLineData} options={sparkOptions} /></div>
        </div>

        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black">Payment Methods</div>
          <div className="h-16 mt-3">
            <Doughnut
              data={useMemo(() => {
                const map = {};
                transactions.filter(t => t.type === "expense").forEach(t => {
                  const m = (t.paymentMethod || "other").toLowerCase();
                  map[m] = (map[m] || 0) + (t.amount || 0);
                });
                const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
                const labels = entries.map(([m]) => cap(m));
                const values = entries.map(([, v]) => v);
                const colors = labels.map((_, i) => FALLBACK_COLORS[i % FALLBACK_COLORS.length]);
                return { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }] };
              }, [transactions])}
              options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className={cn(cardClass, "p-4")}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-black">Income vs Expenses</div>
          <div className="text-xs text-green-200">Last 6 months</div>
        </div>
        <div className="h-64 mt-2"><Line data={mainLineData} options={mainLineOptions} /></div>
      </div>

      {/* Budget Envelopes (this month) */}
      <div className={cn(cardClass, "p-4")}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-black">Budget Envelopes (This month)</div>
          <InfoTooltip text={"Based on your Salary incomes this month and the Perfect Money Plan.\nShows allocated, spent and remaining per envelope."} />
        </div>
        {budgetThisMonth ? (
          <div className="mt-3 space-y-3">
            <div className="text-xs text-black/70">Total salary this month: <span className="font-semibold">{currency(budgetThisMonth.totalSalary)}</span></div>
            {budgetThisMonth.rows.map((r) => (
              <div key={r.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-sm text-black">{r.label}</span>
                  </div>
                  <div className="text-xs text-black/70">
                    Alloc {currency(r.amount)} • Spent {currency(r.spent)} • <span className={cn(r.remaining >= 0 ? "text-green-600" : "text-red-600", "font-semibold")}>
                      {r.remaining >= 0 ? "Left " : "Over "} {currency(Math.abs(r.remaining))}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-green-100 rounded">
                  <div className="h-2 rounded" style={{ width: `${r.pctUsed}%`, backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm text-black/70">Add a Salary income to generate this month’s envelopes.</div>
        )}
      </div>

      {/* Recent Transactions - full width */}
      <div className={cn(cardClass, "p-4")}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-black">Recent Transactions</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAddModal(true); setErrorMsg(""); setDescEdited(false); }}
              className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-xs text-green-600 hover:text-green-500 hover:bg-green-50 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
            <button
              onClick={() => { setShowSalaryModal(true); setErrorMsg(""); }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#34D399] hover:bg-[#10B981] text-white px-3 py-1.5 text-xs shadow-md shadow-green-500/30 border border-green-500/50"
            >
              <Plus className="h-3.5 w-3.5" /> Add Salary
            </button>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {["Date", "Type", "Category", "Method", "Description", "Amount"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold text-black border-b border-green-500/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lastTx.map((t, idx) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 border-b border-green-500/20 text-black/80">{t.date}</td>
                  <td className="px-3 py-2 border-b border-green-500/20">
                    <span className={cn("px-2 py-1 rounded-md border text-xs", "border-green-500/30", t.type === "income" ? "text-green-600" : "text-red-600")}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-green-500/20 text-black">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryColor(t.category, idx) }} />
                      {t.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-green-500/20 text-black/70">{t.paymentMethod || "other"}</td>
                  <td className="px-3 py-2 border-b border-green-500/20 text-black/80 truncate max-w-[420px]">{t.description}</td>
                  <td className={cn("px-3 py-2 border-b border-green-500/20 font-semibold text-right", t.type === "income" ? "text-green-600" : "text-red-600")}>
                    {t.type === "income" ? "+" : "-"}{currency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const ChartsSection = () => {
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
    const recentExpenses = [...transactions].filter((t) => t.type === "expense").sort((a, b) => parseLocalMidday(b.date) - parseLocalMidday(a.date)).slice(0, 10);
    const recentIncomes = [...transactions].filter((t) => t.type === "income").sort((a, b) => parseLocalMidday(b.date) - parseLocalMidday(a.date)).slice(0, 10);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Color-coded bar with % in labels */}
          <div className={cn(cardClass, "p-4")}>
            <div className="text-sm font-semibold text-black mb-2">Expenses by Category</div>
            <div className="h-72">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#fff", titleColor: "#000", bodyColor: "#000", borderColor: "#34D399", borderWidth: 1,
                      callbacks: {
                        label: (ctx) => {
                          const total = totalExpensesAll || 1;
                          const v = ctx.raw || 0;
                          const p = Math.round((v / total) * 100);
                          return `${currency(v)} (${p}%)`;
                        },
                      },
                    },
                  },
                  scales: { x: { grid: { color: "#ecfdf5" }, ticks: { color: "#000" } }, y: { grid: { color: "#ecfdf5" }, ticks: { color: "#000" } } },
                }}
              />
            </div>
          </div>

          {/* Color-coded doughnut with % */}
          <div className={cn(cardClass, "p-4")}>
            <div className="text-sm font-semibold text-black mb-2">Expense Distribution</div>
            <div className="h-72">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { color: "#000", usePointStyle: true } },
                    tooltip: {
                      backgroundColor: "#fff", titleColor: "#000", bodyColor: "#000", borderColor: "#34D399", borderWidth: 1,
                      callbacks: { label: (ctx) => `${ctx.label}: ${currency(ctx.parsed)}` },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Monthly stacked expenses by category */}
        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black mb-2">Monthly Expenses by Category (Stacked)</div>
          <div className="h-80">
            <Bar
              data={stakedOrStacked(stackedData)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { color: "#000", usePointStyle: true } } },
                scales: {
                  x: { stacked: true, ticks: { color: "#000" }, grid: { color: "#ecfdf5" } },
                  y: { stacked: true, ticks: { color: "#000" }, grid: { color: "#ecfdf5" } },
                },
              }}
            />
          </div>
        </div>

        {/* Payment method split */}
        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black mb-2">Payment Method Split (Expenses)</div>
          <div className="h-72">
            <Doughnut
              data={methodSplit}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { color: "#000", usePointStyle: true } } },
              }}
            />
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={cn(cardClass, "p-4")}>
            <div className="text-sm font-semibold text-black mb-2">Recent Expenses</div>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {recentExpenses.map((t, i) => {
                const totalExpenses = transactions.filter(x => x.type === "expense").reduce((s, x) => s + (x.amount || 0), 0);
                const pct = totalExpenses ? Math.round(((t.amount || 0) / totalExpenses) * 100) : 0;
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(t.category, i) }} />
                      <span className="text-black">{t.description || t.category}</span>
                      <span className="text-xs text-black/50">• {t.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-black/60">{pct}%</span>
                      <span className="font-semibold text-red-600">-{currency(t.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cn(cardClass, "p-4")}>
            <div className="text-sm font-semibold text-black mb-2">Recent Incomes</div>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {recentIncomes.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(t.category, i) }} />
                    <span className="text-black">{t.description || t.category}</span>
                    <span className="text-xs text-black/50">• {t.date}</span>
                  </div>
                  <span className="font-semibold text-green-600">+{currency(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TransactionsSection = () => (
    <div className={cn(cardClass, "overflow-hidden")}>
      <div className="p-4 border-b border-green-500/50">
        <div className="text-sm font-semibold text-black">All Transactions</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white">
            <tr className="text-left">
              {["Date", "Category", "Description", "Type", "Method", "Amount"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-black border-b border-green-500/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={t.id} className="hover:bg-green-50 transition">
                <td className="px-4 py-3 border-b border-green-500/20 text-black">{t.date}</td>
                <td className="px-4 py-3 border-b border-green-500/20 text-black">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryColor(t.category, i) }} />
                    {t.category}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-green-500/20 text-black/80">{t.description}</td>
                <td className="px-4 py-3 border-b border-green-500/20">
                  <span className={cn("px-2 py-1 rounded-md border text-xs", "border-green-500/30", t.type === "income" ? "text-green-600" : "text-red-600")}>
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-green-500/20 text-black/80">{t.paymentMethod || "other"}</td>
                <td className={cn("px-4 py-3 border-b border-green-500/20 font-semibold", t.type === "income" ? "text-green-600" : "text-red-600")}>
                  {t.type === "income" ? "+" : "-"}{currency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DocumentsSection = () => {
    const docs = documents;
    return (
      <div className="space-y-4">
        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black mb-2">Monthly Statements</div>
          {docs.length === 0 ? (
            <div className="text-sm text-black/70">No statements yet. Add transactions to generate monthly summaries.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    {["Month", "Income", "Expenses", "Net", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold text-black border-b border-green-500/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => {
                    const net = d.income - d.expenses;
                    return (
                      <tr key={d.key}>
                        <td className="px-3 py-2 border-b border-green-500/20 text-black">{d.longMonth} {d.year}</td>
                        <td className="px-3 py-2 border-b border-green-500/20 text-green-700">{currency(d.income)}</td>
                        <td className="px-3 py-2 border-b border-green-500/20 text-red-600">-{currency(d.expenses)}</td>
                        <td className={cn("px-3 py-2 border-b border-green-500/20 font-semibold", net >= 0 ? "text-green-700" : "text-red-600")}>
                          {net >= 0 ? "+" : "-"}{currency(Math.abs(net))}
                        </td>
                        <td className="px-3 py-2 border-b border-green-500/20">
                          <button
                            onClick={() => exportStatementCSV(d)}
                            className="text-xs rounded-md border border-green-500/30 px-2 py-1 text-green-600 hover:text-green-500"
                          >
                            Download CSV
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const NotesSection = () => {
    const [noteForm, setNoteForm] = useState({ title: "", type: "expense", amount: "", date: todayStr() });

    const addNote = () => {
      if (!noteForm.title.trim()) return setErrorMsg("Note title is required");
      if (!noteForm.amount || Number(noteForm.amount) <= 0) return setErrorMsg("Amount must be greater than 0");
      if (!noteForm.date) return setErrorMsg("Date is required");
      const n = { id: uid(), title: noteForm.title.trim(), type: noteForm.type, amount: Number(noteForm.amount), date: noteForm.date };
      setNotes((prev) => [n, ...prev]);
      setNoteForm({ title: "", type: "expense", amount: "", date: todayStr() });
      setErrorMsg("");
    };

    const removeNote = (id) => setNotes((prev) => prev.filter((n) => n.id !== id));

    const future = upcomingNotes;
    const past = notes.filter((n) => parseLocalMidday(n.date) < parseLocalMidday(todayStr()));
    const projectedClass = notesImpact.projected >= 0 ? "text-green-700" : "text-red-600";

    return (
      <div className="space-y-4">
        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black mb-2">Add Note (upcoming expense/income)</div>
          {errorMsg && <div className="text-sm text-red-600 mb-2">{errorMsg}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              placeholder="Title (e.g., Car insurance, Bonus)"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              className="sm:col-span-2 rounded-lg border border-green-500/50 bg-white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
            />
            <select
              value={noteForm.type}
              onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value })}
              className="rounded-lg border border-green-500/50 bg-white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={noteForm.amount}
              onChange={(e) => setNoteForm({ ...noteForm, amount: e.target.value })}
              className="rounded-lg border border-green-500/50 bg-white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
            />
            <input
              type="date"
              value={noteForm.date}
              onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
              className="rounded-lg border border-green-500/50 bg-white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={addNote}
              className="inline-flex items-center gap-2 rounded-lg bg-[#34D399] hover:bg-[#10B981] text-white px-3 py-2 text-sm shadow-md shadow-green-500/30 border border-green-500/50"
            >
              <Plus className="h-4 w-4" /> Add Note
            </button>
            <div className="text-xs text-black/80">
              Now balance: <span className="font-semibold">{currency(totals.balance)}</span> • Upcoming +{currency(notesImpact.add)} / -{currency(notesImpact.sub)} •
              Projected: <span className={cn("font-semibold", projectedClass)}>{currency(notesImpact.projected)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={cn(cardClass, "p-4")}>
            <div className="text-sm font-semibold text-black mb-2">Upcoming</div>
            {future.length === 0 ? (
              <div className="text-sm text-black/70">No upcoming notes.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {future
                  .sort((a, b) => parseLocalMidday(a.date) - parseLocalMidday(b.date))
                  .map((n) => (
                    <div key={n.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-md text-xs border", n.type === "income" ? "text-green-600 border-green-300" : "text-red-600 border-red-300")}>
                          {n.type}
                        </span>
                        <span className="text-black">{n.title}</span>
                        <span className="text-xs text-black/50">• {n.date}</span>
                      </div>
                      <div className={cn("font-semibold", n.type === "income" ? "text-green-700" : "text-red-600")}>
                        {n.type === "income" ? "+" : "-"}{currency(n.amount)}
                      </div>
                      <button onClick={() => removeNote(n.id)} className="text-xs ml-2 text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className={cn(cardClass, "p-4")}>
            <div className="text-sm font-semibold text-black mb-2">Past</div>
            {past.length === 0 ? (
              <div className="text-sm text-black/70">No past notes.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {past
                  .sort((a, b) => parseLocalMidday(b.date) - parseLocalMidday(a.date))
                  .map((n) => (
                    <div key={n.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-md text-xs border", n.type === "income" ? "text-green-600 border-green-300" : "text-red-600 border-red-300")}>
                          {n.type}
                        </span>
                        <span className="text-black">{n.title}</span>
                        <span className="text-xs text-black/50">• {n.date}</span>
                      </div>
                      <div className={cn("font-semibold", n.type === "income" ? "text-green-700" : "text-red-600")}>
                        {n.type === "income" ? "+" : "-"}{currency(n.amount)}
                      </div>
                      <button onClick={() => removeNote(n.id)} className="text-xs ml-2 text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const StorySection = () => {
    const storyMonthly = useMemo(() => buildAvailableMonthlyData(transactions), [transactions]);
    const stories = storyMonthly.map((d, idx) => {
      const monthTx = transactions.filter((t) => {
        const td = parseLocalMidday(t.date);
        return td.getMonth() === d.monthIndex && td.getFullYear() === d.year;
      });
      const catMap = {};
      monthTx.filter((t) => t.type === "expense").forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + (t.amount || 0); });
      const cats = Object.keys(catMap);
      const topCat = cats.length ? cats.reduce((a, b) => (catMap[a] > catMap[b] ? a : b)) : "General";

      const net = (d.income || 0) - (d.expenses || 0);
      const direction = net >= 0 ? "surplus" : "deficit";
      const prevD = storyMonthly[idx - 1] || d;
      const change = prevD?.expenses ? Math.round((((d.expenses || 0) - (prevD.expenses || 0)) / (prevD.expenses || 1)) * 100) : 0;
      const mood = net >= 0 ? "🟢" : "🟠";

      return {
        month: d.month, income: d.income || 0, expenses: d.expenses || 0, net, topCat, change, mood,
        text:
          `In ${d.month}, you earned ${currency(d.income)} and spent ${currency(d.expenses)}, ` +
          `leaving a ${direction} of ${currency(Math.abs(net))}. ` +
          `Your biggest spend was on ${topCat}. ` +
          `${change === 0 ? "Spending held steady." : change > 0 ? "Spending rose" : "Spending fell"} ` +
          `${change !== 0 ? `${Math.abs(change)}% vs previous data month.` : ""}`,
      };
    });

    return (
      <div className="space-y-4">
        {stories.map((s, i) => (
          <div key={i} className={cn(cardClass, "p-5 flex items-start gap-4")}>
            <div className="text-3xl">{s.mood}</div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-black">{s.month} Recap</div>
              <p className="mt-1 text-black/80">{s.text}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <span className="px-2 py-1 rounded-md border border-green-500/30 text-black">Income: {currency(s.income)}</span>
                <span className="px-2 py-1 rounded-md border border-green-500/30 text-black">Expenses: {currency(s.expenses)}</span>
                <span className={cn("px-2 py-1 rounded-md border border-green-500/30", s.net >= 0 ? "text-green-600" : "text-red-600")}>
                  Net: {s.net >= 0 ? "+" : "-"}{currency(Math.abs(s.net))}
                </span>
                <span className="px-2 py-1 rounded-md border border-green-500/30 text-green-400">Top: {s.topCat}</span>
              </div>
            </div>
          </div>
        ))}
        {stories.length === 0 && (
          <div className={cn(cardClass, "p-6 text-sm text-black/70")}>No monthly data yet. Add transactions to see your recap.</div>
        )}
      </div>
    );
  };

  const FutureSection = () => {
    // 3-month projection
    const monthsWithData = monthlyData.filter(m => (m.income || m.expenses));
    const baseCount = Math.max(1, monthsWithData.length || monthlyData.length || 1);
    const avgIncome = monthsWithData.reduce((s, d) => s + (d.income || 0), 0) / baseCount;
    const avgExpense = monthsWithData.reduce((s, d) => s + (d.expenses || 0), 0) / baseCount;

    const next3Income = Math.round(avgIncome * 3);
    const next3Expense = Math.round(avgExpense * 3);
    const next3Net = next3Income - next3Expense;

    // Scenario: trim top category by 15%
    const topCatEntry = expenseByCategory[0] || ["General", 0];
    const topSave = Math.round((topCatEntry[1] / baseCount) * 0.15 * 3); // per month * 3 months
    const cutExpense = Math.max(0, next3Expense - topSave);
    const cutNet = next3Income - cutExpense;

    // Scenario: modest income growth 5% MoM
    const growIncome = Math.round(avgIncome * (1 + 0.05) + avgIncome * (1 + 0.05) ** 2 + avgIncome * (1 + 0.05) ** 3);
    const growNet = growIncome - next3Expense;

    return (
      <div className="space-y-4">
        <div className={cn(cardClass, "p-5 flex items-start gap-4")}>
          <div className="text-3xl">📖</div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-black">If you keep the current pace…</div>
            <p className="mt-1 text-black/80">
              Over the next 3 months, you might earn {currency(next3Income)} and spend {currency(next3Expense)}.
              That leaves a net of <span className={cn("font-semibold", next3Net >= 0 ? "text-green-600" : "text-red-600")}>{currency(next3Net)}</span>.
            </p>
          </div>
        </div>

        <div className={cn(cardClass, "p-5 flex items-start gap-4")}>
          <div className="text-3xl">✂️</div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-black">Trim {topCatEntry[0]} by 15%</div>
            <p className="mt-1 text-black/80">
              Saving about {currency(topSave)} over 3 months drops expenses to {currency(cutExpense)} and improves net to{" "}
              <span className={cn("font-semibold", cutNet >= 0 ? "text-green-600" : "text-red-600")}>{currency(cutNet)}</span>.
            </p>
          </div>
        </div>

        <div className={cn(cardClass, "p-5 flex items-start gap-4")}>
          <div className="text-3xl">📈</div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-black">If income grows 5% MoM</div>
            <p className="mt-1 text-black/80">
              Earnings could reach <span className="font-semibold">{currency(growIncome)}</span> in 3 months.
              Net would be <span className={cn("font-semibold", growNet >= 0 ? "text-green-600" : "text-red-600")}>{currency(growNet)}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const InsightsSection = () => {
    const totalInc = totals.income;
    const totalExp = totals.expenses;
    const months = monthlyData.filter(m => (m.income || m.expenses)).length || 1;
    const avgInc = Math.round(totalInc / months);
    const avgExp = Math.round(totalExp / months);
    const savingsRate = avgInc ? Math.round(((avgInc - avgExp) / avgInc) * 100) : 0;
    const topCat = expenseByCategory[0]?.[0] || "General";
    const topCatPct = totalExp ? Math.round((expenseByCategory[0]?.[1] / totalExp) * 100) : 0;

    const surplusMonths = monthlyData.filter(m => (m.income || 0) - (m.expenses || 0) >= 0).length;
    const deficitMonths = monthlyData.length - surplusMonths;

    return (
      <div className="space-y-4">
        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black mb-2">Quick Insights</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-green-500/30 p-3">
              <div className="text-black/60 text-xs">Average Income</div>
              <div className="font-semibold text-black">{currency(avgInc)}</div>
            </div>
            <div className="rounded-lg border border-green-500/30 p-3">
              <div className="text-black/60 text-xs">Average Expense</div>
              <div className="font-semibold text-black">{currency(avgExp)}</div>
            </div>
            <div className="rounded-lg border border-green-500/30 p-3">
              <div className="text-black/60 text-xs">Savings Rate</div>
              <div className={cn("font-semibold", savingsRate >= 0 ? "text-green-700" : "text-red-600")}>{savingsRate}%</div>
            </div>
            <div className="rounded-lg border border-green-500/30 p-3">
              <div className="text-black/60 text-xs">Top Category</div>
              <div className="font-semibold text-black">{topCat} ({topCatPct}%)</div>
            </div>
          </div>
        </div>

        <div className={cn(cardClass, "p-4")}>
          <div className="text-sm font-semibold text-black mb-2">What we notice</div>
          <ul className="list-disc pl-5 text-sm text-black/80 space-y-1">
            <li>You had {surplusMonths} surplus month(s) and {deficitMonths} deficit month(s) in the last six.</li>
            <li>Trimming {topCat} by 10–20% could improve your monthly savings.</li>
            <li>Consider automating transfers to Savings on salary day.</li>
            <li>Track payment methods: optimize rewards on Card/UPI where possible.</li>
          </ul>
        </div>
      </div>
    );
  };

  const HelpSection = () => (
    <div className="space-y-4">
      <div className={cn(cardClass, "p-4")}>
        <div className="text-sm font-semibold text-black mb-2">Tips & How‑to</div>
        <ul className="list-disc pl-5 text-sm text-black/80 space-y-1">
          <li>Add Salary from the sidebar “Add Salary” button to build monthly envelopes.</li>
          <li>Use meaningful categories (Food, Rent, Transport…) for clearer insights.</li>
          <li>Payment Method helps analyze spend channels (Card vs Cash vs UPI).</li>
          <li>Notes let you add upcoming expenses/incomes; we project if you’ll stay positive.</li>
          <li>Documents has monthly statements; download CSV for accounting.</li>
          <li>All data is per user account; log out if you share the device.</li>
        </ul>
      </div>
    </div>
  );

  // Layout return
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 h-screen sticky top-0 bg-white border-r border-green-500/50">
          <div className="p-4 w-full flex flex-col">
            <div className="px-2 py-3 flex items-center gap-2">
  {/* Logo image */}
  <img 
    src="https://marketplace.canva.com/EAGQZhT83lg/1/0/1600w/canva-dark-green-modern-illustrative-finance-service-logo-GTKa2Yxea4Y.jpg" 
    alt="FinanceTracker Logo" 
    className="h-8 w-8 rounded-full object-cover" 
  />
  <span className="font-semibold text-lg text-darkGreen dark:text-green-400">
    FinanceTracker
  </span>
</div>

            <nav className="mt-6 space-y-6">
              <div>
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-green-200">Main Menu</p>
                <ul className="mt-2">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveNav(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-150",
                          activeNav === item.id
                            ? "bg-green-50 text-black border-green-500/50 shadow shadow-green-500/30"
                            : "text-black border-green-500/30 hover:bg-green-50 hover:border-green-500/50 hover:translate-x-[2px]"
                        )}
                      >
                        <item.icon className="h-5 w-5 text-green-400" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 px-2">
                <button
                  onClick={() => { setShowSalaryModal(true); setErrorMsg(""); }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-green-500/30 py-2 text-sm text-green-600 hover:text-green-500 hover:bg-green-50 transition bg-white shadow-sm shadow-green-500/30"
                >
                  <Plus className="h-4 w-4" /> Add Salary
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 bg-white border-b border-green-500/50">
  <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end">
    {/* Right-aligned actions */}
    <div className="flex items-center gap-2">
      <button className="p-2 rounded-lg border border-green-500/30 hover:bg-white shadow-sm shadow-green-500/20">
        <Bell className="h-5 w-5 text-green-400 hover:text-green-300" />
      </button>
      <button
        onClick={() => { setShowAddModal(true); setErrorMsg(""); setDescEdited(false); }}
        className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#34D399] hover:bg-[#10B981] text-white px-3 py-2 text-sm shadow-md shadow-green-500/30 border border-green-500/50"
      >
        <Plus className="h-4 w-4" /> Add Transaction
      </button>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfileMenu((s) => !s)}
          className="ml-2 flex items-center gap-3 rounded-lg border border-green-500/30 px-2 py-1.5 hover:bg-white shadow-sm shadow-green-500/20"
        >
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-black">{user?.name || "User"}</div>
            <div className="text-xs text-green-200">{user?.email || ""}</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-green-900/30 text-green-400 grid place-items-center text-sm font-semibold shadow shadow-green-500/20">
            {initialsFromName(user?.name)}
          </div>
        </button>

       {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-green-500/40 shadow-lg shadow-green-500/20 p-2">
                  <button
                    onClick={() => { setShowAccountModal(true); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 text-sm text-black"
                  >
                    <User2 className="h-4 w-4 text-green-400" /> View Account
                  </button>
                  <button
                    onClick={() => setActiveNav("settings")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 text-sm text-black"
                  >
                    <Settings className="h-4 w-4 text-green-400" /> Settings
                  </button>
                  <div className="h-px bg-green-100 my-1" />
                  <button
                    onClick={() => { localStorage.clear(); window.location.href = "/landing"; }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-sm text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
        )}
      </div>
    </div>
  </div>
</header>
          {/* Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {fetchError && (
              <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">{fetchError}</div>
            )}
            {loading && (
              <div className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-green-700">Loading data…</div>
            )}

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-black capitalize">
                {activeNav === "dashboard" ? "Overview" : activeNav.replace("-", " ")}
              </h1>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg border border-green-500/30 hover:bg-white shadow-sm shadow-green-500/20">
                  <ChevronLeft className="h-4 w-4 text-green-400" />
                </button>
                <button className="p-2 rounded-lg border border-green-500/30 hover:bg-white shadow-sm shadow-green-500/20">
                  <ChevronRight className="h-4 w-4 text-green-400" />
                </button>
              </div>
            </div>

            {activeNav === "dashboard" && <OverviewSection />}
            {activeNav === "charts" && <ChartsSection />}
            {activeNav === "transactions" && <TransactionsSection />}
            {activeNav === "documents" && <DocumentsSection />}
            {activeNav === "notes" && <NotesSection />}
            {activeNav === "story" && <StorySection />}
            {activeNav === "future" && <FutureSection />}
            {activeNav === "insights" && <InsightsSection />}
            {activeNav === "settings" && (
  <div className={cn(cardClass, "p-6 space-y-6")}>
    <div className="text-black font-semibold text-lg">Settings</div>

    {/* General preferences */}
    <div>
      <div className="text-sm font-semibold text-black mb-2">General Preferences</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-green-200 mb-1">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="w-full rounded-lg border border-green-500/50 px-3 py-2 text-sm text-black"
          >
            <option value="LKR">LKR - Sri Lankan Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="INR">INR - Indian Rupee</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-green-200 mb-1">Default Payment Method</label>
          <select
            value={settings.defaultPaymentMethod}
            onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value })}
            className="w-full rounded-lg border border-green-500/50 px-3 py-2 text-sm text-black"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{cap(m)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-green-200 mb-1">Week Starts On</label>
          <select
            value={settings.weekStartsOn}
            onChange={(e) => setSettings({ ...settings, weekStartsOn: e.target.value })}
            className="w-full rounded-lg border border-green-500/50 px-3 py-2 text-sm text-black"
          >
            <option value="Mon">Monday</option>
            <option value="Sun">Sunday</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <input
            id="autosuggest"
            type="checkbox"
            checked={settings.enableAutoSuggest}
            onChange={() => setSettings({ ...settings, enableAutoSuggest: !settings.enableAutoSuggest })}
            className="h-4 w-4 border-green-500/50 text-green-600"
          />
          <label htmlFor="autosuggest" className="text-sm text-black">Enable Auto Suggest</label>
        </div>
      </div>
    </div>

    {/* Salary Plan */}
    <div>
      <div className="text-sm font-semibold text-black mb-2">Salary Split Plan</div>
      <div className="space-y-2">
        {settings.salaryPlan.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={p.label}
                onChange={(e) => {
                  const plan = [...settings.salaryPlan];
                  plan[i] = { ...plan[i], label: e.target.value };
                  setSettings({ ...settings, salaryPlan: plan });
                }}
                className="w-full rounded-lg border border-green-500/30 px-2 py-1 text-sm text-black"
              />
            </div>
            <input
              type="number"
              value={Math.round(p.pct * 100)}
              min="0"
              max="100"
              onChange={(e) => {
                const pct = Number(e.target.value) / 100;
                const plan = [...settings.salaryPlan];
                plan[i] = { ...plan[i], pct };
                setSettings({ ...settings, salaryPlan: plan });
              }}
              className="w-20 rounded-lg border border-green-500/30 px-2 py-1 text-sm text-black text-right"
            />
            <span className="text-sm">%</span>
            <button
              onClick={() => {
                setSettings({ ...settings, salaryPlan: settings.salaryPlan.filter((_, idx) => idx !== i) });
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setSettings({ ...settings, salaryPlan: [...settings.salaryPlan, { id: uid(), label: "New", pct: 0.1, color: FALLBACK_COLORS[Math.floor(Math.random() * FALLBACK_COLORS.length)] }] });
        }}
        className="mt-3 inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-green-500/30 text-green-600 hover:bg-green-50"
      >
        <Plus className="h-4 w-4" /> Add Envelope
      </button>
    </div>
  </div>
)}
            {activeNav === "help" && <HelpSection />}
          </main>
        </div>
        
      </div>

       <footer className="white mt-12 border-t border-green-500/30">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-black/70">
          {/* About */}
          <div>
            <h3 className="font-semibold text-black mb-2">About</h3>
            <p>
              FinanceTracker helps you manage income, expenses, and budgets.
              Track smarter, save better, and keep future-you smiling.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-black mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><button onClick={() => setActiveNav("documents")} className="hover:text-black">Documents</button></li>
              <li><button onClick={() => setActiveNav("notes")} className="hover:text-black">Notes</button></li>
              <li><button onClick={() => setActiveNav("insights")} className="hover:text-black">Insights</button></li>
              <li><button onClick={() => setActiveNav("help")} className="hover:text-black">Help</button></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-black mb-2">Connect</h3>
            <div className="flex gap-4">
              <a href="https://twitter.com/yourprofile" target="_blank" rel="noreferrer">
                <Twitter className="text-green-600 hover:text-green-800 h-5 w-5" />
              </a>
              <a href="https://facebook.com/yourprofile" target="_blank" rel="noreferrer">
                <Facebook className="text-green-600 hover:text-green-800 h-5 w-5" />
              </a>
              <a href="https://instagram.com/yourprofile" target="_blank" rel="noreferrer">
                <Instagram className="text-green-600 hover:text-green-800 h-5 w-5" />
              </a>
              <a href="https://github.com/yourrepo" target="_blank" rel="noreferrer">
                <Github className="text-green-600 hover:text-green-800 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-200 py-4 text-center text-xs text-black/50">
          © {new Date().getFullYear()} FinanceTracker. All rights reserved.
        </div>
      </footer>
  

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white shadow-2xl shadow-green-500/30 border border-green-500/50">
            <div className="flex items-center justify-between p-5 border-b border-green-500/50">
              <div className="text-lg font-semibold text-black">Add Transaction</div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-white border border-green-500/30">
                <X className="h-5 w-5 text-green-400 hover:text-green-300" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Food, Rent, Salary"
                  className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                />
                {formData.category && (
                  <div className="mt-1 text-xs text-green-500">
                    Auto-detected type: <span className="font-medium">{formData.type}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-1">Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text:black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{cap(m)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  max={todayStr()}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text-black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => { setDescEdited(true); setFormData({ ...formData, description: e.target.value }); }}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text:black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                />
                {descSuggestion && settings.enableAutoSuggest && (
                  <div className="mt-1 text-xs text-green-500">
                    Suggested: {descSuggestion}{" "}
                    <button type="button" onClick={() => { setFormData((p) => ({ ...p, description: descSuggestion })); setDescEdited(false); }} className="underline hover:text-green-600">
                      Use suggestion
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-green-500/50 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-lg border border-green-500/50 py-2 text-sm text-green-400 hover:text-green-300 bg-white shadow-sm shadow-green-500/30">
                Cancel
              </button>
              <button onClick={addTransaction} className="flex-1 rounded-lg bg-[#34D399] hover:bg-[#10B981] text-white py-2 text-sm shadow-md shadow-green-500/30 border border-green-500/50">
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Salary Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify:center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-white shadow-2xl shadow-green-500/30 border border-green-500/50">
            <div className="flex items-center justify-between p-5 border-b border-green-500/50">
              <div className="text-lg font-semibold text-black">Add Salary</div>
              <button onClick={() => setShowSalaryModal(false)} className="p-2 rounded-lg hover:bg-white border border-green-500/30">
                <X className="h-5 w-5 text-green-400 hover:text-green-300" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-1">Amount</label>
                  <input
                    type="number"
                    value={salaryData.amount}
                    onChange={(e) => setSalaryData({ ...salaryData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text:black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-1">Date</label>
                  <input
                    type="date"
                    value={salaryData.date}
                    max={todayStr()}
                    onChange={(e) => setSalaryData({ ...salaryData, date: e.target.value })}
                    className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text:black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={salaryData.description}
                  onChange={(e) => setSalaryData({ ...salaryData, description: e.target.value })}
                  placeholder={`Salary - ${monthYear(salaryData.date)} (${currency(Number(salaryData.amount) || 0)})`}
                  className="w-full rounded-lg border border-green-500/50 bg:white px-3 py-2 text-sm text:black focus:ring-2 ring-[#34D399] outline-none shadow-sm shadow-green-500/30"
                />
              </div>

              {/* Preview allocation */}
              <div className={cn(cardClass, "p-4")}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-black">Perfect Money Plan Preview</div>
                  <div className="text-xs text-green-200">
                    {salaryData.amount ? `Total: ${currency(Number(salaryData.amount))}` : "Enter amount to preview"}
                  </div>
                </div>
                {Number(salaryData.amount) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="h-48">
                      <Doughnut
                        data={{
                          labels: salaryPlan.map((p) => `${p.label} (${Math.round(p.pct * 100)}%)`),
                          datasets: [
                            {
                              data: salaryPlan.map((p) => Math.round(Number(salaryData.amount) * p.pct)),
                              backgroundColor: salaryPlan.map((p) => p.color),
                              borderColor: "#fff",
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: "bottom", labels: { color: "#000", usePointStyle: true } },
                            tooltip: {
                              backgroundColor: "#fff",
                              titleColor: "#000",
                              bodyColor: "#000",
                              borderColor: "#34D399",
                              borderWidth: 1,
                              callbacks: { label: (ctx) => `${ctx.label}: ${currency(ctx.parsed)}` },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      {salaryPlan.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-sm text-black">{p.label} ({Math.round(p.pct * 100)}%)</span>
                          </div>
                          <div className="text-sm font-semibold text-black">{currency(Math.round(Number(salaryData.amount) * p.pct))}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-black/70 mt-2">Enter salary amount to see the breakdown.</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-green-500/50 flex gap-3">
              <button onClick={() => setShowSalaryModal(false)} className="flex-1 rounded-lg border border-green-500/50 py-2 text-sm text-green-400 hover:text-green-300 bg-white shadow-sm shadow-green-500/30">
                Cancel
              </button>
              <button onClick={addSalary} className="flex-1 rounded-lg bg-[#34D399] hover:bg-[#10B981] text-white py-2 text-sm shadow-md shadow-green-500/30 border border-green-500/50">
                Save Salary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white shadow-2xl shadow-green-500/30 border border-green-500/50">
            <div className="flex items-center justify-between p-5 border-b border-green-500/50">
              <div className="text-lg font-semibold text-black">My Account</div>
              <button onClick={() => setShowAccountModal(false)} className="p-2 rounded-lg hover:bg-white border border-green-500/30">
                <X className="h-5 w-5 text-green-400 hover:text-green-300" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-900/30 text-green-400 grid place-items-center text-base font-semibold">
                  {initialsFromName(user?.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold text:black">{user?.name || "User"}</div>
                  <div className="text-xs text-black/60">{user?.email || ""}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-green-500/30 p-3">
                  <div className="text-xs text-black/60">Total Income</div>
                  <div className="font-semibold text-green-700">{currency(totals.income)}</div>
                </div>
                <div className="rounded-lg border border-green-500/30 p-3">
                  <div className="text-xs text-black/60">Total Expenses</div>
                  <div className="font-semibold text-red-600">-{currency(totals.expenses)}</div>
                </div>
                <div className="rounded-lg border border-green-500/30 p-3">
                  <div className="text-xs text-black/60">Balance</div>
                  <div className={cn("font-semibold", totals.balance >= 0 ? "text-green-700" : "text-red-600")}>
                    {totals.balance >= 0 ? "+" : "-"}{currency(Math.abs(totals.balance))}
                  </div>
                </div>
              </div>
              <div className="text-xs text-black/60">Transactions: {transactions.length}</div>
            </div>
            <div className="p-5 border-t border-green-500/50 flex gap-3">
              <button onClick={() => { setShowAccountModal(false); setActiveNav("settings"); }} className="flex-1 rounded-lg border border-green-500/50 py-2 text-sm text-green-400 hover:text-green-300 bg-white shadow-sm shadow-green-500/30">
                Open Settings
              </button>
              <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 text-white py-2 text-sm shadow-md border border-red-600/50">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Chatbot floating assistant */}
<Chatbot transactions={transactions} budget={settings.salaryPlan} />
    </div>
  );
};

// If someone copy-pastes earlier name by mistake
const stakedOrStacked = (d) => d;

const KPI = ({ title, value, delta, note, positive = true }) => {
  const isUp = (positive && delta >= 0) || (!positive && delta <= 0);
  const pct = Math.abs(Math.round(delta * 10) / 10);
  return (
    <div className="rounded-2xl bg-white border border-green-500/50 shadow-md shadow-green-500/30 p-4">
      <div className="text-sm font-semibold text-black">{title}</div>
      <div className="mt-1 flex items-end justify-between">
        <div className="text-2xl font-bold text-black">{value}</div>
        <div className={cn("text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1 border border-green-500/40", isUp ? "text-green-600" : "text-red-600")}>
          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {pct}%
        </div>
      </div>
      <div className="mt-1 text-xs text-green-200">{note}</div>
    </div>
  );
};

export default FinanceTracker;