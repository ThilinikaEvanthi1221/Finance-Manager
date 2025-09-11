// routes/ai.js
import express from "express";
import { pipeline } from "@xenova/transformers";
import Restaurant from "../models/Restaurant.js";

const router = express.Router();
let generator;

// Load model once
// (async () => {
//   console.log("Loading flan-t5-base...");
//   generator = await pipeline("text2text-generation", "Xenova/flan-t5-base");
//   console.log("✅ flan-t5-base ready!");
// })();

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    // Extract numeric max budget from user text
    const budgetMatch = prompt.match(/\d+/);
    const budget = budgetMatch ? parseInt(budgetMatch[0]) : 500;

    // Find matching restaurants from Mongo
    const results = await Restaurant.find({ price: { $lte: budget } });
    console.log("🍲 Found restaurants:", results);

    if (!results.length) {
      return res.json({ reply: "No restaurants found under that budget." });
    }

    // Build context for Flan
    const context = results
      .map(r => `${r.name} (${r.cuisine}, avg ₹${r.price})`)
      .join("\n");

    const input = `
Here is a restaurant list:
${context}

The user asked: "${prompt}"
Answer in a friendly way suggesting options:
`;

    console.log("🚀 Sending prompt to flan:\n", input);

    const result = await generator(input, { max_new_tokens: 100 });
    console.log("🤖 Raw model result:", result);

    res.json({ reply: result[0].generated_text.trim() });
  } catch (err) {
    console.error("❌ AI route error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;