/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          dark: '#232f3e',
          darker: '#131921',
          teal: '#007185',
          lightTeal: '#00a8d6',
          yellow: '#FFD814',
          yellowHover: '#f7df66',
          yellowBorder: '#F7CA00',

          bg: '#F1F3F3',
          border: '#d5d9d9',
          text: '#0f1111',
          secondaryText: '#565959',
          link: '#007185',
          orange: '#e47911',
          error: '#ba0000',
          success: '#007600',

          // ✅ 关键：MainLayout 用到的颜色 token
          headerTeal: '#002F36',
          searchInput: '#0B6A70',
          searchBtn: '#004B55',
          subHeaderDark: '#002F36',
          hoverRow: '#205488ff',
        }
      },
      fontSize: {
        'xs-amz': '12px',
        'sm-amz': '13px',
        'base-amz': '14px',
        'lg-amz': '17px',
        'xl-amz': '21px'
      },
      boxShadow: {
        'amz-card': '0 1px 3px 0 rgba(0,0,0,0.1)',
        'amz-button': '0 2px 5px 0 rgba(213,217,217,.5)'
      }
    },
  },
  plugins: [],
}
