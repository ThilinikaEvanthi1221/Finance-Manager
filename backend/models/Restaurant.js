// models/Restaurant.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  price: { type: Number, required: true } // avg cost per person
});

export default mongoose.model("Restaurant", restaurantSchema);