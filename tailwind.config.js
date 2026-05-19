/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [process.env.NODE_ENV !== "test" ? require("nativewind/preset") : null].filter(Boolean),
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#0D7B74",
          mid: "#15A099",
          light: "#E8F5F4",
          glow: "rgba(13,123,116,0.18)",
        },
        ink: {
          DEFAULT: "#111B1A",
          soft: "#3A4E4D",
        },
        muted: "#7A9190",
        line: "#E2EDED",
        surface: "#F8FBFB",
        gold: {
          DEFAULT: "#BF9A3F",
          bg: "#FDF7E8",
        },
        danger: "#D94F4F",
      },
      fontFamily: {
        outfit: ["Outfit"],
        cormorant: ["Cormorant Garamond"],
      },
    },
  },
  plugins: [],
};
