// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "./models/Restaurant.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/finance-app";

async function seedRestaurants() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // wipe any old restaurants
    await Restaurant.deleteMany({});
    console.log("🧹 Cleared old restaurant entries");

    // insert sample restaurants
    const restaurants = [
      { name: "SpiceHub", cuisine: "Indian", price: 350 },
      { name: "PizzaTown", cuisine: "Italian", price: 450 },
      { name: "Sushi Zen", cuisine: "Japanese", price: 700 },
      { name: "Burger Byte", cuisine: "American", price: 300 },
      { name: "Green Bowl", cuisine: "Vegan", price: 200 },
    ];

    await Restaurant.insertMany(restaurants);
    console.log("🍽️ Inserted sample restaurants");

    mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    mongoose.disconnect();
  }
}

seedRestaurants();