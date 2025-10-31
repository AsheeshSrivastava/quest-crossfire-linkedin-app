# 🎓 Learning Blog: From "Getting Out of Session" to Production-Ready OAuth

**By:** Asheesh Ranjan Srivastava (with Claude AI)
**Date:** November 1, 2025
**Project:** Quest And Crossfire LinkedIn AI Post Generator
**Tech Stack:** Vercel, LinkedIn OAuth, n8n, Supabase, JWT

---

## 📖 The Story

It started with a simple vision: build an AI-powered LinkedIn post generator that embodies the Quest And Crossfire philosophy—"Small fixes, big clarity." The previous night, I had built the core features with Claude's help: AI post generation, LinkedIn publishing, a branded UI. Everything seemed ready.

But there was one problem: **authentication kept breaking**. Every time I tried to login, I'd get "out of the session." I'd tried fixing it with Opus, but the issue persisted. Tonight, I needed to figure this out once and for all.

What followed was a 2.5-hour deep dive into OAuth 2.0, serverless architectures, and security best practices. This is the story of how we debugged, fixed, and secured a production-ready application—step by step.

---

## 🎯 The Problem Statement

**Initial Symptom:**
> "I keep getting out of the session"

**What This Actually Meant:**
- OAuth login flow was failing
- Sessions weren't persisting
- Users couldn't authenticate
- The app was unusable

**The Bigger Challenge:**
This wasn't just about fixing one bug. It was about:
1. Understanding **why** OAuth was failing
2. Implementing **proper** authentication
3. Making the app **secure**
4. Ensuring it works in **production**, not just locally

---

## 🔍 Phase 1: The Investigation

### **What We Knew:**
- OAuth code existed (written in previous session)
- Local environment variables configured
- LinkedIn Developer App created
- Supabase database ready

### **What We Didn't Know:**
- Why it wasn't working
- What was actually breaking
- Where the failure occurred

### **The Systematic Approach:**

1. **Read the existing code** - Don't assume, verify
2. **Check the environment** - Local vs production differences
3. **Trace the OAuth flow** - Where does it break?
4. **Look at the logs** - What do errors say?

---

## 🐛 The Root Causes (All 4 of Them!)

Turns out, "getting out of session" wasn't one problem—it was **four interconnected issues**:

### **Problem #1: The 404 Redirect**

**The Code:**
```javascript
// In api/auth/linkedin/callback.js
res.redirect('/dashboard.html');  // Line 108
```

**The Issue:**
After successful LinkedIn authorization, the callback tried to redirect to `/dashboard.html`.

**The Problem:**
That file doesn't exist! So users saw a 404 page, and the session cookie never persisted because the redirect failed.

**The Learning:**
> Always verify file paths before redirecting. A broken redirect can silently kill your entire authentication flow.

**The Fix:**
```javascript
res.redirect('/');  // Redirect to existing index.html
```

---

### **Problem #2: The Redirect URI Mismatch**

**The Configuration:**
```bash
# .env.local
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Actual production URL
https://quest-crossfire-linkedin-app.vercel.app
```

**The Issue:**
OAuth redirect URIs must match **exactly** what's configured in the LinkedIn Developer App. My local config had `localhost`, but in production, it was a Vercel URL.

**The Learning:**
> OAuth providers are strict about redirect URIs for security reasons. A mismatch = instant rejection, no exceptions.

**The Hidden Complexity:**
Vercel creates multiple URLs:
- **Preview URLs:** `quest-crossfire-linkedin-r02gar0uv.vercel.app` (changes with each deployment!)
- **Production URL:** `quest-crossfire-linkedin-app.vercel.app` (stable)

I kept testing on preview URLs, which kept changing, which kept breaking OAuth!

**The Fix:**
1. Identify the **stable production URL**
2. Configure **both** localhost and production in LinkedIn Developer App:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   https://quest-crossfire-linkedin-app.vercel.app/api/auth/linkedin/callback
   ```
3. Always test on **production URL**, not previews

---

### **Problem #3: Missing Environment Variables in Vercel**

**The Realization:**
```javascript
// This works locally
const clientId = process.env.LINKEDIN_CLIENT_ID;

