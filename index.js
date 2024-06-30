const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const testIp = req.query.test_ip; // For testing purposes
    const clientIp = testIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Fetch location based on IP
    try {
        const response = await axios.get(`http://ip-api.com/json/${clientIp}`);
        const location = response.data.city || 'Unknown Location';

        res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}!`
        });
    } catch (error) {
        res.status(500).send('Error fetching location data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
