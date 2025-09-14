# 🍀 Irish Session Chord Display 🎵

An interactive web application for displaying chord progressions of Irish traditional music, designed for musicians during Irish music sessions.

## ✨ Features

- 🎼 **Interactive Chord Display**: View chord progressions with measure separators
- 🔄 **Auto-Scroll**: Hands-free scrolling during performances
- ✏️ **Song Editor**: Create, edit, and manage song database
- ☁️ **Cloud Sync**: Optional Algolia integration for cross-device access
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚫 **Hide Songs**: Option to hide songs from selection dropdown
- 📤 **Data Export**: Download your song database
- 🌐 **Offline Support**: Works without internet connection

## 🚀 Quick Start

### Option 1: Modern Development Setup (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd irish-music-chord
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your Algolia credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

### Option 2: Simple File Hosting

1. Download the built files from `/dist` folder
2. Serve with any web server or open `index.html` directly
3. No build process required for basic usage

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## ⚙️ Configuration

### Environment Variables

The app supports multiple ways to provide configuration:

#### Method 1: Environment Files (.env)
```bash
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_API_KEY=your_search_key
VITE_ALGOLIA_INDEX_NAME=irish_songs
```

#### Method 2: Build-time Injection
```javascript
// Automatically handled by Vite
import.meta.env.VITE_ALGOLIA_APP_ID
```

#### Method 3: Runtime Configuration
For deployments where environment variables aren't available, the app will work with local storage fallback.

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration options.

### Algolia Setup

1. Create free account at [algolia.com](https://www.algolia.com)
2. Get your App ID and Search-Only API Key
3. Configure environment variables
4. Use migration tool to upload existing songs

See [ALGOLIA_SETUP.md](./ALGOLIA_SETUP.md) for complete setup guide.

## 🏗️ Architecture

### Modern Stack
- ⚡ **Vite**: Fast build tool and dev server
- 📦 **ES Modules**: Modern JavaScript modules
- 🎨 **CSS**: Pure CSS with modern features
- 🔍 **Algolia**: Search and database backend
- 📱 **Responsive**: Mobile-first design

### Project Structure
```
irish-music-chord/
├── src/
│   ├── components/     # UI components
│   ├── services/       # API and data services  
│   ├── styles/         # CSS styles
│   ├── utils/          # Utility functions
│   └── main.js         # Application entry point
├── public/             # Static assets
├── dist/               # Built files
└── docs/               # Documentation
```

## 🎵 Using the Application

### Adding Songs
1. Select a song from the dropdown
2. Click "曲を追加" (Add Song)
3. Multiple songs stack vertically for session use

### Auto-Scroll
1. Click "自動スクロール開始" to start hands-free scrolling
2. Adjust speed with the slider (1-10)
3. Automatically stops at page bottom

### Song Editor
1. Click "データ編集" to open the editor
2. Create new songs or edit existing ones
3. Add multiple chord sections (A Part, B Part, etc.)
4. Use `|` to separate measures in chord progressions
5. Hide songs from main dropdown with checkbox

### Migration to Algolia
1. Set up Algolia account and get API keys
2. Configure environment variables
3. Click "Algolia移行" in the editor
4. Enter Admin API Key when prompted (used once, then discarded)

## 🎼 Song Format

Songs use this structure:
```javascript
{
  title: "Song Name",
  key: "G",
  time: "4/4", 
  type: "Jig",
  chords: {
    "A Part": "G | C | D | G",
    "B Part": "Em | Am | D | G"
  },
  hidden: false  // Optional: hide from dropdown
}
```

Chord progressions support:
- Multiple sections (A Part, B Part, Verse, Chorus, etc.)
- Measure separators with `|`
- Multiple chords per measure: `G C | D Em`
- Complex progressions: `G | C G | Am D | G`

## 🔒 Security

- **Search-Only API Keys**: Safe for frontend use
- **Admin API Keys**: Only requested when needed, immediately discarded
- **Environment Variables**: Secure configuration management
- **No Secrets in Code**: All sensitive data handled at runtime

## 🌐 Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)
```bash
npm run build
# Deploy /dist folder
```

### Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
```

### Node.js Server
```javascript
import express from 'express';
const app = express();
app.use(express.static('dist'));
```

See [ENV_SETUP.md](./ENV_SETUP.md) for deployment-specific environment variable configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your Irish music sessions!

## 🎯 Irish Music Types Supported

- **Jigs** (6/8, 9/8)
- **Reels** (4/4)
- **Hornpipes** (4/4)
- **Polkas** (2/4)
- **Airs** (various)
- **Ballads** (4/4)
- **Slip Jigs** (9/8)
- **Songs** (various)

## 🔧 Development

The app is built with modern web standards:
- ES6+ modules
- CSS custom properties
- Flexbox/Grid layouts  
- Responsive design
- Progressive enhancement

No heavy frameworks - just clean, fast, modern web development.

---

🍀 **Sláinte!** Enjoy your Irish music sessions! 🎵