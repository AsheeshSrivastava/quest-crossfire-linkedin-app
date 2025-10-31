// Vercel Serverless Function - Generate Post
// This acts as a proxy to avoid CORS issues
import { getUserFromRequest } from '../lib/auth.js';

export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  try {
    const { theme, post_type, length, tone, brand_context } = req.body;

    // Validate required fields
    if (!theme || !post_type || !length || !tone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call n8n webhook (server-to-server, no CORS!)
    const n8nResponse = await fetch(process.env.N8N_GENERATE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme,
        post_type,
        length,
        tone,
        brand_context: brand_context || 'Quest And Crossfire - Small fixes, big clarity'
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n returned ${n8nResponse.status}`);
    }

    // Get the generated post text
    const generatedPost = await n8nResponse.text();

    // Return to frontend
    res.status(200).send(generatedPost);

  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({
      error: 'Failed to generate post',
      details: error.message
    });
  }
}
