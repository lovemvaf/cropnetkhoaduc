import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Be Vietnam Pro',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        serif: [
          'Playfair Display',
          'Merriweather',
          'Georgia',
          'serif'
        ]
      },
      colors: {
        canvas: '#FAF9F5',
        surface: '#FFFFFF',
        forest: {
          50: '#F4F6F3',
          100: '#E6EAE4',
          200: '#C7D1C3',
          300: '#9FB199',
          400: '#5F7C58',
          500: '#2C4939', // Deep Forest Primary
          600: '#233C2F', // Forest Hover
          700: '#1B2F25',
          800: '#14231C',
          900: '#0E1712',
          DEFAULT: '#2C4939'
        },
        ink: {
          DEFAULT: '#253129', // Primary Dark Ink
          muted: '#647067',   // Secondary Text
          light: '#8C978F',   // Caption/Muted
          faint: '#B4BCB5'
        },
        olive: {
          50: '#F7F8F5',
          100: '#ECEEE7',
          500: '#7B876C',     // Muted Olive
          600: '#68735A',
          DEFAULT: '#7B876C'
        },
        clay: {
          50: '#FAF5F1',
          100: '#F3E8DF',
          500: '#A46C49',     // Warm Clay Accent
          600: '#8C5B3D',
          DEFAULT: '#A46C49'
        },
        warm: {
          50: '#FCFBF9',
          100: '#F7F6F2',
          200: '#F1EFE8',     // Warm Neutral Surface
          300: '#E7E4DC',
          DEFAULT: '#F1EFE8'
        },
        border: {
          DEFAULT: '#E2E5DC',
          subtle: '#ECEEE8',
          dark: '#CBD0C4'
        },
        primary: {
          50: '#F4F6F3',
          100: '#E6EAE4',
          200: '#C7D1C3',
          500: '#2C4939',
          600: '#233C2F',
          700: '#1B2F25'
        }
      },
      borderRadius: {
        'control': '8px',
        'card': '12px',
        'container': '16px'
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(37, 49, 41, 0.04)',
        'card': '0 2px 6px -1px rgba(37, 49, 41, 0.05)',
        'card-hover': '0 4px 12px -2px rgba(37, 49, 41, 0.08)',
        'modal': '0 12px 32px -4px rgba(37, 49, 41, 0.12)'
      }
    },
  },
  plugins: [],
};
export default config;
