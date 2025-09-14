# 🚀 Deployment Guide - Irish Music Chord Display

## 🌟 Recommended: Netlify

### Option A: GitHub Integration (Easiest)

1. **Push to GitHub** (if not already):
   ```bash
   git remote add origin https://github.com/yourusername/irish-music-chord
   git push -u origin master
   ```

2. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com) and sign up
   - Click "New site from Git"
   - Connect to GitHub and select your repository
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

3. **Add Environment Variables**:
   - In Netlify dashboard: Site settings → Environment variables
   - Add:
     ```
     VITE_ALGOLIA_APP_ID=CZJUFK0LPL
     VITE_ALGOLIA_SEARCH_API_KEY=3ab720d7ac1634eb893f4435bef122bf
     VITE_ALGOLIA_INDEX_NAME=irish_music_songs
     ```

### Option B: CLI Deploy (Manual)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir dist
   ```

## 🔄 Vercel Alternative

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

3. **Add Environment Variables**:
   - Vercel dashboard → Project → Settings → Environment Variables

## 💰 GitHub Pages (Free)

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts**:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Access at**: `https://yourusername.github.io/irish-music-chord`

## 🔒 Environment Variables Security

### For Production Deployment:

1. **Never commit .env files**
2. **Use hosting dashboard** to set environment variables
3. **Verify variables** are loaded in production console

### Environment Variable Names:
```bash
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_API_KEY=your_search_only_key
VITE_ALGOLIA_INDEX_NAME=irish_music_songs
```

## 🧪 Pre-Deployment Checklist

- [ ] `npm run build` works locally
- [ ] Environment variables are set in hosting dashboard
- [ ] Algolia credentials are valid
- [ ] App works at http://localhost:3000
- [ ] All songs load and display correctly
- [ ] Migration function works (optional)

## 🌐 Custom Domain (Optional)

### Netlify:
1. Domain settings → Add custom domain
2. Configure DNS: CNAME → your-site.netlify.app

### Vercel:
1. Project settings → Domains
2. Add your domain

## 🔧 Troubleshooting

### Build Fails:
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working:
- Check variable names start with `VITE_`
- Verify in hosting dashboard, not just .env file
- Restart deployment after adding variables

### Algolia Connection Issues:
- Test with debug-algolia.html first
- Verify API keys in Algolia dashboard
- Check index exists

## 📊 Hosting Comparison

| Feature | Netlify | Vercel | GitHub Pages |
|---------|---------|---------|--------------|
| **Free Tier** | 100GB bandwidth | 100GB bandwidth | Unlimited |
| **Custom Domain** | ✅ | ✅ | ✅ |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Environment Variables** | ✅ Dashboard | ✅ Dashboard | ❌ Build only |
| **Git Integration** | ✅ | ✅ | ✅ |
| **Build Speed** | Fast | Fast | Medium |
| **CDN** | Global | Global | GitHub CDN |

## 🎯 Recommendation

**For your Irish Music app**: Use **Netlify** because:
- Perfect Vite integration
- Easy environment variable management
- Great performance for static sites
- Excellent free tier
- Simple GitHub integration

Your app will be live at something like:
`https://irish-music-chord.netlify.app`

🍀 Ready to share with Irish music sessions worldwide! 🎵