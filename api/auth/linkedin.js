// LinkedIn OAuth - Initiate authentication flow
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'LinkedIn OAuth not configured' });
  }

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(7);

  // Store state in session/cookie
  // Note: For localhost, we need to adjust cookie settings (Secure flag doesn't work with http)
  const isLocalhost = redirectUri.includes('localhost');
  const cookieOptions = isLocalhost
    ? `linkedin_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`
    : `linkedin_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;

  res.setHeader('Set-Cookie', cookieOptions);

  // LinkedIn OAuth authorization URL
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', 'openid profile email w_member_social');

  // Debug: Log the redirect URI being used
  console.log('LinkedIn OAuth URL:', authUrl.toString());
  console.log('Redirect URI being sent:', redirectUri);

  // Redirect user to LinkedIn
  res.redirect(authUrl.toString());
}
