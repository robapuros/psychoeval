/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Blues
        b: {
          50: '#E6F1FB',
          100: '#B5D4F4',
          200: '#85B7EB',
          400: '#378ADD',
          600: '#185FA5',
          800: '#0C447C',
          900: '#042C53',
        },
        // Teals
        t: {
          50: '#E1F5EE',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
        },
        // Ambers
        a: {
          50: '#FAEEDA',
          400: '#BA7517',
          600: '#854F0B',
        },
        // Reds
        r: {
          50: '#FCEBEB',
          100: '#F7C1C1',
          400: '#E24B4A',
          600: '#A32D2D',
        },
        // Greens
        g: {
          50: '#EAF3DE',
          600: '#3B6D11',
        },
        // Stone
        s: {
          0: '#F1EFE8',
          100: '#D3D1C7',
          400: '#888780',
          600: '#5F5E5A',
          800: '#444441',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs-upper': ['9px', { letterSpacing: '0.07em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
