/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      'sans': ["Roboto", "Segoe UI", "Segoe" , "SegoeUI-Regular-final", 'Tahoma', 'Helvetica', 'Arial'],
      'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      'oswald': ['oswald', 'sans-serif'],
    },
    extend: {

    },
  },
  plugins: [],
}
