require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

app.get('/api/search', async (req, res) => {
  console.log('Received request:', req.query);
  
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: req.query.departure,
      destinationLocationCode: req.query.destination,
      departureDate: req.query.date,
      adults: '1'
    });
    
    console.log('Amadeus API response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error in Amadeus API call:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
