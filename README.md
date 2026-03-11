# Build Calc Pro — Construction Calculator

Free professional construction estimating tool with Google AdSense monetization.

---

## 🚀 Deploy to Vercel (15 minutes)

### 1. Install Node.js (if you haven't)
Download from https://nodejs.org — get the LTS version.

### 2. Test locally first
Open a terminal in this folder and run:
```
npm install
npm run dev
```
Visit http://localhost:5173 — you should see the app running with ad placeholders.

### 3. Push to GitHub
- Go to https://github.com and create a free account
- Click "New Repository" → name it `construction-calculator` → Create
- On your computer, open a terminal in this project folder and run:
```
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/construction-calculator.git
git push -u origin main
```

### 4. Deploy on Vercel
- Go to https://vercel.com and sign in with GitHub
- Click "Add New Project" → Import your `construction-calculator` repo
- Framework preset: **Vite** (auto-detected)
- Click **Deploy** — done in ~60 seconds
- You'll get a live URL like `construction-calculator.vercel.app`

### 5. Custom domain (optional, ~$12/yr)
- Buy a domain at https://namecheap.com (e.g. `buildcalcpro.com`)
- In Vercel → your project → Settings → Domains → Add your domain
- Follow Vercel's DNS instructions (copy 2 records into Namecheap)

---

## 💰 Set Up Google AdSense

### 1. Apply for AdSense
- Go to https://adsense.google.com
- Sign in with a Google account
- Enter your live Vercel URL as your website
- Paste the AdSense verification code snippet into `index.html` (it's already stubbed in)
- Wait for approval (typically 1–2 weeks)

### 2. After approval — update your Publisher ID
Open `src/AdBanner.jsx` and replace:
```
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'
```
With your real Publisher ID from AdSense (looks like `ca-pub-1234567890123456`).

### 3. Create ad units in AdSense
- In AdSense dashboard → Ads → By ad unit → Display ads
- Create two units: "Top Banner" and "Sidebar"
- Copy the slot IDs and update in `AdBanner.jsx`:
```
const AD_SLOTS = {
  banner: '1234567890',   // your top banner slot ID
  sidebar: '0987654321',  // your sidebar slot ID
}
```

### 4. Redeploy
```
git add .
git commit -m "add adsense IDs"
git push
```
Vercel auto-redeploys on every push.

---

## 📱 Ad Placement Summary

| Placement | Format | Shows On |
|-----------|--------|----------|
| Top of page | Leaderboard (728×90 / responsive) | All screens |
| Right rail | Rectangle (160×600) | Desktop only (1200px+) |

---

## 💡 Tips for Maximizing Ad Revenue

- **More calculators = more pages = more traffic.** Add new calc types over time.
- **Target long-tail keywords** in your page title/description: "free concrete calculator", "roof pitch calculator contractor", etc.
- **Submit to Google Search Console** (search.google.com/search-console) to get indexed faster.
- **Share in trade communities** — Facebook contractor groups, Reddit r/Construction, local trade forums.

---

## 🗂 Project Structure

```
construction-calc/
├── index.html          ← AdSense script tag goes here
├── package.json
├── vite.config.js
├── vercel.json
└── src/
    ├── main.jsx        ← React entry point
    ├── App.jsx         ← Layout + ad placement
    ├── AdBanner.jsx    ← Reusable ad component (update IDs here)
    └── Calculator.jsx  ← The full calculator app
```
