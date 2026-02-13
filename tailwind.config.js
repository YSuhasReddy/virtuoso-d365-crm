module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        d365: {
          primary: '#0078D4',
          primaryDark: '#106EBE',
          primaryLight: '#DEECF9',
          navBg: '#002050',
          headerBg: '#002050',
          surface: '#FFFFFF',
          background: '#F3F2F1',
          border: '#EDEBE9',
          borderStrong: '#C8C6C4',
          text: '#323130',
          textSecondary: '#605E5C',
          success: '#107C10',
          warning: '#FFB900',
          danger: '#D13438',
          info: '#0078D4',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'd365': '0 2px 4px rgba(0, 0, 0, 0.14), 0 0 2px rgba(0, 0, 0, 0.12)',
        'card': '0 1.6px 3.6px rgba(0, 0, 0, 0.132), 0 0.3px 0.9px rgba(0, 0, 0, 0.108)',
        'command': '0 0.6px 1.8px rgba(0, 0, 0, 0.1), 0 3.2px 7.2px rgba(0, 0, 0, 0.13)',
      },
      minHeight: {
        'screen-content': 'calc(100vh - 48px)',
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active'],
    },
  },
  plugins: [],
}
