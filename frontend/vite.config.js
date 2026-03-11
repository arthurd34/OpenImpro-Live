import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
    plugins: [
        react(),
        legacy({
            targets: ['ios_saf 9', 'ie 11'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            modernPolyfills: false,
            renderLegacyChunks: true,
        }),
    ],
    build: {
        target: 'es5',
        minify: 'terser',
        terserOptions: {
            ecma: 5,
            safari10: true,
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        }
    }
})