import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/presentation/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        // Mobile menu animations
        'in': 'fadeInSlideDown 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fadeInSlideDown': {
          '0%': {
            'opacity': '0',
            'transform': 'translateY(-10px)',
          },
          '100%': {
            'opacity': '1',
            'transform': 'translateY(0)',
          },
        },
        'fadeIn': {
          '0%': { 'opacity': '0' },
          '100%': { 'opacity': '1' },
        },
        'spin': {
          'to': { 'transform': 'rotate(360deg)' },
        },
        'bounce': {
          '0%, 100%': {
            'transform': 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0.8,0,1,1)',
          },
          '50%': {
            'transform': 'translateY(-25%)',
            'animation-timing-function': 'cubic-bezier(0,0,0.2,1)',
          },
        },
        'pulse': {
          '0%, 100%': { 'opacity': '1' },
          '50%': { 'opacity': '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

