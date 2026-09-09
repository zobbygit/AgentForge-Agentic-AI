/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: { 50:'#eef0ff', 100:'#dce0ff', 500:'#6366f1', 600:'#4f46e5', 900:'#050A18', 950:'#030711' },
        forge: { 400:'#22d3ee', 500:'#06b6d4', 600:'#0891b2' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'], display: ['"Space Grotesk"','Inter','sans-serif'] },
      animation: { 'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite', 'gradient':'gradient 6s ease infinite', 'float':'float 6s ease-in-out infinite', 'glow':'glow 2s ease-in-out infinite alternate' },
      keyframes: {
        gradient:{'0%,100%':{'background-position':'0% 50%'},'50%':{'background-position':'100% 50%'}},
        float:{'0%,100%':{'transform':'translateY(0px)'},'50%':{'transform':'translateY(-20px)'}},
        glow:{'from':{'box-shadow':'0 0 20px #6366f140'},'to':{'box-shadow':'0 0 40px #6366f180'}},
      },
      backgroundImage: { 'grid-pattern':"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }
    }
  },
  plugins: []
};
