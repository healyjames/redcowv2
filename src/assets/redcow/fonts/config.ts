import { fontProviders } from "astro/config";

export const fonts = [
  {
    provider: fontProviders.local(),
    name: "PrimaryFont",
    cssVariable: "--font-primary",
    fallbacks: ["serif"],
    weights: ["400 700"],
    styles: ["normal"],
    options: {
      variants: [
        {
          src: ["./src/assets/redcow/fonts/primary.woff2"],
          weight: "400 700",
          style: "normal",
        },
      ],
    },
  },
  {
    provider: fontProviders.local(),
    name: "SecondaryFont",
    cssVariable: "--font-secondary",
    fallbacks: ["sans-serif"],
    weights: ["400 900"],
    styles: ["normal"],
    options: {
      variants: [
        {
          src: ["./src/assets/redcow/fonts/secondary.woff2"],
          weight: "400 900",
          style: "normal",
        },
      ],
    },
  },
];
