require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// 🔹 Allow requests from Vercel, Squarespace, AND Localhost (Vite uses port 5173)
const corsOptions = {
  origin: ["http://localhost:5173", "https://your-frontend-url.com"], // Add your frontend URL
  methods: "GET,POST",
  credentials: true
};

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

// 🔹 Chatbot API Route
app.post("/api/chat", async (req, res) => {
  console.log("✅ Received chat request:", req.body);

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

// 🔹 News API Route (Only One Definition Now)
app.get("/api/news", async (req, res) => {
  console.log("✅ Received request at /api/news");

  const NEWS_URL = `https://newsapi.org/v2/everything?q="archaeological discovery" OR "ancient civilization" OR "historical artifact" OR "lost city" OR "excavation"&sortBy=publishedAt&language=en&pageSize=20&apiKey=${GOOGLE_NEWS_API_KEY}`;

  try {
    console.log("📡 Fetching news from Google News API...");
    const response = await axios.get(NEWS_URL);

    // 🔹 Manually filter results to ensure they're history-related
    const filteredArticles = response.data.articles.filter(article =>
      article.title.toLowerCase().includes("archaeology") ||
      article.title.toLowerCase().includes("ancient") ||
      article.title.toLowerCase().includes("historical") ||
      article.title.toLowerCase().includes("artifact") ||
      article.title.toLowerCase().includes("excavation") ||
      article.description?.toLowerCase().includes("archaeology") ||
      article.description?.toLowerCase().includes("ancient") ||
      article.description?.toLowerCase().includes("historical") ||
      article.description?.toLowerCase().includes("artifact") ||
      article.description?.toLowerCase().includes("lost city")
    );

    console.log("✅ Filtered Articles:", filteredArticles.slice(0, 5));
    res.json(filteredArticles.slice(0, 5)); // Return only top 5 relevant articles
  } catch (error) {
    console.error("❌ Error fetching news:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// 🔹 Start Server (Only Once!)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
