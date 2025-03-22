require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Check for missing API key
const API_KEY = process.env.MISTRAL_API_KEY;
if (!API_KEY) {
    console.error("❌ ERROR: Missing MISTRAL_API_KEY in .env file.");
    process.exit(1);
}

app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        // Validate input
        if (!question || typeof question !== "string") {
            return res.status(400).json({ error: "Invalid input. Question must be a non-empty string." });
        }

        // Call Mistral AI API
        const response = await axios.post(
            "https://api.mistral.ai/v1/chat/completions",
            {
                model: "mistral-medium",
                messages: [
                    { 
                        role: "system", 
                        content: "You are Rupesh, a professional investment advisor for retail investors. Keep your responses **short, direct, and actionable**. Instead of lengthy explanations, provide concise investment tips, key insights, and clear recommendations. Structure your responses in HTML format with the following rules:\n\n- Use <h1> tags for any main heading, such as advice topics or key points.\n- Use <ul> and <li> tags to list out detailed steps or recommendations.\n- For any subheading or important point under a main heading, use <h2> tags.\n- Do not provide plain text or explanations outside the HTML structure.\n- Do not use any code block formatting (e.g., ```html or similar).\n- Make the tone conversational and friendly, as if you're talking directly to a fellow investor.\n\nProvide valuable insights on fundamental and technical analysis, asset allocation, risk management, and smart investing habits."
                    },
                    { role: "user", content: question }
                ]
            },
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );

        // Validate AI response
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error("Invalid response from Mistral API");
        }

        res.json({ answer: response.data.choices[0].message.content });

    } catch (error) {
        console.error("❌ Mistral API Error:", error.response?.data || error.message || error);

        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data.error || "Mistral API error." });
        } else {
            res.status(500).json({ error: "Internal server error." });
        }
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
