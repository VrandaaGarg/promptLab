import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  environments: {
    client: {
      build: {
        rolldownOptions: {
          // better-auth's client pulls in an unused, frozen ENV accessor object (server env var
          // names only). Marking Object.freeze pure lets the client bundle drop it.
          treeshake: { manualPureFunctions: ['Object.freeze'] },
        },
      },
    },
  },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})
