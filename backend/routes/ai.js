const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/generate", auth, async (req, res) => {
  const { type, context } = req.body;

  const prompts = {
    notes: `Write a short, professional invoice note for a business. Context: ${context || "general services"}. Keep it under 3 sentences.`,
    payment_terms: `Write clear payment terms for an invoice. Context: ${context || "freelance project"}. Keep it short and professional.`,
    description: `Write a professional service description for an invoice item. Service: ${context}. Keep it 1-2 sentences.`,
    message: `Write a friendly professional message to send with an invoice. Context: ${context || "completed project"}. Keep it short and warm.`,
  };

  const prompt = prompts[type] || prompts.notes;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    res.json({ text: result.text });
  } catch (err) {
    console.log("Gemini error:", err.message);
    res.status(500).json({ message: "AI generation failed", error: err.message });
  }
});

module.exports = router;