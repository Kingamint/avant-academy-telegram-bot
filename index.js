import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  const userMessage = msg.text;

  try {
    // === AI REQUEST (with system prompt) ===
    const ai = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are AvantAcademyAI, an English-speaking forex assistant. ALWAYS respond in English only. Never use Malay or Indonesian. Keep replies short, clear, and focused on trading and Avant Academy indicators."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = ai.data.output_text;

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: msg.chat.id,
        text: reply
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("AI Error:", err?.response?.data || err);
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: msg.chat.id,
        text: "Sorry, I couldn't generate a response."
      }
    );
    res.sendStatus(200);
  }
});

app.listen(10000, () => console.log("Bot server is running..."));