// In production
console.log(process.env.LINKEDIN_CLIENT_ID);
// Output: undefined
```

**The Issue:**
Environment variables in `.env.local` only exist on my machine. Vercel serverless functions had no idea these variables existed!

**The Learning:**
> Serverless platforms need environment variables configured separately. Local config ≠ production config.

**The Fix:**
Manually added all 10 environment variables in Vercel dashboard:
- Supabase credentials (3 variables)
- LinkedIn OAuth (3 variables)
- n8n webhooks (2 variables)
- JWT secret (1 variable)
- Base URL (1 variable)

**Pro Tip:**
For each variable, select "All Environments" (Production, Preview, Development) to ensure consistency.

---

### **Problem #4: LinkedIn Products Not Enabled**

**The Symptom:**
After clicking "Login with LinkedIn," the page showed:
> "Bummer, something is wrong"

No authorization button. Just an error from LinkedIn itself.

**The Investigation:**
Checked every possible cause:
- ✅ Redirect URI correct
- ✅ Client ID correct
- ✅ Environment variables set
- ❌ Something still wrong...

**The Discovery:**
In LinkedIn Developer App → **Products** tab:
- "Sign In with LinkedIn using OpenID Connect" - **Not added**
- "Share on LinkedIn" - **Not added**

**The Learning:**
> LinkedIn requires explicit product approval. You can't just use OAuth—you need to add and enable the specific products your app uses.

**The Fix:**
1. Go to LinkedIn Developer App → Products tab
2. Add "Sign In with LinkedIn using OpenID Connect"
3. Add "Share on LinkedIn"
4. Wait for approval (instant in my case)

**Result:**
OAuth flow immediately started working!

---

## 🔒 Phase 2: The Security Realization

After getting OAuth working, I tested the app. It worked perfectly! Posts generated, published to LinkedIn, everything smooth.

Then I asked myself:
> "Wait... if someone else visits this URL, can THEY post to MY LinkedIn?"

**Answer:** Yes. Anyone could.

**The Problem:**
The app was public. No authentication checks. Anyone with the URL could:
1. Generate posts
2. Publish to my LinkedIn account
3. Use my n8n workflows
4. Access my AI credits

**This wasn't acceptable.**

---

## 🛡️ The Three-Layer Security Solution

### **Layer 1: Frontend Authentication Gate**

**The Approach:**
Check if user is authenticated when they load the page.

**The Code:**
```javascript
// In public/index.html
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'  // Critical: include session cookies
        });

        if (!response.ok || response.status === 401) {
            window.location.href = '/login.html';
            return false;
        }

        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/login.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Check immediately when page loads
checkAuth();
```

**The Learning:**
> Always include `credentials: 'include'` in fetch requests to send session cookies. Without it, the server can't verify authentication.

---

### **Layer 2: Backend API Protection**

**The Approach:**
Even if someone bypasses the frontend, protect the APIs themselves.

**The Code:**
```javascript
// In api/generate.js and api/publish.js
import { getUserFromRequest } from '../lib/auth.js';

export default async function handler(req, res) {
    // ... CORS headers ...

    // Check authentication
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized. Please login first.'
        });
    }

    // ... rest of the API logic ...
}
```

**The `getUserFromRequest` function:**
```javascript
// In lib/auth.js
import jwt from 'jsonwebtoken';

