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

