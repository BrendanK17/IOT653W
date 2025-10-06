require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Simple mock endpoint - replace with AI call later
app.get('/api/routes', (req, res) => {
  const { airport = 'Heathrow', group = 1 } = req.query;
  // Mock data - in real app you'd call LLM / DB
  const data = [
    { mode: "Piccadilly Line Tube", duration_minutes: 45, cost: 6.30, notes: "Contactless/Oyster. Oyster costs £7 deposit for new cards." },
    { mode: "Heathrow Express", duration_minutes: 15, cost: 25.00, notes: "Fastest but more expensive. Contactless accepted." },
    { mode: "Taxi/Uber", duration_minutes: 40, cost: 60.00, notes: "Price varies; good for groups." },
  ];
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
