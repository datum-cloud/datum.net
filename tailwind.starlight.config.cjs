/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',  // 52px - for reduced section padding
        '23': '5.75rem',  // 92px - for reduced section padding
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
