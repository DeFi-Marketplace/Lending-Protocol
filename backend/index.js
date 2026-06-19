const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'credit-oracle' });
});

const MOCK_SCORES = {
  'GA4Z3GJ3VU5C5YQ7H7N5D6J6X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2': 750,
  'GB5A4H4W6D6Z6R8I8P7E7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5': 620,
  'GC6B5I5X7E7A7S9J9Q8F9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7': 480,
};

app.post('/api/credit-score', (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const score = MOCK_SCORES[address] ?? Math.floor(Math.random() * 400) + 400;
  const isEligible = score >= 600;

  res.json({ address, score, isEligible, minScore: 600 });
});

app.listen(PORT, () => {
  console.log(`Credit oracle backend running on port ${PORT}`);
});
