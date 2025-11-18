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
    // Hantar ke OpenAI (chat completions)
    const completion = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are AvantAcademyAI, an assistant for forex traders. Jawab ringkas, jelas, dan fokus pada indicator Avant Academy."
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

    const aiReply =
      completion.data.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response.";

    // Reply balik ke Telegram
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: msg.chat.id,
        text: aiReply
      }
    );
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: msg.chat.id,
        text: "Error talking to AI. Please try again."
      }
    );
  }

  res.sendStatus(200);
});

app.listen(10000, () => {
  console.log("Bot server is running...");
});
