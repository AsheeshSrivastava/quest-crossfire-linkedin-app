// LinkedIn OAuth - Handle callback and create session
import { supabaseAdmin } from '../../../lib/supabase.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error, error_description } = req.query;

  // Check for OAuth errors
  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect('/?error=No authorization code received');
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const { access_token } = await tokenResponse.json();

    // Get user profile from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profile = await profileResponse.json();

    // Create or update user in Supabase
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', profile.email)
      .single();

    let userId;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user via Supabase Auth
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: profile.email,
        user_metadata: {
          linkedin_id: profile.sub,
          name: profile.name,
          picture: profile.picture,
          linkedin_access_token: access_token
        },
        email_confirm: true
      });

      if (signUpError) {
        throw signUpError;
      }

      userId = authData.user.id;
    }

    // Create JWT session token
    const sessionToken = jwt.sign(
      {
        userId,
        email: profile.email,
        name: profile.name,
        linkedin_access_token: access_token
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set session cookie
    res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    // Redirect to dashboard
    res.redirect('/dashboard.html');

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    res.redirect(`/?error=${encodeURIComponent('Authentication failed. Please try again.')}`);
  }
}
