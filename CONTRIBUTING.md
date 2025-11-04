# Contributing to Quest And Crossfire™ LinkedIn AI

Thank you for your interest in contributing to this AI-powered LinkedIn post generator!

## 🎯 Project Philosophy

This project embodies **Quest And Crossfire** philosophy:
- **Systems Thinking** - See patterns, loops, interconnected systems
- **People First** - Every decision serves the human using it
- **Small fixes, big clarity** - Simple solutions to complex problems

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Vercel account (for deployment testing)
- LinkedIn Developer account (for OAuth testing)
- OpenAI API key
- n8n instance (for workflow automation)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AsheeshSrivastava/quest-crossfire-linkedin-app.git
   cd quest-crossfire-linkedin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_KEY` - Supabase service role key
   - `LINKEDIN_CLIENT_ID` - From LinkedIn Developer Portal
   - `LINKEDIN_CLIENT_SECRET` - From LinkedIn Developer Portal
   - `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `N8N_GENERATE_WEBHOOK` - Your n8n generate webhook URL
   - `N8N_PUBLISH_WEBHOOK` - Your n8n publish webhook URL

4. **Run development server**
   ```bash
   npm run dev
   # or
   vercel dev
   ```

   Open `http://localhost:3000`

## 📐 Code Standards

### JavaScript/Node.js
- Use ES6+ syntax
- Async/await preferred over promises
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Follow existing code style

### Brand Voice
- Maintain Quest And Crossfire tone: Reflective, Honest, Systematic
- Use diamond symbol (◇) in UI elements
- "People First" filter applies to all features
- No clickbait, hype, or fake positivity

### Security
- **Never commit** `.env`, `.env.local`, or credentials
- Use environment variables for all secrets
- Validate all user inputs
- Sanitize data before display
- Follow OWASP security best practices

### Testing
- Test OAuth flow thoroughly
- Verify LinkedIn API integration
- Check error handling paths
- Test with different user roles (admin vs regular users)
- Verify CORS handling

## 🏗️ Architecture

```
Frontend (public/index.html)
    ↓
Backend API (api/generate.js, api/publish.js)
    ↓
n8n Workflows (AI Agent + LinkedIn API)
    ↓
LinkedIn (Published Posts)
```

**Key Principles:**
- Backend handles all external API calls (no CORS issues)
- Serverless functions for scalability
- Vercel for deployment simplicity
- Three-layer security: Frontend gate + Backend JWT + Email whitelist

## 🔧 Pull Request Process

1. **Fork and create branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code standards
   - Maintain brand philosophy
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Run development server
   vercel dev

   # Test OAuth flow
   # - Login with LinkedIn
   # - Generate a post
   # - Publish to LinkedIn

   # Test error cases
   # - Invalid credentials
   # - Network failures
   # - API rate limits
   ```

4. **Commit with clear message**
   ```bash
   git commit -m "feat: add custom prompt templates"
   ```

   **Commit message format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation only
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and open PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   **In your Pull Request, include:**
   - Clear description of changes
   - Reference any related issues (#123)
   - Screenshots (if UI changes)
   - Test results
   - Why this change matters (user benefit)

## 🐛 Bug Reports

When reporting bugs, please include:

**Required Information:**
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment details
- Error messages or console logs
- Screenshots (if applicable)

**Example:**
```
**Bug:** LinkedIn OAuth callback fails after authorization

**Steps to Reproduce:**
1. Click "Login with LinkedIn"
2. Authorize on LinkedIn
3. Redirect to callback URL
4. Error: "Invalid state parameter"

**Expected:** Successful login and redirect to dashboard
**Actual:** Error message and stuck on callback page

**Environment:**
- Browser: Chrome 120.0
- OS: Windows 11
- Vercel deployment (production)

**Error Log:**
[Paste error from console]
```

## 💡 Feature Requests

We welcome feature suggestions! Please:

1. **Check if it already exists** - Search issues first
2. **Explain the use case** - Why is this needed?
3. **Describe expected behavior** - What should happen?
4. **Consider implementation** - How complex is this?
5. **Align with philosophy** - Does it serve "People First"?

**Good Feature Request Example:**
```
**Feature:** Save draft posts locally

