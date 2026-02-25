import type { ContactInfo, SocialLink, OpeningHoursDay, BusinessInfo, NavigationLink, PageMetadata, RoomData, Page } from '@/libs/types';

export const contact: ContactInfo = {
  phone: "01270618522",
  phoneFormatted: "01270 618 522",
  email: "info@redcownantwich.co.uk",
  address: {
    street: "Red Cow, 51 Beam Street",
    town: "Nantwich",
    postcode: "CW5 5NF",
  },
};

export const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    url: "https://facebook.com/redcownantwich",
    ariaLabel: "Facebook",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/redcownantwich",
    ariaLabel: "Instagram",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/discover/the-red-cow-nantwich",
    ariaLabel: "TikTok",
  },
];

export const businessInfo: BusinessInfo = {
  name: "The Red Cow",
  tagline: "Graze. Gather. Stay",
  shortDescription:
    "The Red Cow is a stunning 16th Century Old coaching inn. We're located in the historic town of Nantwich, where we serve delicious food, great ale, wine & cocktails from our dedicated and passionate team",
  logoText: "The Red Cow",
  reservationsUrl:
    "https://web.dojo.app/create_booking/vendor/_i5WYdjKa2QID8JUwfbYHRllSmUSt-BCNny3N3KVHJg_restaurant",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2397.292096883859!2d-2.5223156841719816!3d53.069025979921875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487af466de17fa59%3A0xf7f6c29e33d95164!2sRed%20Cow!5e0!3m2!1sen!2suk!4v1643299285974!5m2!1sen!2suk",
};

export const openingHours: OpeningHoursDay[] = [
  {
    day: "Monday",
    barHours: "Closed",
    foodHours: "Closed",
  },
  {
    day: "Tue - Thur",
    barHours: "12 noon - 11pm",
    foodHours: "12 noon - 8pm",
  },
  {
    day: "Fri - Sat",
    barHours: "12 noon - Late",
    foodHours: "12 noon - 9pm",
  },
  {
    day: "Sunday",
    barHours: "12 noon - 6pm",
    foodHours: "12 noon - 4pm",
  },
];

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

export const rooms: RoomData[] = [
  {
    name: "Red Angus",
    description:
      "The Red Angus which derives from the black Aberdeen Angus cattle of Scotland, and apart from its coat colour is identical to it. Twin En-suite Room.",
  },
  {
    name: "Limousin",
    description:
      "The Limousin is a French breed of 'Red Cow' from the Limousin and March's regions of France. Double En-Suite Room.",
  },
  {
    name: "Corriente",
    description:
      "The Corriente cattle are a breed of Criollo cattle descended from Spanish cows brought to the Americas as early as 1493. Double En-Suite Room.",
  },
  {
    name: "Ankole-Watusi",
    description:
      "Modern US breed, derived from the Ankole group of Santa cattle breeds (East & Central Africa), characterised by very large horns. Double En-Suite Room.",
  },
  {
    name: "Any",
    description: "No preference",
  },
];

export const contactContent = {
  heading: "Get in touch",
  parkingNote: "Car parking facilities are available next to the restaurant",
  phoneNote: "Our telephones are open inline with our normal opening hours.",
};

export const menuContent = {
  disclaimer: "Our menu changes frequently. Below are sample menus.",
};

