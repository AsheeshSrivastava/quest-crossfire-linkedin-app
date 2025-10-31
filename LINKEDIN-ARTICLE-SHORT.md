# From "Getting Out of Session" to Production-Ready: Building an AI LinkedIn Assistant in 48 Hours

**How I built, broke, debugged, and secured a complete AI app — and what I learned about OAuth, serverless architecture, and systems thinking**

---

What if you could have an AI assistant that doesn't just automate your LinkedIn posts—but actually *understands* your brand philosophy? Not generic AI-speak, but posts that sound authentically like you?

That was the challenge I set for myself on Day 5 of my AI Engineering journey with OutSkill's bootcamp.

**The goal:** Build a complete AI-powered LinkedIn post generator that:
- Generates posts in my brand voice (Quest And Crossfire: Systems Thinking + People First)
- Publishes directly to LinkedIn
- Works in production, not just locally
- Is secure and private

**The reality:** What started as a "simple" automation project became a deep dive into OAuth 2.0, serverless architectures, JWT authentication, and production debugging.

This is the story of that 48-hour journey—the wins, the failures, and the working app that emerged.

---

**[INSERT IMAGE: Screenshot of your app's main page here]**

*The Quest And Crossfire LinkedIn AI app - from broken authentication to production-ready in 4.5 hours*

---

## Day 5: Building the Foundation (4 hours) 🚀

### The Vision

I wanted to build more than just another automation tool. I wanted an AI that thinks like Quest And Crossfire:
- **Reflective** (not hype-driven)
- **Systematic** (structured thinking)
- **People-first** (serves the reader)
- **Honest** (no corporate speak)

### The Architecture

**Frontend:**
- Clean, branded UI with diamond symbol (◇)
- Form for post parameters (theme, type, tone, length)
- Editable preview with character counter
- One-click publishing

**Backend:**
- Vercel serverless functions (no server to manage)
- Two API endpoints: `/api/generate` and `/api/publish`
- Proxy to n8n webhooks (avoids CORS issues)
- OAuth authentication with LinkedIn
- JWT session management

**AI Layer:**
- n8n workflow with AI Agent
- 200+ line system prompt embedding brand philosophy
- OpenAI GPT-4o-mini for generation
- LinkedIn API for direct publishing

**Why this stack?**
- **Vercel:** Free tier, automatic deployments, edge network
- **n8n:** Visual workflow builder with AI agent capabilities
- **Supabase:** PostgreSQL database for future features
- **LinkedIn API:** Direct posting with OAuth security

### The Build

**Hour 1-2: Frontend** - Created branded interface with vanilla JavaScript (no framework bloat)

**Hour 2-3: Backend APIs** - Two serverless functions that proxy to n8n:
```javascript
// /api/generate - Calls AI workflow
// /api/publish - Publishes to LinkedIn
```

Why proxy? **CORS.** Browsers block direct API calls from frontend to external services. The backend proxy solves this elegantly.

**Hour 3-4: n8n AI Agent** - This is where the magic happens. The system prompt isn't just instructions—it's embedded brand philosophy:
- Quest And Crossfire voice guidelines
- Post structure patterns
- Diamond symbol (◇) usage
- What to avoid (hype, corporate speak)

**Result:** An AI that generates posts that actually sound like me.

### Testing Locally

Everything worked beautifully:
- ✅ Form submits
- ✅ AI generates authentic posts
- ✅ Preview appears
- ✅ Ready to publish

I was thrilled. Time to deploy to production...

**That's when everything broke.** 💥

---

## The Breaking Point: Deployment Day 😅

I pushed to Vercel. Deployment succeeded. Green checkmarks everywhere.

I opened the production URL. UI loaded perfectly.

I clicked "Generate Post." **It worked!**

I clicked "Publish to LinkedIn." **It worked!**

Wait... I just published without logging in? 🤔

I refreshed the page. Tried again. **"Getting out of the session."**

The app that worked flawlessly locally was completely broken in production.

**The symptoms:**
- OAuth authentication failing
- Sessions not persisting
- "Getting kicked out"
- App essentially unusable

Worse: I'd tried fixing this before with another AI assistant (Opus), but the problem persisted. I needed a different approach.

---

## Day 6: The Debugging Marathon (4.5 hours) 🔍

### The Systematic Approach

Instead of randomly trying fixes, Claude Code and I took a methodical approach:

1. **Read existing code** - Verify assumptions
2. **Check environment differences** - Local vs production
3. **Trace the OAuth flow** - Where exactly does it break?
4. **Check server logs** - What errors are hidden?
5. **Test incrementally** - Fix one thing, test, repeat

This systematic debugging revealed not one bug, but **four interconnected issues.**

---

## The Four Root Causes 🎯

### Problem #1: The 404 Redirect 🔴

**The Code:**
```javascript
// In api/auth/linkedin/callback.js
res.redirect('/dashboard.html');
```

**The Issue:** After successful LinkedIn authorization, the callback tried to redirect to `/dashboard.html`.

**The Problem:** That file doesn't exist! Users saw a 404 page, and the session cookie never persisted.

**The Learning:** A broken redirect can silently kill your entire authentication flow. Always verify file paths.

**The Fix:**
```javascript
res.redirect('/');  // Redirect to existing index.html
```

---

### Problem #2: The URI Mismatch 🔄

**The Configuration:**
```bash
# .env.local
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Actual production
https://quest-crossfire-linkedin-app.vercel.app
```

**The Issue:** OAuth redirect URIs must match **exactly** what's configured in LinkedIn Developer App.

**The Hidden Complexity:** Vercel creates multiple URLs:
- **Preview URLs:** `quest-crossfire-linkedin-r02gar0uv.vercel.app` (changes every deployment!)
- **Production URL:** `quest-crossfire-linkedin-app.vercel.app` (stable)

I kept testing on preview URLs, which kept changing, which kept breaking OAuth! 😅

**The Learning:** OAuth providers are strict about redirect URIs for security. Always use stable production URLs.

**The Fix:**
1. Identified stable production URL
2. Configured both localhost and production in LinkedIn Developer App
3. Always tested on production URL, not preview URLs

---

### Problem #3: Missing Environment Variables ⚙️

**The Code:**
```javascript
// Works locally
const clientId = process.env.LINKEDIN_CLIENT_ID;

// In production
console.log(process.env.LINKEDIN_CLIENT_ID);
// Output: undefined
```

**The Issue:** Environment variables in `.env.local` only exist on my machine. Vercel functions had no idea these variables existed!

**The Learning:** Serverless platforms need environment variables configured separately. Local config ≠ production config.

**The Fix:** Manually added all 10 environment variables in Vercel dashboard:
- Supabase credentials (3)
- LinkedIn OAuth (3)
- n8n webhooks (2)
- JWT secret (1)
- Base URL (1)

**Pro Tip:** Select "All Environments" for each variable to ensure consistency.

---

### Problem #4: LinkedIn Products Not Enabled 🔌

**The Symptom:** After clicking "Login with LinkedIn":
> "Bummer, something is wrong"

No authorization button. Just an error from LinkedIn.

**The Discovery:** In LinkedIn Developer App → Products tab:
- "Sign In with LinkedIn using OpenID Connect" - **Not added** ❌
- "Share on LinkedIn" - **Not added** ❌

**The Learning:** LinkedIn requires explicit product approval. You can't just use OAuth—you need to enable the specific products.

**The Fix:**
1. Enabled "Sign In with LinkedIn using OpenID Connect"
2. Enabled "Share on LinkedIn"
3. Waited for approval (instant)

**Result:** OAuth flow immediately started working! ✅

---

## The Security Wake-Up Call 😱

After fixing OAuth, I tested the app. Everything worked perfectly!

Then I realized: **"Wait... anyone with this URL can post to MY LinkedIn?"**

**Answer:** Yes. 😬

**The Problem:** The app was public. Anyone could:
- Generate posts
- Publish to my LinkedIn
- Use my n8n workflows
- Burn my AI credits

This wasn't acceptable.

---

## The Three-Layer Security Solution 🛡️

Instead of a single check, I implemented **defense in depth:**

### Layer 1: Frontend Authentication Gate 🚪

```javascript
// Check auth on page load
async function checkAuth() {
    const response = await fetch('/api/auth/check', {
        credentials: 'include'  // Critical!
    });

    if (!response.ok) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

checkAuth();
```

**Key:** Always include `credentials: 'include'` to send session cookies.

---

### Layer 2: Backend API Protection 🔐

```javascript
// In api/generate.js and api/publish.js
import { getUserFromRequest } from '../lib/auth.js';

export default async function handler(req, res) {
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // ... API logic ...
}
```

JWT verification ensures only authenticated users can call APIs.

---

### Layer 3: Email Whitelist ✅

```javascript
// In OAuth callback
const ALLOWED_EMAILS = ['asheeshsrivastava9@gmail.com'];

if (!ALLOWED_EMAILS.includes(profile.email)) {
    return res.redirect('/?error=Access Denied');
}
```

Only specific email addresses can even complete OAuth login.

**Testing:** Temporarily changed whitelist, tested in incognito, verified "Access Denied" appeared, then restored. ✅

---

## Technical Deep Dive: What I Learned 🎓

### OAuth 2.0 Flow (Simplified)

```
User clicks "Login with LinkedIn"
    ↓
Redirect to LinkedIn (client_id, redirect_uri, scope)
    ↓
User authorizes
    ↓
LinkedIn redirects back (authorization code)
    ↓
Exchange code for access token
    ↓
Fetch user profile
    ↓
Check email whitelist
    ↓
Create JWT session token
    ↓
Set HTTP-only secure cookie
    ↓
Redirect to app
```

**Critical points:**
- Redirect URI must match exactly
- State parameter prevents CSRF
- Access token is short-lived
- Session token is your own JWT

---

### JWT Session Management

**Why JWT?**
- Stateless (no database lookups)
- Secure (signed with secret)
- Self-contained (all info in token)
- Expirable (7-day timeout)

**Security flags:**
- **HttpOnly:** JavaScript can't access (XSS protection)
- **Secure:** Only sent over HTTPS
- **SameSite=Lax:** CSRF protection
- **Max-Age:** Auto-expires

---

### Serverless vs Traditional

**Key difference:** Environment variables

**Traditional server:**
- Variables in server config
- Always available

**Serverless (Vercel):**
- Each function invocation is new
- Variables must be injected by platform
- Must configure in dashboard separately

**Lesson:** Don't assume local `.env.local` carries over!

---

## The Results: Before vs After 📊

### Before ❌
- "Getting out of session"
- OAuth fails silently
- No authentication
- App is public
- Unusable in production

### After ✅
- OAuth works perfectly
- Sessions persist 7 days
- 3-layer security
- Only authorized user
- Production-ready

### Metrics
- **Time:** 4.5 hours debugging
- **Root causes:** 4 interconnected
- **Security layers:** 3
- **Code changes:** 808 lines
- **Documentation:** 2,574 lines
- **Commits:** 7 clean

---

## Key Learnings & Takeaways 💡

### Technical Lessons

**1. OAuth redirect URIs are sacred**
- Must match exactly (http/https, no typos)
- Use stable production URLs
- Configure both local and production

**2. Environment variables need explicit config**
- Local ≠ Production in serverless
- Configure in platform dashboard
- Never commit secrets to Git

**3. Authentication needs multiple layers**
- Frontend: User experience
- Backend: Security enforcement
- Whitelist: Access control

**4. Test in actual production**
- Preview URLs behave differently
- Local success ≠ production success
- Verify on stable production URL

**5. Document everything**
- Capture problems when fresh
- Record exact solutions
- Future you will thank you

---

### Problem-Solving Approach

**What worked:**

**◇ Systematic debugging** - Investigate, don't guess

**◇ Break down big problems** - Fix one, test, repeat

**◇ Verify assumptions** - Check actual values

**◇ Think security first** - "It works" ≠ "It's ready"

**◇ Document as you go** - Transform frustration into knowledge

---

## The Quest And Crossfire Way

This entire experience embodied the philosophy I built the app around:

**◇ Systems Thinking** - Understanding how components interact, finding interconnected root causes

**◇ Reflective Practice** - Learning from failures, documenting the journey

**◇ People First** - Building secure, trustworthy applications

**◇ Small fixes, big clarity** - Each fix was simple individually, but together they transformed chaos into a working system

**That's the tagline in action:** "Where chaos becomes clarity."

---

## What's Next: The Roadmap 🗺️

### This Week ✅
- Custom domain: `linkedin.questandcrossfire.com`
- Logout button
- Post history dashboard

### Next 2 Weeks 📅
- **Scheduling system:** Queue posts for optimal times
- **Advanced post types:** Systematic Analysis, Honest Reflection, Experimental formats
- **Analytics dashboard:** Track engagement, identify patterns

### Future 🚀
- AI improvements (learn from writing style)
- Multi-platform support (Twitter/X, Facebook)
- Team features (if expanding beyond personal use)

---

## The Bigger Picture: AI That Thinks Like You 🧠

This wasn't just about automation—it was proving a concept:

**Can AI truly embody a brand philosophy?**

**Answer: Yes, with the right approach.**

**What makes this different:**
- **Generic AI:** "Here are 5 LinkedIn post ideas..."
- **This AI:** Thinks through Quest And Crossfire lens—systematic, reflective, people-first

**The key:** A 200+ line system prompt that embeds:
- Brand values
- Voice guidelines
- Structural patterns
- Avoidance patterns

**The result:** Posts that sound like me, not like generic AI.

---

## Try It Yourself (Learn From It) 📚

**The app is currently private** (email whitelist), but the learning is public:

**Live App:** https://quest-crossfire-linkedin-app.vercel.app
**GitHub:** https://github.com/AsheeshSrivastava/quest-crossfire-linkedin-app

**In the repo:**
- Complete source code
- 2,574 lines of documentation
- OAuth debugging guides
- Technical deep-dives
- Action plans

**What you can learn:**
- OAuth 2.0 with LinkedIn
- JWT session management
- Serverless patterns
- Security best practices
- AI prompt engineering
- Systematic debugging

---

## Final Thoughts 💭

Two days ago, I had an idea.
Yesterday, I built it.
Today, I broke it, debugged it, secured it, and documented it.

**The journey taught me:**

**Problems are never as simple as they seem.** "Getting out of session" was four issues hiding as one.

**Systematic beats random.** Methodical debugging found all root causes.

**Security requires layers.** One check isn't enough—defense in depth.

**Documentation transforms experience.** Frustration became knowledge.

**AI can embody philosophy.** With the right approach, it truly thinks like you.

**Most importantly:** Building real things teaches more than any tutorial.

---

## Your Turn 🤝

**I'd love to hear your thoughts:**

💭 When debugging complex problems, do you dig for root causes or tackle surface symptoms?

🔐 What's your approach to security—single check or defense in depth?

🤖 Have you built AI tools that embody your unique voice?

🚀 What's your most memorable production debugging story?

Drop a comment or connect: https://www.linkedin.com/in/asheesh-ranjan-srivastava/

---

## P.S. Meta Moment 🎯

**This article was drafted using the very app I just built and debugged.**

The AI generated the structure. I edited and expanded it. Now I'm publishing it.

Meta? Yes.
Working? Absolutely.
**That's the ultimate test.** ✨

---

## Resources 🔗

**This Project:**
- App: https://quest-crossfire-linkedin-app.vercel.app
- GitHub: https://github.com/AsheeshSrivastava/quest-crossfire-linkedin-app

**Technologies:**
- Vercel: https://vercel.com
- LinkedIn API: https://learn.microsoft.com/en-us/linkedin/
- n8n: https://n8n.io
- Supabase: https://supabase.com

**Learning:**
- OAuth 2.0: https://www.oauth.com/
- JWT: https://jwt.io/
- Serverless: https://www.serverless.com/

---

## About Quest And Crossfire ◇

**Quest And Crossfire** is my framework for making sense of complexity:

**◇ Systems Thinking** - See patterns, loops, interconnections
**◇ Reflective Practice** - Learn from experience
**◇ People First** - Every decision serves humans
**◇ Small fixes, big clarity** - Incremental improvements compound

**This project embodies that philosophy** - transforming OAuth chaos into a working, secure, documented application.

---

## Acknowledgments 🙏

**Built with:**
- Claude Code (debugging partner): https://claude.com/claude-code
- OutSkill AI Engineering Bootcamp (Day 5 challenge)
- Quest And Crossfire philosophy

**Technologies:**
- Vercel, LinkedIn API, n8n, Supabase, OpenAI

---

**◇ Where chaos becomes clarity. Small fixes, big clarity.**

---

**#AIEngineering #OAuth #Serverless #SystemsThinking #BuildInPublic #LinkedIn #WebDevelopment #Debugging #Security #ProductionReady #TechLearning #ClaudeCode**

---

**Written by:** Asheesh Ranjan Srivastava
**Date:** November 1-2, 2025
**Reading Time:** 7 minutes

**Connect:** https://www.linkedin.com/in/asheesh-ranjan-srivastava/
**Project:** https://github.com/AsheeshSrivastava/quest-crossfire-linkedin-app
