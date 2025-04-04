import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        lightTheme: {

          "primary": "#006dff",

          "primary-content": "#000416",

          "secondary": "#00c0ff",

          "secondary-content": "#000e16",

          "accent": "#00af8c",

          "accent-content": "#000b07",

          "neutral": "#0c041a",

          "neutral-content": "#c7c5cc",

          "base-100": "#f9ffff",

          "base-200": "#d9dede",

          "base-300": "#b9bebe",

          "base-content": "#151616",

          "info": "#0094ff",

          "info-content": "#000816",

          "success": "#00f2a2",

          "success-content": "#00140a",

          "warning": "#d65900",

          "warning-content": "#100300",

          "error": "#d42033",

          "error-content": "#fdd8d5",

          body: {
            "background-color": "#e3e6e6"
          }
        },
      },
    ],
  },
} satisfies Config;
