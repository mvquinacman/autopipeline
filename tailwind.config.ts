import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F3',
        card: '#FFFFFF',
        line: '#E1E5EA',
        wash: '#EDF0F3',
        ink: '#0F1826',
        sub: '#5B6472',
        cobalt: '#1E4FD6',
        'cobalt-press': '#1740B0',
        'cobalt-tint': '#E8EDFB',
        due: '#E8A013',
        overdue: '#D64545',
        won: '#189A5A',
        lost: '#8A93A3',
        stage: {
          new: '#8A93A3',
          contacted: '#2E7BD6',
          showroom: '#1E4FD6',
          testdrive: '#0E7490',
          application: '#E8A013',
          approved: '#189A5A',
          released: '#0F1826',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
        control: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
