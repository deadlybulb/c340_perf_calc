import { VitePWA } from 'vite-plugin-pwa'
import {defineConfig} from "vite";

export default defineConfig({
    base: '/c340_perf_calc/',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['background.svg', 'fonts/JetBrainsMono-Regular.woff2', 'fonts/JetBrainsSans-Regular.woff2'],
            manifest: {
                name: 'C340 Performance',
                short_name: 'C340Perf',
                description: 'C340 performance calculator',
                theme_color: '#000000',
                icons: [
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                workbox: {
                    globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico}'],
                    handler: 'NetworkFirst'
                }
            }
        })
    ]
})
