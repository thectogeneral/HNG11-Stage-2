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
    const testIp = req.query.test_ip; // For testing purposes
    const clientIp = testIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Ensure the IP address is in IPv4 format
    const ipv4Pattern = /(\d{1,3}\.){3}\d{1,3}/;
    const ipv4Address = clientIp.match(ipv4Pattern) ? clientIp.match(ipv4Pattern)[0] : '8.8.8.8';

    try {
        // Get the location data based on the IP address
        const locationResponse = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}&ip=${ipv4Address}&fields=geo`);
        const location = locationResponse.data.city || 'Unknown Location';
        const latitude = locationResponse.data.latitude;
        const longitude = locationResponse.data.longitude;

        // Get the weather data based on the latitude and longitude
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: ipv4Address,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
        });
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
