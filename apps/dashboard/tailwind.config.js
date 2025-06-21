const sharedConfig = require("../../packages/ui/tailwind.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // If dashboard app has its own components
    // Path to UI package components
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Add any app-specific Tailwind theme extensions here for dashboard
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add other plugins if needed for dashboard app specifically
  ],
};
