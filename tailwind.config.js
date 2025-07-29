/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          text: 'var(--color-text)',
          textSecondary: 'var(--color-textSecondary)',
          darkGreen: 'var(--color-darkGreen)',
          lightGreen: 'var(--color-lightGreen)',
          'brand-secondary': 'var(--color-brand-secondary)',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        },
      },
    },
    plugins: [],
  }