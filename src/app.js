const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const router = express.Router();

const IPGEOLOCATION_API_KEY = process.env.IPGEOLOCATION_API_KEY;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

router.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const testIp = req.query.test_ip;

    try {
        // Fetch the client IP address from the X-Forwarded-For header or use the request IP
        const clientIp = testIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Get the location data based on the IP address
        const locationResponse = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}&ip=${clientIp}&fields=geo`);
        const locationData = locationResponse.data;
        const location = locationData.city || 'Unknown Location';
        const latitude = locationData.latitude;
        const longitude = locationData.longitude;

        // Get the weather data based on the latitude and longitude
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
