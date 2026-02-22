import type { ContactInfo, SocialLink, OpeningHoursDay, BusinessInfo, NavigationLink, PageMetadata, RoomData, Page } from '@/libs/types';

export const contact: ContactInfo = {
  phone: "01234567890",
  phoneFormatted: "01234 567 890",
  email: "info@whitelabel.com",
  address: {
    street: "123 Sample Street",
    town: "Brandville",
    postcode: "AB12 3CD",
  },
};

export const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    url: "https://facebook.com/whitelabel",
    ariaLabel: "Facebook",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/whitelabel",
    ariaLabel: "Instagram",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@whitelabel",
    ariaLabel: "TikTok",
  },
];

export const businessInfo: BusinessInfo = {
  name: "My Brand",
  tagline: "Experience. Explore. Enjoy",
  shortDescription:
    "My Brand is a modern establishment offering exceptional service and unforgettable experiences. Located in the heart of Brandville, we pride ourselves on quality and attention to detail.",
  logoText: "My Brand",
  reservationsUrl:
    "https://example.com/booking",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2397.292096883859!2d-2.5223156841719816!3d53.069025979921875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487af466de17fa59%3A0xf7f6c29e33d95164!2sSample%20Location!5e0!3m2!1sen!2suk!4v1643299285974!5m2!1sen!2suk",
};

export const openingHours: OpeningHoursDay[] = [
  {
    day: "Monday",
    barHours: "10am - 10pm",
    foodHours: "12pm - 9pm",
  },
  {
    day: "Tue - Thur",
    barHours: "10am - 11pm",
    foodHours: "12pm - 9pm",
  },
  {
    day: "Fri - Sat",
    barHours: "10am - Late",
    foodHours: "12pm - 10pm",
  },
  {
    day: "Sunday",
    barHours: "11am - 8pm",
    foodHours: "12pm - 6pm",
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
    { text: "Main Menu", href: "/menus/main-menu.pdf" },
  ],
  other: [
    { text: "Rooms", href: "/rooms" },
    { text: "Events", href: "/events" },
    { text: "Contact", href: "/contact" },
  ],
};

export const rooms: RoomData[] = [
  {
    name: "Sunset Suite",
    description:
      "A spacious suite with panoramic views. Perfect for couples seeking relaxation. King-size En-suite Room.",
  },
  {
    name: "Garden Room",
    description:
      "Overlooking our beautiful gardens, this room offers tranquility and comfort. Double En-Suite Room.",
  },
  {
    name: "Urban Loft",
    description:
      "Modern design meets classic comfort in this stylish loft space. Twin En-Suite Room.",
  },
  {
    name: "Heritage Chamber",
    description:
      "Experience traditional elegance with contemporary amenities in our heritage room. Double En-Suite Room.",
  },
  {
    name: "Any",
    description: "No preference",
  },
];

export const contactContent = {
  heading: "Get in touch",
  parkingNote: "Parking facilities are available on-site",
  phoneNote: "Our phone lines are open during business hours.",
};

export const menuContent = {
  disclaimer: "Our menu is updated seasonally. Sample menu available below.",
};