export function getUserFromRequest(req) {
    try {
        // Parse cookies from request header
        const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const sessionToken = cookies?.session;

        if (!sessionToken) {
            return null;
        }

        // Verify JWT
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
        return decoded;

    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}
```

**The Learning:**
> Always verify authentication on the server side. Client-side checks can be bypassed—server-side checks cannot.

---

### **Layer 3: Email Whitelist**

**The Realization:**
Even with authentication working, **any** LinkedIn user could login and use the app!

**The Question:**
> "How can I test that it can sign in with some other ID or password or not?"

**The Answer:**
We need a whitelist. Only specific email addresses should be allowed.

**The Code:**
```javascript
// In api/auth/linkedin/callback.js
const profile = await profileResponse.json();

// SECURITY: Only allow specific email addresses (whitelist)
const ALLOWED_EMAILS = ['asheeshsrivastava9@gmail.com'];

if (!ALLOWED_EMAILS.includes(profile.email)) {
    console.log(`Access denied for email: ${profile.email}`);
    return res.redirect('/?error=' + encodeURIComponent(
        'Access Denied. This app is private and only accessible to authorized users.'
    ));
}

// Continue with user creation only if email is whitelisted...
```

**Testing the Whitelist:**
1. Temporarily changed to `['test@example.com']`
2. Tested in incognito mode
3. Got "Access Denied" message ✅
4. Restored correct email
5. Verified authorized user can login ✅

**The Learning:**
> For private applications, implement a whitelist at the OAuth callback level. This prevents unauthorized users from even creating a session.

---

## 🎓 Technical Concepts Learned

### **1. OAuth 2.0 Flow (The Complete Picture)**

```
User clicks "Login with LinkedIn"
    ↓
Redirect to LinkedIn authorization endpoint
(with: client_id, redirect_uri, scope, state)
    ↓
User authorizes app on LinkedIn
    ↓
LinkedIn redirects back to your callback URL
(with: authorization code, state)
    ↓
Your callback exchanges code for access token
(POST to LinkedIn token endpoint)
    ↓
Use access token to fetch user profile
    ↓
Create session (JWT) for your app
    ↓
Set session cookie
    ↓
Redirect to main app
```

**Critical Points:**
- **State parameter:** CSRF protection (verify it matches)
- **Redirect URI:** Must match exactly what's registered
- **Access token:** Short-lived, use to fetch profile
- **Session token:** Your own JWT for your app
- **Cookies:** HTTP-only, Secure flag for production

---

### **2. JWT Session Management**

**What is JWT?**
JSON Web Token - a way to securely transmit information between parties.

**Our Implementation:**
```javascript
// Create JWT when user logs in
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

// Set as HTTP-only cookie
res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`);
```

**Why JWT?**
- **Stateless:** No database lookups needed
- **Secure:** Signed with secret, can't be tampered
- **Self-contained:** All info in the token
- **Expirable:** Automatic session timeout

**Security Flags:**
- **HttpOnly:** JavaScript can't access it (XSS protection)
- **Secure:** Only sent over HTTPS (production)
- **SameSite=Lax:** CSRF protection
- **Max-Age:** Token expires after 7 days

---

### **3. Environment Variables in Serverless**

**The Difference:**

**Local Development:**
```bash
# .env.local (on your machine)
LINKEDIN_CLIENT_ID=abc123
```
```javascript
// Works in local dev
process.env.LINKEDIN_CLIENT_ID  // "abc123"
```

**Production (Vercel):**
```javascript
// Without config in Vercel dashboard
process.env.LINKEDIN_CLIENT_ID  // undefined
```

**Why?**
Serverless functions are stateless. Each invocation is a new environment. Environment variables must be injected by the platform.

**Solution:**
Configure in platform dashboard (Vercel Settings → Environment Variables)

---

### **4. CORS in Serverless Functions**

**The Issue:**
Frontend (browser) → Backend (different origin) = CORS error

**The Solution:**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
res.setHeader('Access-Control-Allow-Credentials', 'true');

// Handle preflight requests
if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
}
```

**Critical for authentication:**
```javascript
// Frontend must include credentials
fetch('/api/generate', {
    method: 'POST',
    credentials: 'include',  // ← This sends cookies!
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

---

## 🎯 Key Takeaways

### **Technical Lessons:**

1. **OAuth redirect URIs are sacred**
   - Must match exactly
   - Include http/https correctly
   - Test on stable URLs, not changing ones

2. **Environment variables need explicit configuration**
   - Local ≠ Production
   - Configure in platform dashboard
   - Never commit secrets to Git

3. **Authentication needs multiple layers**
   - Frontend: User experience
   - Backend: Security enforcement
   - Whitelist: Access control

4. **Testing must be thorough**
   - Test after each change
   - Test in incognito (clean cookies)
   - Test unauthorized scenarios

5. **Documentation is your future self's best friend**
   - Document what didn't work
   - Document why it didn't work
   - Document what you learned

---

### **Problem-Solving Approach:**

1. **Start with symptoms, dig to root causes**
   - "Getting out of session" → 4 specific issues

2. **Verify assumptions with evidence**
   - Don't assume files exist
   - Check actual URLs, not expected ones
   - Read error messages carefully

3. **Break big problems into small steps**
   - Fix one issue at a time
   - Test after each fix
   - Don't move forward until verified

4. **Think about security from the start**
   - "It works" ≠ "It's ready"
   - Always ask: "Who else can access this?"
   - Layer defenses (defense in depth)

5. **Document as you go**
   - Capture problems when fresh
   - Record exact solutions
   - Note learnings for future

---

## 💡 Insights for Others

### **If You're Building OAuth Authentication:**

**DO:**
- ✅ Use stable URLs for redirect URIs
- ✅ Configure environment variables in production
- ✅ Verify file paths before redirecting
- ✅ Enable required products/permissions
- ✅ Test thoroughly in production environment
- ✅ Implement multiple security layers
- ✅ Use HTTP-only cookies for sessions
- ✅ Add email whitelist for private apps

**DON'T:**
- ❌ Assume preview URLs work like production
- ❌ Trust only frontend authentication
- ❌ Forget to include credentials in fetch requests
- ❌ Commit secrets to Git
- ❌ Skip testing unauthorized access
- ❌ Redirect to non-existent pages
- ❌ Assume OAuth works without enabling products

---

### **If Your OAuth Is Failing:**

**Check This Checklist:**

1. **Redirect URI**
   - [ ] Matches exactly in provider dashboard
   - [ ] Includes correct protocol (http vs https)
   - [ ] No trailing slashes if provider doesn't have them
   - [ ] Using stable URL, not preview/temporary

2. **Environment Variables**
   - [ ] All required variables configured
   - [ ] Configured in production platform (not just local)
   - [ ] Values copied correctly (no extra spaces)
   - [ ] Selected "All Environments"

3. **Provider Configuration**
   - [ ] App created in provider dashboard
   - [ ] Required products/permissions enabled
   - [ ] Scopes requested match what's approved
   - [ ] Client ID and secret are correct

4. **Code Implementation**
   - [ ] Callback redirects to existing page
   - [ ] Session cookie is actually set
   - [ ] Cookie flags correct (HttpOnly, Secure, SameSite)
   - [ ] JWT secret is configured
   - [ ] Credentials included in API requests

5. **Testing**
   - [ ] Test in incognito (clean cookies)
   - [ ] Test on actual production URL
   - [ ] Check browser console for errors
   - [ ] Check server logs for errors
   - [ ] Verify session persists after refresh

---

## 🚀 The Results

### **Before:**
- ❌ "Getting out of session"
- ❌ OAuth fails silently
- ❌ No authentication
- ❌ App is public
- ❌ Unusable in production

### **After:**
- ✅ OAuth works perfectly
- ✅ Sessions persist for 7 days
- ✅ Three-layer security
- ✅ Only authorized user can access
- ✅ Production-ready application

### **Time Investment:**
- 2.5 hours of focused debugging
- 4 major commits
- 808 lines of code/docs
- Countless learnings

### **Value Created:**
- Fully functional authentication
- Production-ready security
- Comprehensive documentation
- Reusable knowledge for future projects

---

## 🎬 The Bigger Picture

This wasn't just about fixing a bug. It was about:

1. **Systems Thinking**
   - Understanding how components interact
   - Seeing the full OAuth flow
   - Recognizing interconnected issues

2. **Reflective Practice**
   - Learning from what didn't work
   - Understanding why it didn't work
   - Applying lessons to future projects

3. **People First**
   - Building secure, private applications
   - Protecting user data
   - Creating trust through security

These are the Quest And Crossfire principles in action: **"Small fixes, big clarity."**

Each fix was small:
- Change a redirect path
- Add environment variables
- Enable LinkedIn products
- Add authentication checks
- Implement email whitelist

But together, they created big clarity:
- A working OAuth system
- A secure application
- A production deployment
- Comprehensive knowledge

---

## 📚 Resources for Learning More

**OAuth 2.0:**
- [OAuth 2.0 Simplified](https://www.oauth.com/)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)

**JWT:**
- [JWT.io](https://jwt.io/)
- [JWT Best Practices](https://curity.io/resources/learn/jwt-best-practices/)

**Serverless:**
- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Best Practices](https://www.serverless.com/blog/serverless-best-practices)

**Security:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)

---

## 🙏 Acknowledgments

**Technologies:**
- Vercel (serverless hosting)
- LinkedIn API (OAuth + publishing)
- n8n (AI automation)
- Supabase (database)
- Claude AI (debugging partner)

**Philosophy:**
- Quest And Crossfire: Systems Thinking + People First
- "Small fixes, big clarity"
- Learning through reflection

---

## 💭 Final Thoughts

> "The best way to learn is to build, break, and fix things."

Tonight, I didn't just fix authentication. I learned:
- How OAuth 2.0 really works (not just theoretically)
- How to debug systematically
- How to implement real security
- How to ship production-ready code
- How to document for future me

**The most valuable lesson?**

**Problems are never as simple as they seem.** "Getting out of session" wasn't one bug—it was four interconnected issues. Taking the time to understand each one, fix it properly, and document the learning transformed a frustrating bug into a valuable learning experience.

**That's the Quest And Crossfire way: Where chaos becomes clarity.**

---

## 🔗 Try It Yourself

**Live App:**
https://quest-crossfire-linkedin-app.vercel.app

**GitHub Repository:**
https://github.com/AsheeshSrivastava/quest-crossfire-linkedin-app

**Note:** The app is currently private (whitelist only), but the code and documentation are public. Learn from it, build on it, make it your own.

---

**◇ Small fixes, big clarity.**

**Written with:** Claude Code (https://claude.com/claude-code)
**Date:** November 1, 2025
**Status:** Production-ready and fully documented
