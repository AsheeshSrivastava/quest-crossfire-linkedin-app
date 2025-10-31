// Vercel Serverless Function - Publish to LinkedIn
// This acts as a proxy to avoid CORS issues and updates database
import { requireAuth } from '../lib/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

async function handler(req, res) {
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

  try {
    const { post_text, post_id, metadata } = req.body;

    // Validate required fields
    if (!post_text) {
      return res.status(400).json({ error: 'Post text is required' });
    }

    // Call n8n webhook (server-to-server, no CORS!)
    const n8nResponse = await fetch(process.env.N8N_PUBLISH_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_text,
        metadata: metadata || {}
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n returned ${n8nResponse.status}`);
    }

    // Get response from n8n
    const publishResult = await n8nResponse.json();

    // Update database if post_id provided
    if (post_id && publishResult.success) {
      const { error } = await supabaseAdmin
        .from('posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          linkedin_post_urn: publishResult.postUrn || null
        })
        .eq('id', post_id)
        .eq('user_id', req.user.userId); // Ensure user owns the post

      if (error) {
        console.error('Database update error:', error);
      }
    }

    // Return to frontend
    res.status(200).json(publishResult);

  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({
      error: 'Failed to publish post',
      details: error.message
    });
  }
}

// Export with auth requirement
export default requireAuth(handler);
