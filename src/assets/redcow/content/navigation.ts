import type { NavigationLink } from '../../types';

export const mainNavigation: NavigationLink[] = [
  { text: "Dine", href: "/menu" },
  { text: "Stay", href: "/rooms" },
  { text: "Events", href: "/events" },
  { text: "Contact", href: "/contact" },
];

export const footerNavigation = {
  about: [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
  ],
  menu: [
    { text: "Lunch", href: "/menus/lunch.pdf" },
    { text: "Evening", href: "/menus/main.pdf" },
    { text: "Sunday Lunch", href: "/menus/sunday.pdf" },
    { text: "Wine List", href: "/menus/wine.pdf" },
  ],
  other: [
    { text: "Rooms", href: "/rooms" },
    { text: "Events", href: "/events" },
    { text: "Contact", href: "/contact" },
  ],
};
