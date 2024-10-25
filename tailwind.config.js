/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                customGrayDark: '#6A737B',
                customGray: '#6C757D',
                customBlue: '#5372F0',
                customBackground: '#E3F2FD',
            },
        },
    },
    plugins: [],
};
