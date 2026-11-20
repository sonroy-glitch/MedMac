import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The hero's kiosk photo is the largest paint on the home page, but its URL only
 * appears once the JS has run. A preload in the built HTML lets the browser fetch
 * it in parallel with the scripts (home route only). Mirrors the srcset and sizes in Hero.tsx.
 */
function preloadHeroImage(): Plugin {
  return {
    name: 'preload-hero-image',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const files = Object.keys(ctx.bundle ?? {})
        const small = files.find((f) => /medmac-kiosk-683-[\w-]+\.webp$/.test(f))
        const large = files.find((f) => /medmac-kiosk-[\w-]+\.webp$/.test(f) && f !== small)
        if (!small || !large) return html
        // Only the home page shows the hero, so the preload is added there and nowhere else.
        const attrs = {
          rel: 'preload',
          as: 'image',
          type: 'image/webp',
          fetchPriority: 'high',
          imageSrcset: `/${small} 683w, /${large} 1024w`,
          imageSizes: '(min-width: 768px) min(56vh, 33.4rem), min(42.7vh, 21.4rem)',
        }
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head',
              children: `if(location.pathname==='/')document.head.appendChild(Object.assign(document.createElement('link'),${JSON.stringify(attrs)}))`,
            },
          ],
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadHeroImage()],
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: a copy edit only re-downloads the app chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/](gsap|@gsap)[\\/]/.test(id)) return 'gsap'
          if (/[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]lenis[\\/]/.test(id)) return 'lenis'
        },
      },
    },
  },
})
