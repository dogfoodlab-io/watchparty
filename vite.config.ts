import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.TMDB_API_KEY': JSON.stringify(env.TMDB_API_KEY ?? env.VITE_TMDB_API_KEY),
        'process.env.TMDB_ACCESS_TOKEN': JSON.stringify(env.TMDB_ACCESS_TOKEN ?? env.VITE_TMDB_ACCESS_TOKEN),
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL ?? env.VITE_SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
