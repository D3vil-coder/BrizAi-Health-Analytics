/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#000000',
                    secondary: '#111111',
                },
                accent: {
                    primary: '#00ff9d', // Neon Green default
                    secondary: '#0070f3',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#888888',
                }
            },
            boxShadow: {
                neon: '0 0 10px rgba(0, 255, 157, 0.5), 0 0 20px rgba(0, 255, 157, 0.3)',
            }
        },
    },
    plugins: [],
}
