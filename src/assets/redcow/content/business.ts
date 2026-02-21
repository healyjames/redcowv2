import type { ContactInfo, SocialLink, OpeningHoursDay, BusinessInfo } from '@/libs/types';

export const contact: ContactInfo = {
  phone: "01270618522",
  phone_formatted: "01270 618 522",
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