export const pages: Page[] = [
  {
    name: 'Home',
    slug: '/',
    title: 'Home | The Red Cow',
    description: 'Welcome to The Red Cow Nantwich - our treasured 15th Century Old Coaching Inn located in the historic town of Nantwich, in the heart of Cheshire.',
    transparentNavigation: true,
    components: [
      {
        type: 'FeatureImage',
        image: 'home-feature-image.jpg',
        title: 'Graze. Gather. Stay',
        links: [
          { text: "View Menu", href: "/menu" },
          { text: "Book Room", href: "/rooms" },
        ]
      },
      {
        type: 'QuoteSection',
        quote: 'Passionate about exceptional food, warm hospitality, and creating a welcoming space for all in the heart of Cheshire.'
      },
      {
        type: 'Separator'
      },
      {
        type: 'TwoImageSection',
        cards: [
          {
            title: "Menu",
            description: "Our kitchen celebrates the best of local produce, crafting a menu that changes with the seasons. Expect freshly prepared dishes, traditional flavours, and a taste of the countryside with every bite.",
            image: 'home-two-image-section-1.jpg',
            imageAlt: "Restaurant menu showcase",
            primaryButton: {
              text: "Book a table",
              href: "https://web.dojo.app/create_booking/vendor/_i5WYdjKa2QID8JUwfbYHRllSmUSt-BCNny3N3KVHJg_restaurant",
            }
          },
          {
            title: "Rooms",
            description: "Make yourself at home in one of our inviting rooms. Whether you're here for a quiet break, a celebration, or simply passing through, our accommodation blends rustic charm with modern comforts for a restful night's sleep.",
            image: 'home-two-image-section-2.jpg',
            imageAlt: "Comfortable guest room",
            secondaryButton: {
              text: "Find out more",
              href: "/rooms",
            }
          }
        ]
      },
      {
        type: 'Separator'
      },
      {
        type: 'AboutSection'
      }
    ]
  },
  {
    name: 'About',
    slug: '/about',
    title: 'About | The Red Cow',
    description: 'Learn more about The Red Cow Nantwich, a historic 15th Century Coaching Inn in the heart of Cheshire. Meet the passionate team behind our exceptional hospitality and cuisine.',
    components: [
      {
        type: 'PageHeading',
        heading: 'About The Red Cow',
        paragraphs: [
          "The Red Cow is a 15th Century Coaching Inn, located in the beautiful historic town of Nantwich in the heart of Cheshire. The wattle and daub walls, beamed ceilings, wood burning stove all contribute to the unique & warm atmosphere of this treasured pub. We have four lovely B&B rooms, and unique function room space.",
          "We, Dax & Suzi Gee, took over the pub in January 2021, with the vision & passion to create a wonderful & welcoming atmosphere for all guests. We take great pride in our exceptional tasting food, using the best produce, served by passionate staff.",
          "We both have a wealth of experience in our beloved hospitality industry. Dax being a very skilled & passionate chef, along with characteristic hosting skills, with Suzi's expertise focused on the customer experience, the service & overall guest satisfaction. We are (hopefully) fondly remembered in the local area for our restaurant, Gee's Kitchen, located in Sandbach from 2011 to 2016.",
          "However over recent years, we've been living in Altrincham, whilst working in various establishments across Manchester City Centre, Altrincham, Lymm & Knutsford. One of Dax's proudest achievements was maintaining a 2AA rosette award in 2018.",
          "We were both born & raised in Nantwich and with our first baby on the way, we felt drawn back to our hometown. Luckily finding the Red Cow available for lease, not so lucky, was being in the mist of a global pandemic. However the pull of this wonderful opportunity to show case our passion for hospitality, exceptional food and creating an excellent atmosphere was too strong to us to dismiss.",
          "We are very fortunate that we have the amazing support of our family, friends & the local community to help on this mission. We have always been incredibly passionate about supporting local businesses & the local community, even before the global pandemic. So expect to see lots of collaborations, promotions, and general love for the local area, events & businesses.",
        ],
        className: 'about-heading'
      }
    ]
  },
  {
    name: 'Menu',
    slug: '/menu',
    title: 'Menu | The Red Cow',
    description: 'Explore the diverse and delicious menus at The Red Cow Nantwich. From hearty pub classics to seasonal specials, our offerings are crafted with fresh, local ingredients to satisfy every palate.',
    components: [
      {
        type: 'PageHeading',
        heading: 'Menus',
        paragraphs: ["We believe great food starts with the freshest ingredients. Our chefs create delicious dishes that celebrate the best of each season, with menus that change regularly to bring you new flavours and the finest produce available. Whether you're joining us for a hearty meal or something lighter, you'll always find something fresh, tasty, and made with care."],
        className: 'menu-heading'
      },
      {
        type: 'MenuImage',
        image: 'menu-image.jpg',
        alt: 'Freshly cooked beef burger with fries and an ice cold beer.'
      },
      {
        type: 'MenuLinks',
        links: [
          { text: 'Lunch Menu', href: '/menus/menu.pdf' },
          { text: 'Evening Menu', href: '/menus/menu.pdf' },
          { text: 'Sunday Menu', href: '/menus/sunday-lunch-menu.pdf' },
          { text: 'Wine Menu', href: '/menus/wine-list.pdf' }
        ]
      }
    ]
  },
  {
    name: 'Contact',
    slug: '/contact',
    title: 'Contact | The Red Cow',
    description: 'Get in touch with us. Find our contact details, location, and opening hours for our beautiful pub.',
    components: [
      {
        type: 'ContactInfo'
      }
    ]
  },
  {
    name: 'Events',
    slug: '/events',
    title: 'Events - Byre Suite | The Red Cow',
    description: 'The Red Cow can host many different events using its Byre events space. Get in touch to find out more.',
    components: [
      {
        type: 'PageHeading',
        heading: 'The Byre Suite',
        paragraphs: ["The Byre Suite is our private and truly unique event space, designed to bring people together in comfort and style. Whether you're hosting an intimate gathering, a milestone celebration, or a professional event, the Byre offers the perfect balance of charm and sophistication. With its warm character, beautiful décor, and inviting atmosphere, it provides a memorable backdrop for any occasion."],
        className: 'events-heading'
      }
    ]
  },
  {
    name: 'Rooms',
    slug: '/rooms',
    title: 'Rooms | The Red Cow',
    description: 'Stay at The Red Cow. Take the weight off your feet and rest up in one our our beautiful B&B rooms.',
    transparentNavigation: true,
    components: [
      {
        type: 'FeatureImage',
        image: 'rooms-feature-image.jpg',
        title: 'Rooms',
        text: 'At The Red Cow'
      },
      {
        type: 'QuoteSection',
        quote: "Four stunning en-suite B&B rooms named &amp; designed around the theme of 'Red Cow' breeds across the world."
      },
      {
        type: 'Separator'
      },
      {
        type: 'TwoImageSection',
        cards: [
          {
            title: "Red Angus",
            description: "The Red Angus which derives from the black Aberdeen Angus cattle of Scotland, and apart from its coat colour is identical to it. Twin En-suite Room.",
            image: 'room-1.jpg',
            imageAlt: "Red Angus Room",
            primaryButton: {
              text: "Book Room",
              href: "/rooms/book"
            }
          },
          {
            title: "Limousin",
            description: "The Limousin is a French breed of 'Red Cow' from the Limousin and March's regions of France. Double En-Suite Room.",
            image: 'room-2.jpg',
            imageAlt: "Limousin Room",
            primaryButton: {
              text: "Book Room",
              href: "/rooms/book"
            }
          }
        ]
      },
      {
        type: 'TwoImageSection',
        cards: [
          {
            title: "Corriente",
            description: "The Corriente cattle are a breed of Criollo cattle descended from Spanish cows brought to the Americas as early as 1493. Double En-Suite Room.",
            image: 'room-3.jpg',
            imageAlt: "Corriente Room",
            primaryButton: {
              text: "Book Room",
              href: "/rooms/book"
            }
          },
          {
            title: "Ankole-Watusi",
            description: "Modern US breed, derived from the Ankole group of Santa cattle breeds (East & Central Africa), characterised by very large horns. Double En-Suite Room.",
            image: 'room-4.jpg',
            imageAlt: "Ankole-Watusi Room",
            primaryButton: {
              text: "Book Room",
              href: "/rooms/book"
            }
          }
        ]
      }
    ],
    children: [
      {
        name: 'Booking',
        slug: '/rooms/book',
        title: "Book a room",
        description: "Complete the form to book a room at The Red Cow Nantwich. Enjoy a comfortable stay in our charming B&B rooms.",
        components: [
          {
            type: 'PageHeading',
            heading: 'Book a room',
            paragraphs: ['Complete the form below to arrange your visit to The Red Cow. <strong>Please note:</strong> Your reservation is not confirmed until you receive a confirmation email. Rooms are subject to availability, and we aim to respond to all enquiries within 24 hours. If your booking is urgent, please contact us directly by phone.'],
            className: 'booking-heading'
          },
          {
            type: 'Separator'
          },
          {
            type: 'BookingForm'
          }
        ]
      }
    ]
  }
];
