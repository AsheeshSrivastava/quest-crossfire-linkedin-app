# 🔐 Vercel Environment Variables Setup

**Copy these EXACT values into Vercel:**

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Select "All Environments" for each variable!**

---

## 📋 VARIABLES TO ADD

### **1. Supabase Configuration**

**Name:** `SUPABASE_URL`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Your Supabase project URL - starts with `https://`)

---

**Name:** `SUPABASE_ANON_KEY`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Your Supabase anon key - a long JWT token starting with `eyJ`)

---

**Name:** `SUPABASE_SERVICE_KEY`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Your Supabase service role key - a long JWT token starting with `eyJ`)

---

### **2. LinkedIn OAuth**

**Name:** `LINKEDIN_CLIENT_ID`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Copy from your local `.env.local` file)

---

**Name:** `LINKEDIN_CLIENT_SECRET`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Copy from your local `.env.local` file - it starts with `WPL_AP1`)

---

**Name:** `LINKEDIN_REDIRECT_URI`
**Value:** ⚠️ **IMPORTANT - Use your custom domain**
```
https://linkedin.questandcrossfire.com/api/auth/linkedin/callback
```

**Alternative (if using temporary Vercel URL):**
```
https://quest-crossfire-linkedin-9r71nnxiv.vercel.app/api/auth/linkedin/callback
```

---

### **3. n8n Webhooks**

**Name:** `N8N_GENERATE_WEBHOOK`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Your n8n webhook URL for post generation)

---

**Name:** `N8N_PUBLISH_WEBHOOK`
**Value:**
```
***GET_FROM_YOUR_.env.local_FILE***
```
(Your n8n webhook URL for publishing)

---

### **4. Security**

**Name:** `JWT_SECRET`
**Value:**
```
***GENERATE_A_RANDOM_SECRET***
```

⚠️ **IMPORTANT:** Generate a secure random string:
```bash
# Run this in terminal to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Then use that output as your JWT_SECRET.

Or copy from your `.env.local` file if you already have one.

---

### **5. Base URL**

**Name:** `NEXT_PUBLIC_BASE_URL`
**Value:** ⚠️ **IMPORTANT - Use your custom domain**
```
https://linkedin.questandcrossfire.com
```

**Alternative (if using temporary Vercel URL):**
```
https://quest-crossfire-linkedin-9r71nnxiv.vercel.app
```

---

## ✅ VERIFICATION

After adding all variables, you should have **10 variables total**:

1. ✅ SUPABASE_URL
2. ✅ SUPABASE_ANON_KEY
3. ✅ SUPABASE_SERVICE_KEY
4. ✅ LINKEDIN_CLIENT_ID
5. ✅ LINKEDIN_CLIENT_SECRET
6. ✅ LINKEDIN_REDIRECT_URI
7. ✅ N8N_GENERATE_WEBHOOK
8. ✅ N8N_PUBLISH_WEBHOOK
9. ✅ JWT_SECRET
10. ✅ NEXT_PUBLIC_BASE_URL

---

## 🔄 AFTER ADDING

1. **Redeploy** - Vercel should automatically redeploy. If not, trigger a manual redeploy.
2. **Wait 1-2 minutes** for build to complete
3. **Test the OAuth flow** at your production URL

---

## 🚨 SECURITY NOTES

**Keep these secret!**
- Never commit these to GitHub
- `.env.local` is in `.gitignore` (safe)
- Only store in Vercel dashboard

**LinkedIn API Credentials:**
- `LINKEDIN_CLIENT_SECRET` is sensitive - treat like a password
- If exposed, regenerate in LinkedIn Developer Console

**Supabase Keys:**
- `SUPABASE_SERVICE_KEY` has admin access - very sensitive
- `SUPABASE_ANON_KEY` is safe to expose (client-side)

**JWT Secret:**
- Used to sign session tokens
- If exposed, all sessions should be invalidated
- Generate a new random one for production

---

## 📞 TROUBLESHOOTING

**Variables not showing in function logs?**
- Make sure "All Environments" was selected when adding
- Try removing and re-adding the variable
- Trigger a manual redeploy

**OAuth still failing?**
- Check `LINKEDIN_REDIRECT_URI` exactly matches LinkedIn Developer App
- Ensure https:// (not http://) for production
- Verify no trailing slashes

**Supabase errors?**
- Check `SUPABASE_URL` has no trailing slash
- Verify keys are copied correctly (they're very long!)
- Check Supabase project is not paused

---

**◇ Small fixes, big clarity.**
