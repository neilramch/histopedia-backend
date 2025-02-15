require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Explicitly allow requests from your frontend
const corsOptions = {
  origin: [
    "http://localhost:5173",  // Allow local frontend during development
    "https://worldhistopedia.org" // ✅ Allow live frontend to access backend
  ],
  methods: "GET,POST",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// ✅ Apply CORS settings
app.use(cors(corsOptions));


// Load API Keys
const GOOGLE_NEWS_API_KEY = process.env.GOOGLE_NEWS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ensure API keys are loaded
console.log("Starting server...");
console.log("Google News API Key:", GOOGLE_NEWS_API_KEY ? "✅ Loaded" : "❌ Not Loaded!");
console.log("OpenAI API Key:", OPENAI_API_KEY ? "✅ Loaded" : "❌ Not Loaded!");

// OpenAI setup
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Chatbot API Route
app.post("/api/chat", async (req, res) => {
  console.log("Received chat request:", req.body);

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


app.get("/api/news", async (req, res) => {
  console.log("Fetching latest archaeology & historical news...");

  const NEWS_URL = `https://newsapi.org/v2/everything?q="archaeological discovery" OR "ancient civilization" OR "historical artifact" OR "lost city" OR "excavation"&sortBy=publishedAt&language=en&pageSize=50&apiKey=${process.env.GOOGLE_NEWS_API_KEY}`;

  try {
    const response = await axios.get(NEWS_URL); // ✅ Ensure response is defined here

    if (!response || !response.data || !response.data.articles) {
      throw new Error("Invalid API response structure.");
    }

    console.log("✅ Raw API Response (Before Filtering):", response.data.articles.length);

    // 🔹 Filter for history-related articles
    const filteredArticles = response.data.articles.filter(article =>
      /(archaeolog|ancient|histor|artifact|excavat|lost city)/i.test(article.title) ||
      /(archaeolog|ancient|histor|artifact|excavat|lost city)/i.test(article.description)
    );

    console.log("✅ Filtered Articles (After Filtering):", filteredArticles.length);
    res.json(filteredArticles.slice(0, 5)); // Return top 5 relevant articles
  } catch (error) {
    console.error("❌ Error fetching news:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});


// Start Server (Only Once!)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
