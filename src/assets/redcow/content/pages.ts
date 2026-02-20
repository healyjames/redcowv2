import type { PageMetadata } from '../../types';

export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: "Home",
    description:
      "Welcome to The Red Cow Nantwich - our treasured 15th Century Old Coaching Inn located in the historic town of Nantwich, in the heart of Cheshire.",
  },
  about: {
    title: "About",
    description:
      "Learn more about The Red Cow Nantwich, a historic 15th Century Coaching Inn in the heart of Cheshire. Meet the passionate team behind our exceptional hospitality and cuisine.",
  },
  contact: {
    title: "Contact us",
    description:
      "Get in touch with us. Find our contact details, location, and opening hours for our beautiful pub.",
  },
  events: {
    title: "Events | Byre Suite",
    description:
      "The Red Cow can host many different events using its Byre events space. Get in touch to find out more.",
  },
  menu: {
    title: "Menu",
    description:
      "Explore the diverse and delicious menus at The Red Cow Nantwich. From hearty pub classics to seasonal specials, our offerings are crafted with fresh, local ingredients to satisfy every palate.",
  },
  rooms: {
    title: "Rooms",
    description:
      "Stay at The Red Cow. Take the weight off your feet and rest up in one our our beautiful B&B rooms.",
  },
};

export const quotes = {
  home: "Passionate about exceptional food, warm hospitality, and creating a welcoming space for all in the heart of Cheshire.",
  rooms:
    "Four stunning en-suite B&B rooms named &amp; designed around the theme of 'Red Cow' breeds across the world.",
};

export const aboutContent = {
  heading: "About The Red Cow",
  paragraphs: [
    "The Red Cow is a 15th Century Coaching Inn, located in the beautiful historic town of Nantwich in the heart of Cheshire. The wattle and daub walls, beamed ceilings, wood burning stove all contribute to the unique & warm atmosphere of this treasured pub. We have four lovely B&B rooms, and unique function room space.",
    "We, Dax & Suzi Gee, took over the pub in January 2021, with the vision & passion to create a wonderful & welcoming atmosphere for all guests. We take great pride in our exceptional tasting food, using the best produce, served by passionate staff.",
    "We both have a wealth of experience in our beloved hospitality industry. Dax being a very skilled & passionate chef, along with characteristic hosting skills, with Suzi's expertise focused on the customer experience, the service & overall guest satisfaction. We are (hopefully) fondly remembered in the local area for our restaurant, Gee's Kitchen, located in Sandbach from 2011 to 2016.",
    "However over recent years, we've been living in Altrincham, whilst working in various establishments across Manchester City Centre, Altrincham, Lymm & Knutsford. One of Dax's proudest achievements was maintaining a 2AA rosette award in 2018.",
    "We were both born & raised in Nantwich and with our first baby on the way, we felt drawn back to our hometown. Luckily finding the Red Cow available for lease, not so lucky, was being in the mist of a global pandemic. However the pull of this wonderful opportunity to show case our passion for hospitality, exceptional food and creating an excellent atmosphere was too strong to us to dismiss.",
    "We are very fortunate that we have the amazing support of our family, friends & the local community to help on this mission. We have always been incredibly passionate about supporting local businesses & the local community, even before the global pandemic. So expect to see lots of collaborations, promotions, and general love for the local area, events & businesses.",
  ],
};

export const eventsContent = {
  heading: "The Byre Suite",
  description:
    "The Byre Suite is our private and truly unique event space, designed to bring people together in comfort and style. Whether you're hosting an intimate gathering, a milestone celebration, or a professional event, the Byre offers the perfect balance of charm and sophistication. With its warm character, beautiful décor, and inviting atmosphere, it provides a memorable backdrop for any occasion.",
  featureTitle: "Byre Suite",
  featureText: "Private Events Space at The Red Cow",
};

export const menuContent = {
  heading: "Menus",
  description:
    "We believe great food starts with the freshest ingredients. Our chefs create delicious dishes that celebrate the best of each season, with menus that change regularly to bring you new flavours and the finest produce available. Whether you're joining us for a hearty meal or something lighter, you'll always find something fresh, tasty, and made with care.",
  disclaimer: "Our menu changes frequently. Below are sample menus.",
  imageAlt: "Freshly cooked beef burger with fries and an ice cold beer.",
};

export const homeContent = {
  featureTitle: "Graze. Gather. Stay",
  featureLinks: [
    { text: "View Menu", href: "/menu" },
    { text: "Book Room", href: "/rooms" },
  ],
  menuCard: {
    title: "Menu",
    description:
      "Our kitchen celebrates the best of local produce, crafting a menu that changes with the seasons. Expect freshly prepared dishes, traditional flavours, and a taste of the countryside with every bite.",
    imageAlt: "Restaurant menu showcase",
    primaryButton: {
      text: "Book a table",
      href: "https://web.dojo.app/create_booking/vendor/_i5WYdjKa2QID8JUwfbYHRllSmUSt-BCNny3N3KVHJg_restaurant",
    },
  },
  roomsCard: {
    title: "Rooms",
    description:
      "Make yourself at home in one of our inviting rooms. Whether you're here for a quiet break, a celebration, or simply passing through, our accommodation blends rustic charm with modern comforts for a restful night's sleep.",
    imageAlt: "Comfortable guest room",
    secondaryButton: {
      text: "Find out more",
      href: "/rooms",
    },
  },
};

export const contactContent = {
  heading: "Get in touch",
  parkingNote: "Car parking facilities are available next to the restaurant",
  phoneNote:
    "Our telephones are open inline with our normal opening hours.",
};
