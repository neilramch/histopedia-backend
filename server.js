require('dotenv').config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log("Starting server...");
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Not Loaded!");

app.post("/api/chat", async (req, res) => {
  console.log("Received request:", req.body);

  try {
    const { messages } = req.body;
    if (!messages) {
      console.log("❌ No messages found in request body.");
      return res.status(400).json({ error: "No messages provided." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    console.log("✅ OpenAI Response:", completion.choices[0].message);
    res.json(completion.choices[0].message);
  } catch (error) {
    console.error("❌ Error fetching response:", error);
    res.status(500).json({ error: "API request failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
