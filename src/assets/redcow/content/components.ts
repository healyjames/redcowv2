import type { RoomData } from '@/libs/types';
import { homeContent } from './pages';

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

export const homeComponentData = {
  twoImageCards: [
    {
      ...homeContent.menuCard,
      image: 'home-two-image-section-1.jpg',
      imageAlt: homeContent.menuCard.imageAlt
    },
    {
      ...homeContent.roomsCard,
      image: 'home-two-image-section-2.jpg',
      imageAlt: homeContent.roomsCard.imageAlt
    }
  ]
};

export const roomsComponentData = {
  roomCards: rooms
    .filter(room => room.name !== "Any")
    .map((room, index) => ({
      title: room.name,
      description: room.description,
      image: `room-${index + 1}.jpg`,
      imageAlt: `${room.name} Room`,
      primaryButton: {
        text: "Book Room",
        href: "/rooms/book"
      }
    }))
};
