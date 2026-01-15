// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@apollo/client', 'graphql'] // 👈 Agrega esto para forzar la inclusión
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // 👈 Ayuda con librerías mixtas como Apollo
    },
  },
})