export const pages: Page[] = [
  {
    name: 'Home',
    slug: '/',
    title: 'Home | My Brand',
    description: 'Welcome to My Brand - your destination for exceptional experiences and unforgettable moments in Brandville.',
    transparentNavigation: true,
    components: [
      {
        type: 'FeatureImage',
        image: 'home-feature-image.jpg',
        title: 'Experience. Explore. Enjoy',
        links: [
          { text: "View Menu", href: "/menu" },
          { text: "Book Room", href: "/rooms" },
        ]
      },
      {
        type: 'QuoteSection',
        quote: 'Dedicated to providing exceptional service and creating memorable experiences for all our guests.'
      },
      {
        type: 'Separator'
      },
      {
        type: 'TwoImageSection',
        cards: [
          {
            title: "Menu",
            description: "Our culinary team creates innovative dishes using premium ingredients. Experience a fusion of flavors that will delight your senses.",
            image: 'home-two-image-section-1.jpg',
            imageAlt: "Culinary excellence",
            primaryButton: {
              text: "Book a table",
              href: "https://example.com/booking",
            }
          },
          {
            title: "Rooms",
            description: "Relax in our thoughtfully designed rooms that combine modern amenities with timeless style. Your comfort is our priority.",
            image: 'home-two-image-section-2.jpg',
            imageAlt: "Luxury accommodation",
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
    title: 'About | My Brand',
    description: 'Learn more about My Brand and the passionate team dedicated to delivering exceptional experiences.',
    components: [
      {
        type: 'PageHeading',
        heading: 'About My Brand',
        paragraphs: [
          "My Brand is a contemporary establishment located in the vibrant town of Brandville. We combine modern design with traditional hospitality values to create a welcoming environment for all our guests.",
          "Founded with a vision to redefine hospitality, we focus on attention to detail, quality service, and creating memorable experiences. Our team is passionate about what we do and it shows in every interaction.",
          "From our carefully curated menu to our comfortable accommodations, every aspect of My Brand has been designed with our guests in mind. We believe in creating spaces where people can connect, celebrate, and create lasting memories.",
          "Our commitment to excellence extends beyond our walls. We actively support local initiatives and believe in being a positive force in our community. When you choose My Brand, you're choosing a business that cares.",
        ],
        className: 'about-heading'
      }
    ]
  },
  {
    name: 'Menu',
    slug: '/menu',
    title: 'Menu | My Brand',
    description: 'Explore our carefully crafted menu featuring seasonal ingredients and innovative dishes.',
    components: [
      {
        type: 'PageHeading',
        heading: 'Menus',
        paragraphs: ["We believe in using the finest ingredients to create dishes that surprise and delight. Our menu evolves with the seasons, ensuring freshness and variety throughout the year."],
        className: 'menu-heading'
      },
      {
        type: 'MenuImage',
        image: 'menu-image.jpg',
        alt: 'Delicious culinary creations'
      },
      {
        type: 'MenuLinks',
        links: [
          { text: 'Main Menu', href: '/menus/main-menu.pdf' },
        ]
      }
    ]
  },
  {
    name: 'Contact',
    slug: '/contact',
    title: 'Contact | My Brand',
    description: 'Get in touch with My Brand. Find our contact details, location, and opening hours.',
    components: [
      {
        type: 'ContactInfo'
      }
    ]
  },
  {
    name: 'Events',
    slug: '/events',
    title: 'Events | My Brand',
    description: 'Host your special event at My Brand. Our versatile space is perfect for celebrations and gatherings.',
    components: [
      {
        type: 'PageHeading',
        heading: 'Events Space',
        paragraphs: ["Our dedicated events space is designed to accommodate a variety of occasions. Whether you're planning an intimate gathering or a larger celebration, we have the perfect setting for your special day."],
        className: 'events-heading'
      }
    ]
  },
  {
    name: 'Rooms',
    slug: '/rooms',
    title: 'Rooms | My Brand',
    description: 'Stay at My Brand. Experience comfort and style in our beautifully appointed rooms.',
    transparentNavigation: true,
    components: [
      {
        type: 'FeatureImage',
        image: 'rooms-feature-image.jpg',
        title: 'Rooms',
        text: 'At My Brand'
      },
      {
        type: 'QuoteSection',
        quote: "Four distinctive rooms designed for comfort, each offering a unique experience tailored to your needs."
      },
      {
        type: 'Separator'
      },
      {
        type: 'TwoImageSection',
        cards: [
          {
            title: "Sunset Suite",
            description: "A spacious suite with panoramic views. Perfect for couples seeking relaxation. King-size En-suite Room.",
            image: 'room-1.jpg',
            imageAlt: "Sunset Suite",
            primaryButton: {
              text: "Book Room",
              href: "/rooms/book"
            }
          },
          {
            title: "Garden Room",
            description: "Overlooking our beautiful gardens, this room offers tranquility and comfort. Double En-Suite Room.",
            image: 'room-2.jpg',
            imageAlt: "Garden Room",
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
            title: "Urban Loft",
            description: "Modern design meets classic comfort in this stylish loft space. Twin En-Suite Room.",
            image: 'room-3.jpg',
            imageAlt: "Urban Loft",
            primaryButton: {
              text: "Book Room",
              href: "/rooms/book"
            }
          },
          {
            title: "Heritage Chamber",
            description: "Experience traditional elegance with contemporary amenities in our heritage room. Double En-Suite Room.",
            image: 'room-4.jpg',
            imageAlt: "Heritage Chamber",
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
        description: "Complete the form to book a room at My Brand. Enjoy a comfortable stay in our premium accommodations.",
        components: [
          {
            type: 'PageHeading',
            heading: 'Book a room',
            paragraphs: ['Complete the form below to reserve your room at My Brand. <strong>Please note:</strong> Your reservation is not confirmed until you receive a confirmation email. Rooms are subject to availability, and we aim to respond to all enquiries within 24 hours. For urgent bookings, please contact us directly by phone.'],
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
