import { fontProviders } from "astro/config";

export const fonts = [
  {
    provider: fontProviders.local(),
    name: "PrimaryFont",
    cssVariable: "--font-primary",
    fallbacks: ["sans-serif"],
    weights: ["400 900"],
    styles: ["normal"],
    options: {
      variants: [
        {
          src: ["./src/assets/whitelabel/fonts/primary.woff2"],
          weight: "400 900",
          style: "normal",
        },
      ],
    },
  },
  {
    provider: fontProviders.local(),
    name: "SecondaryFont",
    cssVariable: "--font-secondary",
    fallbacks: ["serif"],
    weights: ["400 800"],
    styles: ["normal"],
    options: {
      variants: [
        {
          src: ["./src/assets/whitelabel/fonts/secondary.woff2"],
          weight: "400 800",
          style: "normal",
        },
      ],
    },
  },
];
