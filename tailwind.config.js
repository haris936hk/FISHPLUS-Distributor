/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Disable preflight to avoid conflicts with Mantine
    preflight: false,
  },
};
