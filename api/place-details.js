// Vercel serverless function to proxy Google Place Details API
// Keeps API key secure on the server side

module.exports = async (req, res) => {
  // Enable CORS for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { place_id } = req.query;

  if (!place_id) {
    return res.status(400).json({ error: 'Missing place_id parameter' });
  }

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: data.status, message: data.error_message });
    }
  } catch (error) {
    console.error('Place details error:', error);
    return res.status(500).json({ error: 'Failed to get place details' });
  }
};
