const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const requestIp = require('request-ip');

dotenv.config();

const app = express();
const router = express.Router();

app.set('trust proxy', true);

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

router.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'World';
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '8.8.8.8';

    try {
        // Get location
        const locationRes = await axios.get(`http://ip-api.com/json/${clientIp}`);
        const locationData = locationRes.data;

        const city = locationData.city || 'Unknown';

        // Get weather
        const weatherRes = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
        const weatherData = weatherRes.data;

        const temperature = weatherData.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
