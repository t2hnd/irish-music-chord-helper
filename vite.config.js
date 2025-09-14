import { defineConfig, loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Base path for deployment (adjust for your hosting)
    base: '/',
    
    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate source maps for production debugging
      sourcemap: true,
      
      // Minify code
      minify: 'terser',
      
      // Target browsers
      target: 'es2015',
      
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ['algoliasearch'],
            utils: ['src/utils/index.js']
          }
        }
      },
      
      // Asset handling
      assetsDir: 'assets',
      
      // Emit assets for legacy browsers
      cssCodeSplit: true
    },
    
    // Development server configuration
    server: {
      port: 3000,
      open: true,
      host: true, // Allow external connections
      cors: true
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
      host: true
    },
    
    // Environment variables
    define: {
      // Make environment variables available in the browser
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      
      // Algolia configuration from environment
      'import.meta.env.VITE_ALGOLIA_APP_ID': JSON.stringify(env.ALGOLIA_APP_ID || env.VITE_ALGOLIA_APP_ID),
      'import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY': JSON.stringify(env.ALGOLIA_SEARCH_API_KEY || env.VITE_ALGOLIA_SEARCH_API_KEY),
      'import.meta.env.VITE_ALGOLIA_INDEX_NAME': JSON.stringify(env.ALGOLIA_INDEX_NAME || env.VITE_ALGOLIA_INDEX_NAME || 'irish_music_songs')
    },
    
    // Plugins
    plugins: [
      // Legacy browser support
      legacy({
        targets: ['defaults', 'not IE 11']
      })
    ],
    
    // CSS configuration
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        // Add global CSS variables if needed
      }
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@services': '/src/services',
        '@styles': '/src/styles',
        '@utils': '/src/utils'
      }
    },
    
    // Optimization
    optimizeDeps: {
      include: ['algoliasearch']
    },
    
    // Public directory
    publicDir: 'public',
    
    // Environment file configuration
    envDir: '.',
    envPrefix: ['VITE_', 'ALGOLIA_']
  };
});