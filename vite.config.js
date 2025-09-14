import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Base path for deployment
    base: './',
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['algoliasearch']
          }
        }
      }
    },
    
    // Development server
    server: {
      port: 3000,
      open: true,
      host: true
    },
    
    // Preview server
    preview: {
      port: 4173,
      open: true,
      host: true
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      
      // Algolia configuration from environment
      'import.meta.env.VITE_ALGOLIA_APP_ID': JSON.stringify(env.ALGOLIA_APP_ID || env.VITE_ALGOLIA_APP_ID),
      'import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY': JSON.stringify(env.ALGOLIA_SEARCH_API_KEY || env.VITE_ALGOLIA_SEARCH_API_KEY),
      'import.meta.env.VITE_ALGOLIA_INDEX_NAME': JSON.stringify(env.ALGOLIA_INDEX_NAME || env.VITE_ALGOLIA_INDEX_NAME || 'irish_music_songs')
    },
    
    // CSS configuration
    css: {
      devSourcemap: true
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