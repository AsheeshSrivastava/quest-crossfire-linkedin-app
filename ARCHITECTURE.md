# Quest And Crossfire LinkedIn AI - Complete System Architecture

**Target:** Production-ready LinkedIn automation system with auth, database, analytics, and scheduling

---

## **System Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  (linkedin.questandcrossfire.com)                       │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Login     │  │  Generate    │  │  History +     │  │
│  │  (LinkedIn)│  │  Posts       │  │  Analytics     │  │
│  └────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS BACKEND                   │
│                                                          │
│  /api/auth/linkedin     → OAuth flow                     │
│  /api/generate          → AI post generation             │
│  /api/publish           → LinkedIn publishing            │
│  /api/schedule          → Schedule posts                 │
│  /api/posts             → Get user post history          │
│  /api/analytics         → Get analytics data             │
└─────────────────────────────────────────────────────────┘
            ↓                    ↓                  ↓
┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐
│   SUPABASE DB    │  │   n8n WORKFLOWS  │  │  VERCEL     │
│   (PostgreSQL)   │  │                  │  │  CRON       │
│                  │  │  - AI Generation │  │  (Scheduler)│
│  - users         │  │  - Publishing    │  │             │
│  - posts         │  │                  │  └─────────────┘
│  - schedules     │  └──────────────────┘
│  - analytics     │           ↓
└──────────────────┘  ┌──────────────────┐
                      │  OpenAI + LinkedIn│
                      │  APIs             │
                      └──────────────────┘
```

---

## **Phase 1: Database + Authentication (Start Here)**

### **1.1 Supabase Setup**

**Database Tables:**

```sql
-- Users table (managed by Supabase Auth)
-- Auto-created, includes linkedin_id, email, etc.

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  theme TEXT NOT NULL,
  post_type TEXT NOT NULL,
  length TEXT NOT NULL,
  tone TEXT NOT NULL,
  post_text TEXT NOT NULL,

  -- Metadata
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, published
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- LinkedIn data
  linkedin_post_urn TEXT,

  -- Analytics (to be populated later)
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0
);

-- Schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,

  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics summary table
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  total_posts INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  avg_engagement FLOAT DEFAULT 0,

  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_executed ON schedules(executed);
```

**Row Level Security (RLS) Policies:**

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Users can only see their own posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar for schedules
CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Similar for analytics
CREATE POLICY "Users can view own analytics" ON analytics_summary
  FOR SELECT USING (auth.uid() = user_id);
```

---

### **1.2 LinkedIn OAuth Integration**

**Flow:**
1. User clicks "Login with LinkedIn"
2. Redirect to LinkedIn OAuth
3. User authorizes app
4. LinkedIn redirects back with code
5. Exchange code for access token
6. Store token in Supabase (encrypted)
7. Use token for publishing

**LinkedIn App Setup:**
- Create LinkedIn app at: https://www.linkedin.com/developers/apps
- Permissions needed: `w_member_social` (write posts), `r_liteprofile` (read profile)
- Redirect URL: `https://linkedin.questandcrossfire.com/api/auth/linkedin/callback`

**Environment Variables:**
```env
# Supabase
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_REDIRECT_URI=https://linkedin.questandcrossfire.com/api/auth/linkedin/callback

# n8n Webhooks
N8N_GENERATE_WEBHOOK=https://qnc-asheesh.app.n8n.cloud/webhook/linkedin-generate
N8N_PUBLISH_WEBHOOK=https://qnc-asheesh.app.n8n.cloud/webhook/linkedin-publish

# JWT Secret (for session management)
JWT_SECRET=your-random-secret-string
```

---

## **Phase 2: Frontend with Auth + History**

### **2.1 New UI Components**

**Login Page:**
- "Login with LinkedIn" button
- Quest And Crossfire branding
- Privacy statement

**Dashboard (After Login):**
- Welcome message with user name
- "Create New Post" button
- Post history list
- Analytics summary cards

**Post History View:**
- Table/list of past posts
- Filters: All | Drafts | Scheduled | Published
- Actions: Edit, Republish, Delete, View Analytics

**Analytics Dashboard:**
- Post type breakdown (pie chart)
- Publishing frequency (line chart)
- Engagement trends
- Best performing posts

---

## **Phase 3: Scheduling System**

### **3.1 Vercel Cron Jobs**

