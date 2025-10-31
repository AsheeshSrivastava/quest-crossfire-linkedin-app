# Quest And Crossfire™ - AI LinkedIn Post Generator

**Where chaos becomes clarity. Small fixes, big clarity.**

An AI-powered LinkedIn post generator that embodies Quest And Crossfire philosophy: Systems Thinking + People First.

🔗 **Live:** https://linkedin.questandcrossfire.com (Setup in progress)
📦 **GitHub:** https://github.com/AsheeshSrivastava/quest-crossfire-linkedin-app
✅ **Status:** WORKING (Auth fix in progress - see `AUTH-FIX-QUICKSTART.md`)

> **🚨 IMPORTANT:** If you're having LinkedIn authentication issues, see `AUTH-FIX-QUICKSTART.md` for a complete 30-minute fix guide.

---

## 🎯 What This Does

Generates authentic LinkedIn posts using AI that:
- ✅ Sound like YOU (not generic AI)
- ✅ Embody your brand philosophy
- ✅ Apply "People First" filter
- ✅ Use Quest And Crossfire voice (Reflective, Honest, Systematic)
- ✅ Publish directly to LinkedIn

---

## 🏗️ Architecture

```
Frontend (Quest And Crossfire branded UI)
    ↓
Backend API (Vercel Serverless Functions)
    ↓
n8n Workflows (AI Agent + LinkedIn API)
    ↓
LinkedIn (Published Posts)
```

**No CORS issues.** Backend handles all external API calls.

---

## 🚀 Quick Start

### **Deploy to Your Domain:**

1. Follow `DEPLOYMENT-GUIDE.md`
2. Deploy to Vercel (free)
3. Add custom domain
4. Done! (~20 minutes)

### **Local Development:**

```bash
npm install
vercel dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
quest-crossfire-linkedin-app/
├── api/
│   ├── generate.js  # AI post generation API
│   └── publish.js   # LinkedIn publishing API
├── public/
│   └── index.html   # Frontend UI
├── package.json
├── vercel.json      # Vercel config (CORS, routing)
├── .gitignore
├── README.md
└── DEPLOYMENT-GUIDE.md
```

---

## 🎨 Brand Philosophy

**Quest And Crossfire™** embodies:

1. **Systems Thinking** - See patterns, loops, interconnected systems
2. **Reflective Practice** - Learn from experience, extract meaning
3. **"People First"** - Every decision asks: "Does this serve the human using it?"

**Voice:** Reflective, Experimental, Honest, Systematic, Encouraging

**NOT:** Clickbait, Corporate, Hype-driven, Fake positivity

---

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript (no framework bloat)
- Quest And Crossfire branded design
- Diamond symbol (◇) visual identity

**Backend:**
- Vercel Serverless Functions
- Node.js
- Proxy to n8n webhooks (solves CORS)

**AI/Automation:**
- n8n workflows with AI Agent
- OpenAI GPT-4o-mini
- LinkedIn API integration

**Hosting:**
- Vercel (free tier)
- Custom domain: `linkedin.questandcrossfire.com`
- Auto-deploy from GitHub

---

## 🧪 Features

### **AI Post Generation:**
- Multiple post types (Reflective, Systematic, Honest, Experimental)
- Depth control (Quick Insight, Exploration, Deep Dive)
- Voice customization (match your tone)
- Quest And Crossfire philosophy embedded in AI Agent

### **User Experience:**
- Editable AI drafts (human approval required)
- Character counter (3000 char limit)
- Loading states with diamond animation
- Success/error messages in brand voice
- Mobile-responsive design

### **Technical:**
- CORS-free architecture (backend proxy)
- Error handling (two paths: success + error)
- Serverless (scales automatically)
- Free hosting (Vercel)
- HTTPS automatic (SSL included)

---

## 📊 API Endpoints

### **POST /api/generate**

Generate LinkedIn post with AI.

**Request:**
```json
{
  "theme": "Breaking through workflow loops",
  "post_type": "Reflective Insight",
  "length": "Exploration (5-8 lines)",
  "tone": "Reflective & Thoughtful",
  "brand_context": "Quest And Crossfire"
}
```

**Response:**
```
Plain text (generated post)
```

---

### **POST /api/publish**

Publish post to LinkedIn.

**Request:**
```json
{
  "post_text": "Your edited post text...",
  "metadata": {
    "theme": "...",
    "post_type": "...",
    "brand": "Quest And Crossfire"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "◇ Published. Your clarity is live on LinkedIn.",
  "postUrn": "urn:li:share:...",
  "timestamp": "2025-10-31T..."
}
```

---

## 🎓 What This Demonstrates

**Not just a bootcamp assignment. Portfolio-grade work:**

✅ **Brand Strategy** - Consistent identity, philosophy embedded
✅ **Full-Stack** - Frontend + Backend + AI + API integration
✅ **Systems Thinking** - Clean architecture, separation of concerns
✅ **User-Centric** - "People First" in every decision
✅ **Professional** - Custom domain, proper hosting, production-ready
✅ **AI Engineering** - AI Agent with brand voice, not generic prompts

---

## 📝 License

MIT License - Quest And Crossfire™ is a trademark of Asheesh Ranjan Srivastava

---

## 👤 Author

**Asheesh Ranjan Srivastava (Zyric)**

- Brand: Quest And Crossfire™
- Website: https://questandcrossfire.com
- Philosophy: "Small fixes, big clarity"
- Framework: Systems Thinking + People First

---

## 🙏 Acknowledgments

- Built with AI assistance (Claude + OpenAI)
- OutSkill AI Engineering Bootcamp (Day 5)
- n8n for workflow automation
- Vercel for hosting
- The "People First" principle that makes this useful

---

**◇ Where chaos becomes clarity.**
