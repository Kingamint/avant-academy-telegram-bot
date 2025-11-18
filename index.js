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
    // Send message to OpenAI model
    const ai = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: userMessage
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Parse OpenAI reply
    const aiReply =
      ai?.data?.output_text?.join("") ||
      ai?.data?.output_text ||
      "Sorry, I couldn't generate a response.";

    // Send reply back to Telegram
    await axios.post(
      `https://api.te
