# ⚡ Quick Start: Fix LinkedIn Auth in 30 Minutes

**Follow these steps in order. Don't skip any!**

---

## ✅ STEP 1: Set Up Custom Domain (15 min)

### **1.1: Add Domain in Vercel**
1. Go to: https://vercel.com/dashboard
2. Click on: `quest-crossfire-linkedin-app`
3. Go to: **Settings** → **Domains**
4. Click: **Add**
5. Type: `linkedin.questandcrossfire.com`
6. Click: **Add**

### **1.2: Configure DNS**
1. Open Hostinger (or your DNS provider)
2. Go to: DNS settings for `questandcrossfire.com`
3. Add **CNAME Record**:
   - **Type:** CNAME
   - **Name:** linkedin
   - **Value:** cname.vercel-dns.com
   - **TTL:** 3600
4. **Save**
5. **Wait 5-10 minutes** for DNS to propagate

### **1.3: Verify**
- Go back to Vercel → Domains
- You should see a ✅ next to `linkedin.questandcrossfire.com`
- Try visiting: https://linkedin.questandcrossfire.com
- It should show your app!

---

## ✅ STEP 2: Configure Vercel Environment Variables (10 min)

1. Go to: https://vercel.com/dashboard
2. Select: `quest-crossfire-linkedin-app`
3. Go to: **Settings** → **Environment Variables**
4. **Open the file:** `VERCEL-ENV-VARS.md` (in this folder)
5. **Copy each variable** from that file into Vercel
6. **IMPORTANT:** Select **All Environments** for each one
7. Total: **10 variables**

**Critical Variables to Double-Check:**
- `LINKEDIN_REDIRECT_URI` = `https://linkedin.questandcrossfire.com/api/auth/linkedin/callback`
- `NEXT_PUBLIC_BASE_URL` = `https://linkedin.questandcrossfire.com`

---

## ✅ STEP 3: Update LinkedIn Developer App (5 min)

1. Go to: https://www.linkedin.com/developers/apps
2. Select: **Quest And Crossfire LinkedIn AI** (your app)
3. Go to: **Auth** tab
4. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   https://linkedin.questandcrossfire.com/api/auth/linkedin/callback
   ```
5. **Remove** any old `.vercel.app` URLs
6. Click: **Update**

### **Verify Permissions**
While you're here, check **Products** tab:
- ✅ Sign In with LinkedIn using OpenID Connect (OIDC)
- ✅ Share on LinkedIn
- ✅ Advertising API (if available)

**Scopes should include:**
- `openid`
- `profile`
- `email`
- `w_member_social`

---

## ✅ STEP 4: Deploy the Code Fix (2 min)

The OAuth callback redirect has already been fixed. Now deploy it:

```bash
cd D:\Claude\portfolio\apps\quest-crossfire-linkedin-app

git add .

git commit -m "Fix LinkedIn OAuth redirect and add auth documentation"

git push origin main
```

**Wait 1-2 minutes** for Vercel to auto-deploy.

---

## ✅ STEP 5: Test End-to-End (5 min)

### **Production Test:**
1. Open: https://linkedin.questandcrossfire.com
2. Click: **Login with LinkedIn** (if there's a login button)
3. Authorize the app
4. **You should be redirected back to the main app** (not a 404!)
5. Try generating a post
6. Try publishing a post

### **Check Supabase:**
1. Go to: https://app.supabase.com
2. Open: `quest-crossfire-linkedin-ai` project
3. Go to: **Table Editor** → `posts` table
4. You should see your generated post saved!

---

## 🎯 SUCCESS CHECKLIST

After completing all steps, verify:

- [ ] Custom domain `linkedin.questandcrossfire.com` is live
- [ ] Vercel has 10 environment variables configured
- [ ] LinkedIn Developer App has custom domain in redirect URLs
- [ ] Code is committed and pushed to GitHub
- [ ] Vercel deployment succeeded (check dashboard)
- [ ] Can access the app at custom domain
- [ ] Login with LinkedIn works (no redirect errors)
- [ ] After login, see the main app (not 404)
- [ ] Post generation works
- [ ] Posts save to Supabase database
- [ ] Publishing to LinkedIn works

---

## 🚨 IF SOMETHING GOES WRONG

### **"Redirect URI mismatch" error**
→ LinkedIn Developer App redirect URLs don't match. Go back to Step 3.

### **"Unauthorized" or "Missing environment variables"**
→ Vercel env vars not set. Go back to Step 2. Make sure "All Environments" was selected.

### **404 after login**
→ The code fix wasn't deployed. Go back to Step 4.

### **Custom domain not working**
→ DNS hasn't propagated yet. Wait 10-15 more minutes. Check DNS with: https://dnschecker.org

### **"Authentication failed" error**
→ Check Vercel function logs:
1. Go to Vercel dashboard
2. Click: **Deployments**
3. Click: Latest deployment
4. Click: **Functions**
5. Look for errors in `api/auth/linkedin` or `api/auth/linkedin/callback`

---

## 📊 EXPECTED RESULTS

**Before Fix:**
- ❌ OAuth redirect URI mismatch
- ❌ 404 after login
- ❌ "Getting out of the session"
- ❌ Environment variables not loading
- ❌ Auth never works in production

**After Fix:**
- ✅ OAuth works perfectly
- ✅ Redirect to main app after login
- ✅ Sessions persist for 7 days
- ✅ Environment variables load correctly
- ✅ Auth works in both local dev and production

---

## 📖 FULL DOCUMENTATION

For more details, see:
- `LINKEDIN-AUTH-FIX.md` - Complete explanation of problems and solutions
- `VERCEL-ENV-VARS.md` - Exact values for environment variables
- `ARCHITECTURE.md` - Full system architecture
- `CHECKPOINT.md` - Current project status

---

## 🎉 YOU'RE DONE!

Your LinkedIn authentication should now be **fully functional** at:

**https://linkedin.questandcrossfire.com**

---

**◇ Small fixes, big clarity.**

**Time to complete:** ~30 minutes
**Difficulty:** Medium
**Impact:** HIGH - Makes the entire app functional!
