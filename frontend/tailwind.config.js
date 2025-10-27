/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004E2E',      // Verde Guardia Civil (Pantone 341C)
        accent: '#C8102E',       // Rojo (Pantone 485C)
        background: '#F7F9FA',   // Fondo claro neutro
        text: '#1A1A1A',         // Texto oscuro
        alert: '#FFC700',        // Amarillo alerta (Pantone 116C)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}