**vercel.json addition:**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-posts",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Process:**
1. Every 15 minutes, check for posts with `scheduled_for <= NOW()`
2. Publish via n8n
3. Update post status to `published`
4. Mark schedule as `executed`

---

## **Phase 4: Enhanced n8n Workflows**

### **4.1 Generate Workflow (Updated)**

**Changes:**
- Accept `user_id` parameter
- Return post draft
- DO NOT auto-publish
- Frontend saves to database

### **4.2 Publish Workflow (Updated)**

**Changes:**
- Accept `post_id` and `user_id`
- Retrieve post from database
- Publish to LinkedIn
- Update database with LinkedIn URN
- Return success/error

### **4.3 Analytics Workflow (New)**

**Purpose:** Fetch LinkedIn post stats

**Trigger:** Daily cron job
**Steps:**
1. Get all published posts from last 30 days
2. For each post, call LinkedIn API for stats
3. Update database with likes, comments, impressions
4. Calculate engagement rate
5. Update analytics_summary table

---

## **Implementation Order (Step-by-Step)**

### **Session 1: Database + Basic Auth (Tonight - 1 hour)**
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Set up LinkedIn OAuth app
- [ ] Implement login flow
- [ ] Test authentication

### **Session 2: Save Posts to Database (30 min)**
- [ ] Update /api/generate to save drafts
- [ ] Update /api/publish to update status
- [ ] Test data flow

### **Session 3: Post History UI (1 hour)**
- [ ] Create dashboard page
- [ ] Build post history list
- [ ] Add edit/republish actions
- [ ] Test CRUD operations

### **Session 4: Scheduling (1 hour)**
- [ ] Add schedule picker UI
- [ ] Create /api/schedule endpoint
- [ ] Implement Vercel cron job
- [ ] Test scheduled publishing

### **Session 5: Analytics (1-2 hours)**
- [ ] Build analytics queries
- [ ] Create dashboard UI
- [ ] Add charts/graphs
- [ ] Test with real data

### **Session 6: Polish + Deploy (30 min)**
- [ ] Final testing
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Celebrate! 🎉

---

## **Technology Stack**

**Frontend:**
- HTML/CSS/JavaScript (vanilla, no framework bloat)
- Chart.js for analytics graphs
- Quest And Crossfire branded design

**Backend:**
- Vercel Serverless Functions (Node.js)
- Supabase for database + auth
- n8n for AI + LinkedIn integration

**Third-Party Services:**
- Supabase (free tier: 500MB database)
- Vercel (free tier: generous limits)
- LinkedIn API
- OpenAI API (via n8n)

---

## **Estimated Costs**

**Free Tier:**
- Vercel: Free (enough for personal use)
- Supabase: Free (500MB, 50,000 monthly active users)
- n8n: Free (if self-hosted) or Cloud plan

**Paid (Optional):**
- Custom domain: $10-15/year (you already have)
- n8n Cloud: $20/month (if needed)
- LinkedIn API: Free for personal use

**Total: $0-20/month depending on n8n**

---

## **Security Considerations**

1. **Authentication:**
   - LinkedIn OAuth (industry standard)
   - JWT tokens for sessions
   - Supabase RLS for data isolation

2. **API Security:**
   - Rate limiting on endpoints
   - User-specific access tokens
   - No hardcoded secrets (use env vars)

3. **Data Privacy:**
   - User data encrypted at rest (Supabase)
   - LinkedIn tokens encrypted
   - No sharing between users (RLS)

---

## **Future Enhancements (Post-MVP)**

1. **AI Improvements:**
   - Learn from user's top posts
   - Suggest optimal posting times
   - Auto-tag themes

2. **Collaboration:**
   - Team accounts
   - Approval workflows
   - Content calendar view

3. **Multi-Platform:**
   - Twitter/X integration
   - Facebook/Instagram
   - Blog auto-posting

4. **Advanced Analytics:**
   - Competitor analysis
   - Hashtag performance
   - Audience insights

---

## **Questions Before We Start?**

1. Do you already have a Supabase account? (Or should we create one?)
2. Do you have a LinkedIn Developer app? (Or should we create one?)
3. Any specific analytics metrics you want to track?
4. Preferred scheduling granularity? (15-min intervals? Hourly? Custom times?)

Let me know and we'll start implementing! 🚀
