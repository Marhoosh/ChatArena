import react from '@vitejs/plugin-react'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      tsconfigPaths(),
      react({
        babel: {
          plugins: [jotaiDebugLabel, jotaiReactRefresh],
        },
      }),
    ],
    build: {
      rollupOptions: {
        input: 'index.html',
        external: ['webextension-polyfill'],
      },
      outDir: 'dist',
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    server: {
      strictPort: true,
      port: 5273,
      hmr: {
        clientPort: 5273,
      },
    },
  }
})
