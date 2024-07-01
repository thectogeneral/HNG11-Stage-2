const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const router = express.Router();

const IPGEOLOCATION_API_KEY = process.env.IPGEOLOCATION_API_KEY;

router.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const testIp = req.query.test_ip; // For testing purposes
    const clientIp = testIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        // Get the location and weather data based on the IP address
        const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}&ip=${clientIp}&fields=geo,weather`);
        const location = response.data.city || 'Unknown Location';
        const temperature = response.data.weather.temperature || 'Unknown Temperature';

        res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
        });
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
