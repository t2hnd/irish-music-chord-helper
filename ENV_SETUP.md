# Environment Variables Setup Guide

This guide explains how to configure Algolia credentials using environment variables for enhanced security.

## Quick Start

1. **Copy the template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your values**:
   ```bash
   ALGOLIA_APP_ID=your_actual_app_id
   ALGOLIA_SEARCH_API_KEY=your_actual_search_key
   ALGOLIA_INDEX_NAME=irish_music_songs
   ```

3. **The app will automatically load these values** when you open it

## Configuration Methods

The app supports multiple ways to provide environment variables, in order of preference:

### Method 1: Build-Time Injection (Recommended for Production)

For build tools like Webpack, Vite, or Parcel:

```javascript
// Build process injects variables into window.env
window.env = {
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME
};
```

### Method 2: HTML Meta Tags

Add to your HTML `<head>`:

```html
<meta name="algolia-app-id" content="your_app_id">
<meta name="algolia-search-api-key" content="your_search_key">
<meta name="algolia-index-name" content="irish_music_songs">
```

### Method 3: Global Window Object

Set in a script before loading the app:

```html
<script>
window.algoliaConfig = {
    ALGOLIA_APP_ID: 'your_app_id',
    ALGOLIA_SEARCH_API_KEY: 'your_search_key',
    ALGOLIA_INDEX_NAME: 'irish_music_songs'
};
</script>
```

### Method 4: localStorage (Development Only)

For development, you can store config in localStorage:

```javascript
// In browser console or development script
localStorage.setItem('algolia_config', JSON.stringify({
    ALGOLIA_APP_ID: 'your_app_id',
    ALGOLIA_SEARCH_API_KEY: 'your_search_key',
    ALGOLIA_INDEX_NAME: 'irish_music_songs'
}));
```

## Deployment Scenarios

### Static Hosting (GitHub Pages, Netlify, Vercel)

**Option A: Build-time replacement**
```javascript
// Use build tools to replace placeholders
const config = {
    appId: '{{ALGOLIA_APP_ID}}',  // Replaced at build time
    apiKey: '{{ALGOLIA_SEARCH_API_KEY}}'
};
```

**Option B: Environment variable injection**
```bash
# Netlify/Vercel environment variables
ALGOLIA_APP_ID=your_app_id
ALGOLIA_SEARCH_API_KEY=your_search_key
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
# Environment variables passed at runtime
ENV ALGOLIA_APP_ID=""
ENV ALGOLIA_SEARCH_API_KEY=""
```

```yaml
# docker-compose.yml
services:
  irish-music-app:
    build: .
    environment:
      - ALGOLIA_APP_ID=your_app_id
      - ALGOLIA_SEARCH_API_KEY=your_search_key
```

### Node.js Server Integration

```javascript
// server.js - serve with environment injection
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    const html = fs.readFileSync('irish_music_app.html', 'utf8');
    const injected = html.replace(
        '<script src="env-loader.js"></script>',
        `<script>
            window.algoliaConfig = {
                ALGOLIA_APP_ID: '${process.env.ALGOLIA_APP_ID}',
                ALGOLIA_SEARCH_API_KEY: '${process.env.ALGOLIA_SEARCH_API_KEY}'
            };
        </script>
        <script src="env-loader.js"></script>`
    );
    res.send(injected);
});
```

## Build Tool Integration

### Vite Configuration

```javascript
// vite.config.js
export default {
    define: {
        'window.env': {
            ALGOLIA_APP_ID: JSON.stringify(process.env.ALGOLIA_APP_ID),
            ALGOLIA_SEARCH_API_KEY: JSON.stringify(process.env.ALGOLIA_SEARCH_API_KEY)
        }
    }
}
```

### Webpack Configuration

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            'window.env': {
                ALGOLIA_APP_ID: JSON.stringify(process.env.ALGOLIA_APP_ID),
                ALGOLIA_SEARCH_API_KEY: JSON.stringify(process.env.ALGOLIA_SEARCH_API_KEY)
            }
        })
    ]
};
```

### Parcel Integration

```json
// package.json
{
  "scripts": {
    "build": "parcel build irish_music_app.html --public-url ./"
  }
}
```

Parcel automatically injects `process.env` variables prefixed with `PARCEL_`.

## Security Best Practices

### ✅ DO:
- Use environment variables for all API keys
- Keep `.env` files out of version control
- Use different keys for different environments
- Set up API key restrictions in Algolia dashboard
- Use build-time injection for production

### ❌ DON'T:
- Commit `.env` files to git
- Put Admin API keys in environment variables
- Use production keys in development
- Store sensitive keys in localStorage permanently
- Use URL parameters for credentials (except testing)

## Troubleshooting

### Environment Variables Not Loading

1. **Check browser console** for environment loader messages
2. **Verify file locations** - ensure `env-loader.js` is accessible
3. **Check build process** - ensure environment variables are injected
4. **Test manually**:
   ```javascript
   // In browser console
   console.log(window.algoliaConfig);
   ```

### Common Issues

**"No environment config found"**
- Check that `.env` file exists and contains values
- Verify your build process is injecting variables
- Try manual configuration with `window.algoliaConfig`

**"Missing Algolia configuration"**
- Ensure `ALGOLIA_APP_ID` and `ALGOLIA_SEARCH_API_KEY` are set
- Check that values are not placeholder text
- Verify API keys are correct in Algolia dashboard

### Debugging Environment Loading

Add this to browser console to check all config sources:

```javascript
// Check all configuration sources
console.log('Process env:', typeof process !== 'undefined' ? process.env : 'Not available');
console.log('Window env:', window.env);
console.log('Window algoliaConfig:', window.algoliaConfig);
console.log('localStorage config:', localStorage.getItem('algolia_config'));

// Check final configuration
console.log('Final algolia config:', algoliaService?.config);
```

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ALGOLIA_APP_ID` | Yes | Your Algolia application ID | `ABC123XYZ` |
| `ALGOLIA_SEARCH_API_KEY` | Yes | Search-only API key | `1234567890abcdef` |
| `ALGOLIA_INDEX_NAME` | No | Index name (defaults to 'irish_music_songs') | `my_songs_index` |

## Next Steps

1. Set up your preferred configuration method
2. Test with a simple search operation  
3. Run the migration with your admin key
4. Set up monitoring and alerts for API usage
5. Configure API key restrictions in Algolia dashboard

For more details on Algolia setup, see [ALGOLIA_SETUP.md](./ALGOLIA_SETUP.md).