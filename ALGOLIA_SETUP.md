# Algolia Setup Guide for Irish Music Chord Display

This guide will help you set up Algolia integration for the Irish Music Chord Display application.

## Prerequisites

1. Create a free Algolia account at [algolia.com](https://www.algolia.com/)
2. Create a new application in your Algolia dashboard

## Setup Steps

### 1. Get Your Algolia Credentials

From your Algolia dashboard:
- **Application ID**: Found in your app overview
- **Search-Only API Key**: Found in API Keys section (use this for frontend)
- **Admin API Key**: Found in API Keys section (⚠️ **NEVER put this in code files** - only enter when prompted)

### 2. Configure the Application

**Option A: Environment Variables (Recommended)**

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   ALGOLIA_APP_ID=your_app_id_here
   ALGOLIA_SEARCH_API_KEY=your_search_only_api_key_here
   ALGOLIA_INDEX_NAME=irish_music_songs
   ```

3. The app will automatically load these values securely.

**Option B: Direct Code Configuration**

Edit `algolia-config.js` and replace the placeholder values:

```javascript
this.config = {
    appId: 'YOUR_APP_ID',           // Replace with your App ID
    apiKey: 'YOUR_SEARCH_API_KEY',  // Replace with your Search-Only API Key (NOT Admin Key!)
    indexName: 'irish_music_songs'  // You can change this index name if desired
};
```

⚠️ **SECURITY NOTES**: 
- **Environment variables are preferred** for better security
- Only put your **Search-Only API Key** in code/env files  
- The Admin API Key should NEVER be stored and will be requested securely when needed
- See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable configuration

### 3. Create the Algolia Index

The index will be created automatically when you run the migration, but you can also create it manually in the Algolia dashboard.

### 4. Run the Migration

1. Open `irish_music_app.html` in your browser
2. Click the "データ編集" (Data Editor) button
3. You should see a new "Algolia移行" (Algolia Migration) button
4. Click it to start the migration process
5. **You will be prompted to enter your Admin API Key** - this is secure and temporary
6. The migration will proceed automatically and clean up the admin key afterward

## Data Schema

Each song in Algolia has the following structure:

```javascript
{
  objectID: "song-slug",           // Auto-generated unique ID
  title: "Song Name",              // Song title
  key: "G",                        // Musical key
  time: "4/4",                     // Time signature
  type: "Jig",                     // Music type
  chords: { ... },                 // Chord progressions by section
  hidden: false,                   // Hide from main dropdown
  dateCreated: 1234567890,         // Creation timestamp
  dateModified: 1234567890,        // Last modified timestamp
  popularity: 0,                   // Usage counter
  searchableText: "..."            // Combined searchable content
}
```

## Features

### Online Mode (Connected to Algolia)
- Real-time data synchronization
- Cloud backup of your songs
- Fast search capabilities
- Cross-device access

### Offline Mode (Fallback)
- Automatic fallback when Algolia is unavailable
- Local storage caching
- Full CRUD operations still work
- Data syncs when connection is restored

### Connection Status Indicators

The app shows your connection status in the header title:
- 🟢 Connected to Algolia
- 🟡 Offline mode (using cache)
- 🔴 No data connection

## Migration Process

The migration script will:

1. ✅ Initialize connection to Algolia
2. ✅ Convert existing music-data.js format to Algolia format
3. ✅ Validate all song data
4. ✅ Batch upload songs to Algolia
5. ✅ Test the migration with sample searches
6. ✅ Provide detailed migration log

## Troubleshooting

### Common Issues

**"Algolia connection failed"**
- Check your App ID and API Key are correct
- Ensure you're using the Search-Only API Key (not Admin key)
- Check your internet connection

**"No songs found after migration"**
- Verify the index name matches in your Algolia dashboard
- Check the migration log for errors
- Try running the migration again

**Search not working**
- Make sure you're using the correct API key
- Check browser console for JavaScript errors

### Getting Help

1. Check browser console for detailed error messages
2. Download migration log for debugging
3. Verify your Algolia dashboard shows the uploaded data

## 🔒 Security Notes

### API Key Security
- ✅ **Search-Only API Key**: Safe to put in code files, only allows reading data
- ❌ **Admin API Key**: NEVER put in code files, only enter when prompted by secure modals
- 🧹 **Auto-Cleanup**: Admin keys are automatically cleaned from memory after each operation
- 🔒 **Temporary Usage**: Admin keys are only held temporarily for write operations

### Write Operations Security
When you save/edit/delete songs:
1. The app first tries with the search-only key (will fail for writes)
2. A secure modal appears requesting your Admin API Key
3. The operation completes with admin permissions  
4. The admin key is immediately discarded for security

### Best Practices
- Set up API key restrictions in your Algolia dashboard
- Consider IP restrictions for admin keys in production
- Monitor API usage in Algolia analytics
- Regularly rotate your API keys

### For Production Use
- Consider implementing server-side API proxy
- Use environment variables for sensitive keys
- Implement proper authentication and authorization
- Set up monitoring and alerting

## Advanced Configuration

### Search Settings
You can customize search behavior in your Algolia dashboard:
- Searchable attributes: title, key, type, searchableText
- Facet filters: type, key, time, hidden
- Ranking criteria: popularity, dateModified

### Index Settings
Recommended settings in Algolia dashboard:
- **Searchable Attributes**: title, key, type, searchableText
- **Attributes for Faceting**: type, key, time, hidden
- **Custom Ranking**: desc(popularity), desc(dateModified)

## Next Steps

After successful migration:
1. Test all CRUD operations (Create, Read, Update, Delete)
2. Verify hidden songs functionality
3. Test offline mode by disconnecting internet
4. Consider setting up search analytics in Algolia dashboard

The application will work seamlessly with both online and offline modes, providing a robust music management experience for Irish session musicians.