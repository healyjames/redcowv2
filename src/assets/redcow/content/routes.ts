import type { RouteConfig } from '../../types';
import { pageMetadata } from './data';

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    slug: '/',
    metadata: pageMetadata.home,
    transparentNavigation: true,
    components: [
      {
        type: 'FeatureImage',
        image: 'home-feature-image.jpg',
        title: 'dataRef:businessInfo.tagline',
        links: 'dataRef:homeContent.featureLinks'
      },
      {
        type: 'QuoteSection',
        quote: 'dataRef:quotes.home'
      },
      {
        type: 'Separator'
      },
      {
        type: 'TwoImageSection',
        cards: 'dataRef:homeComponentData.twoImageCards'
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
    metadata: pageMetadata.about,
    components: [
      {
        type: 'PageHeading',
        heading: 'dataRef:aboutContent.heading',
        paragraphs: 'dataRef:aboutContent.paragraphs',
        className: 'about-heading'
      }
    ]
  },
  {
    name: 'Menu',
    slug: '/menu',
    metadata: pageMetadata.menu,
    components: [
      {
        type: 'PageHeading',
        heading: 'dataRef:menuContent.heading',
        paragraphs: ['dataRef:menuContent.description'],
        className: 'menu-heading'
      },
      {
        type: 'MenuImage',
        image: 'menu-image.jpg',
        alt: 'dataRef:menuContent.imageAlt'
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
    metadata: pageMetadata.contact,
    components: [
      {
        type: 'ContactInfo'
      }
    ]
  },
  {
    name: 'Events',
    slug: '/events',
    metadata: pageMetadata.events,
    components: [
      {
        type: 'PageHeading',
        heading: 'dataRef:eventsContent.heading',
        paragraphs: ['dataRef:eventsContent.description'],
        className: 'events-heading'
      }
    ]
  },
  {
    name: 'Rooms',
    slug: '/rooms',
    metadata: pageMetadata.rooms,
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
        quote: 'dataRef:quotes.rooms'
      },
      {
        type: 'Separator'
      },
      {
        type: 'TwoImageSection',
        cards: 'dataRef:roomsComponentData.roomCards[0,1]'
      },
      {
        type: 'TwoImageSection',
        cards: 'dataRef:roomsComponentData.roomCards[2,3]'
      }
    ],
    children: [
      {
        name: 'Booking',
        slug: '/rooms/book',
        metadata: {
          title: "Book a room",
          description: "Complete the form to book a room at The Red Cow Nantwich. Enjoy a comfortable stay in our charming B&B rooms."
        },
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
