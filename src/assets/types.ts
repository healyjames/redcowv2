export interface BusinessInfo {
  name: string;
  tagline: string;
  shortDescription: string;
  logoText: string;
  reservationsUrl: string;
  mapEmbedUrl: string;
}

export interface ContactInfo {
  phone: string;
  phone_formatted: string;
  email: string;
  address: {
    street: string;
    town: string;
    postcode: string;
  };
}

export interface SocialLink {
  name: string;
  url: string;
  ariaLabel: string;
}

export interface NavigationLink {
  text: string;
  href: string;
}

export interface OpeningHoursDay {
  day: string;
  barHours: string;
  foodHours: string;
}

export interface RoomData {
  name: string;
  description: string;
}

export interface PageMetadata {
  title: string;
  description: string;
}