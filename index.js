import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;
const AGENT_ID = process.env.AGENT_ID;

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  const userMessage = msg.text;

  try {
    // Send user message to OpenAI Agent
    const ai = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: AGENT_ID,
        input: userMessage
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply =
      ai?.data?.output_text?.join("") ||
      ai?.data?.output_text ||
      "Sorry, I couldn't generate a response.";

    // Send AI reply back to Telegram user
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: msg.chat.id,
        text: aiReply
      }
    );
  } catch (error) {
    console.error("AI Error:", error);
  }

  res.sendStatus(200);
});

// Start server
app.listen(10000, () => console.log("Bot server is running..."));
