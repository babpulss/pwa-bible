/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        ui: ['"Noto Sans KR"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', '"Segoe UI"', 'sans-serif'],
        heading: ['"Noto Serif KR"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', 'serif'],
        reading: ['"Noto Serif KR"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', 'serif']
      },
      boxShadow: {
        card: '0 18px 40px rgba(15,23,42,0.08)'
      }
    }
  },
  plugins: []
}
