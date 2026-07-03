import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      logoDevToken: '', // NUXT_PUBLIC_LOGO_DEV_TOKEN
    },
  },
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https://img.logo.dev'],
      },
    },
  },
  css: ['./app/assets/css/main.css'],
  fonts: {
    defaults: { weights: [400, 500, 600] },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/a11y',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@unlazy/nuxt',
    'nuxt-security'
  ]
});