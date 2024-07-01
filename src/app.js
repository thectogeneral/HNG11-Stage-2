const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const requestIp = require('request-ip');

dotenv.config();

const app = express();
const router = express.Router();

const IPINFO_KEY = process.env.IPINFO_KEY;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

router.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = requestIp.getClientIp(req) || ''; // Default to an empty string if clientIp is undefined

    try {
        // Get the location data based on the IP address using ipinfo
        const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}/geo`, {
            headers: { Authorization: `Bearer ${IPINFO_KEY}` }
        });
        const location = locationResponse.data.city || 'Unknown Location';
        const [latitude, longitude] = locationResponse.data.loc.split(',');

        // Get the weather data based on the latitude and longitude
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;

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
