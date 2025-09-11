// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


dotenv.config();

import aiRoutes from "./routes/ai.js";
const app = express();
app.use(cors());
app.use(express.json());

// Validate env
const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment. Add it in backend/.env");
  process.exit(1);
}

// MongoDB connect
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

// ============ Models ============
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

const financeSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  type: { type: String, enum: ["income", "expense"], required: true },
  category: String,
  paymentMethod: { type: String, enum: ["card","cash","bank","bill","upi","wallet","other"], default: "other" },
  date: { type: Date, default: Date.now },
  notes: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
});

const Finance = mongoose.model("Finance", financeSchema);

// ============ Auth middleware ============
const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ============ Auth routes ============
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("_id name email");
  res.json({ user });
});

// ============ Finance routes (protected) ============
app.post("/api/finance", auth, async (req, res) => {
  try {
    const { amount, type, category } = req.body || {};
    if (typeof amount !== "number" || !type || !category) {
      return res.status(400).json({ error: "amount (number), type, and category are required" });
    }
    const record = new Finance({ ...req.body, user: req.userId });
    await record.save();
    res.json(record);
  } catch (err) {
    console.error("Add finance error:", err);
    res.status(500).json({ error: "Failed to add record" });
  }
});

app.get("/api/finance", auth, async (req, res) => {
  try {
    const records = await Finance.find({ user: req.userId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error("Fetch finance error:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});
app.use("/api/ai", aiRoutes);

console.log("HF_API_KEY from env:", process.env.HF_API_KEY);


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));