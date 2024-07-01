const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const router = express.Router();

const IPINFO_API_TOKEN = process.env.IPINFO_API_TOKEN;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

router.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const testIp = req.query.test_ip; // For testing purposes

    let clientIp;
    try {
        // Determine the client IP address
        if (testIp) {
            clientIp = testIp;
        } else if (req.headers['x-forwarded-for']) {
            clientIp = req.headers['x-forwarded-for'].split(',')[0].trim();
        } else if (req.connection.remoteAddress) {
            clientIp = req.connection.remoteAddress;
        } else {
            // Fetch the client IP address using ipify as a fallback
            const ipifyResponse = await axios.get('https://api.ipify.org?format=json');
            clientIp = ipifyResponse.data.ip;
        }

        console.log(`Client IP: ${clientIp}`); // Log the client IP for debugging

        // Get the location data based on the IP address using IPinfo
        const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}?token=${IPINFO_API_TOKEN}`);
        const location = locationResponse.data.city || 'Unknown Location';
        const [latitude, longitude] = locationResponse.data.loc.split(',');

        console.log(`Location: ${location}, Latitude: ${latitude}, Longitude: ${longitude}`); // Log location data for debugging

        // Get the weather data based on the latitude and longitude
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
        });
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).send('Error fetching data');
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