**Use Case:** Users want to iterate on posts over multiple sessions
without losing their work.

**Expected Behavior:**
- Auto-save drafts to localStorage every 30 seconds
- Show "Saved" indicator
- Restore draft on page reload
- Clear draft after successful publish

**Why It Matters:** Reduces frustration of losing work, enables
thoughtful iteration (aligns with "Reflective Practice").
```

## 📂 Project Structure

```
quest-crossfire-linkedin-app/
├── api/
│   ├── auth/
│   │   ├── linkedin/
│   │   │   ├── callback.js     # LinkedIn OAuth callback
│   │   │   └── login.js        # Initiate LinkedIn OAuth
│   │   ├── logout.js           # User logout
│   │   └── validate.js         # JWT token validation
│   ├── generate.js             # AI post generation API
│   └── publish.js              # LinkedIn publishing API
├── lib/
│   ├── auth.js                 # JWT utilities
│   ├── linkedin.js             # LinkedIn API client
│   └── supabase.js             # Supabase client
├── public/
│   ├── index.html              # Main application UI
│   ├── login.html              # Login page
│   └── styles.css              # Brand styles
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── vercel.json                 # Vercel configuration
├── LICENSE                     # AGPL-3.0 license
├── CONTRIBUTING.md             # This file
└── README.md                   # Project documentation
```

## 🛡️ Security Guidelines

### Authentication
- Use JWT tokens for session management
- Implement proper token expiration (7 days)
- Validate tokens on every protected route
- Use HTTP-only cookies where possible

### LinkedIn OAuth
- Validate `state` parameter to prevent CSRF
- Store LinkedIn tokens securely in Supabase
- Refresh tokens before expiration
- Handle revoked tokens gracefully

### API Security
- Implement email whitelist for admin features
- Rate limit API endpoints
- Validate all inputs server-side
- Log authentication failures
- Use HTTPS everywhere (Vercel provides this)

### Secret Management
- Never commit `.env` files
- Rotate secrets regularly
- Use Vercel environment variables for production
- Encrypt sensitive data in database

## ❓ Questions & Support

- **Email:** asheeshsrivastava9@gmail.com
- **Issues:** Open a GitHub issue with the `question` label
- **Documentation:** Check `DEPLOYMENT-GUIDE.md` and `ARCHITECTURE.md`
- **Auth Issues:** See `AUTH-FIX-QUICKSTART.md`

## 📜 License

By contributing, you agree that your contributions will be licensed under **AGPL-3.0**.

This means:
- Your code remains open source
- Derivative works must also be AGPL-3.0
- Network use triggers source disclosure requirement
- Commercial use is allowed (with license compliance)

## 🙏 Acknowledgments

Contributions welcome from:
- **Developers** - Code improvements, features, bug fixes
- **Designers** - UI/UX enhancements (maintain brand identity)
- **Writers** - Documentation improvements
- **Testers** - Bug reports, edge cases, UX feedback

---

## 🎯 Current Focus Areas

**High Priority:**
- ✅ Stabilize LinkedIn OAuth (see `AUTH-FIX-QUICKSTART.md`)
- ✅ Improve error handling and user feedback
- ✅ Add draft saving to localStorage
- ✅ Enhance mobile responsiveness

**Medium Priority:**
- 🟡 Add post scheduling
- 🟡 Multiple LinkedIn account support
- 🟡 Post analytics integration
- 🟡 Custom prompt templates

**Low Priority:**
- 🔵 Dark mode
- 🔵 Internationalization
- 🔵 Browser extension

---

**Note on Trademarks:** QUEST AND CROSSFIRE™, AETHELGARD ACADEMY™, and AETHELGARD AXIS™ are registered trademarks. Code contributions are AGPL-3.0, but trademark usage requires permission.

---

**◇ Where chaos becomes clarity. Small fixes, big clarity.**
