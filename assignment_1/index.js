const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;
const WINDOW_SIZE = 10;
const TIMEOUT = 500;

let numberWindow = [];

const apiMap = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};
const BEARER_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5MDE4MTY4LCJpYXQiOjE3NDkwMTc4NjgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijk3YzJmMDNkLTEyNWEtNDFiYS05Yjc1LTU4YzZiOTJkNDFmYiIsInN1YiI6Imh0NTU3MTYwMUBnbWFpbC5jb20ifSwiZW1haWwiOiJodDU1NzE2MDFAZ21haWwuY29tIiwibmFtZSI6ImhhcnNoIHRoYWt1ciIsInJvbGxObyI6IjcyMjMzMzY2aiIsImFjY2Vzc0NvZGUiOiJLUmpVVVUiLCJjbGllbnRJRCI6Ijk3YzJmMDNkLTEyNWEtNDFiYS05Yjc1LTU4YzZiOTJkNDFmYiIsImNsaWVudFNlY3JldCI6InJLY0JwUWZtRHNKVlFWUG4ifQ.qZAq06xqxMAhNjjuVd4wYue0RTP8K4LsLsIr5VaJoyE';

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;
  const url = apiMap[numberid];

  if (!url) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }

  const prevState = [...numberWindow];
  let fetchedNumbers = [];

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        Authorization: BEARER_TOKEN
      }
    });

    fetchedNumbers = response.data.numbers || [];
    console.log('✅ Fetched from API:', fetchedNumbers);

  } catch (error) {
    console.error('❌ Error fetching from external API:', error.message);
    return res.json({
      windowPrevState: prevState,
      windowCurrState: prevState,
      numbers: [],
      avg: calculateAverage(prevState)
    });
  }

  // Update the window with unique numbers
  for (const num of fetchedNumbers) {
    if (!numberWindow.includes(num)) {
      numberWindow.push(num);
      if (numberWindow.length > WINDOW_SIZE) {
        numberWindow.shift(); // Remove oldest
      }
    }
  }

  const currState = [...numberWindow];

  res.json({
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: fetchedNumbers,
    avg: calculateAverage(currState)
  });
});

function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(2));
}

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});