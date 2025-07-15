const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/webhook', async (req, res) => {
  const userMessage = req.body.Body;
  const userNumber = req.body.From;

  try {
    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful hotel booking assistant.' },
        { role: 'user', content: userMessage }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = openaiRes.data.choices[0].message.content;

    await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, new URLSearchParams({
      From: 'whatsapp:+14155238886', // Twilio sandbox
      To: userNumber,
      Body: reply
    }), {
      auth: {
        username: process.env.TWILIO_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('Error:', err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
