export interface FormData {
    firstname: string;
    surname: string;
    guests: string;
    date: string;
    room: string;
    nights: string;
    number: string;
    email: string;
    additionaltext: string;
    logo?: string
}

export interface FormErrors {
    [key: string]: string;
}


// -- Pages --
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
  phoneFormatted: string;
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

// -- Components --
export interface FeatureImageConfig {
  type: 'FeatureImage';
  image: string;
  title?: string;
  text?: string;
  links?: Array<{ text: string; href: string }>;
}

export interface TwoImageSectionConfig {
  type: 'TwoImageSection';
  cards: Array<{
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    primaryButton?: { text: string; href: string };
    secondaryButton?: { text: string; href: string };
  }>;
}

export interface QuoteSectionConfig {
  type: 'QuoteSection';
  quote: string;
}

export interface AboutSectionConfig {
  type: 'AboutSection';
}

export interface SeparatorConfig {
  type: 'Separator';
}

export interface PageHeadingConfig {
  type: 'PageHeading';
  heading: string;
  paragraphs?: string[];
  className?: string;
}

export interface MenuImageConfig {
  type: 'MenuImage';
  image: string;
  alt: string;
}

export interface MenuLinksConfig {
  type: 'MenuLinks';
  links: Array<{ text: string; href: string }>;
}

export interface BookingFormConfig {
  type: 'BookingForm';
}

export interface MapConfig {
  type: 'Map';
  src: string;
}

export interface ContactInfoConfig {
  type: 'ContactInfo';
}

export interface ReservationsBannerConfig {
  type: 'ReservationsBanner';
}

export type ComponentConfig =
  | FeatureImageConfig
  | TwoImageSectionConfig
  | QuoteSectionConfig
  | AboutSectionConfig
  | SeparatorConfig
  | PageHeadingConfig
  | MenuImageConfig
  | MenuLinksConfig
  | BookingFormConfig
  | MapConfig
  | ContactInfoConfig
  | ReservationsBannerConfig;

// -- Other --
export interface RouteConfig {
  name: string;
  slug: string;
  metadata: PageMetadata;
  transparentNavigation?: boolean;
  components: ComponentConfig[];
  children?: RouteConfig[];
}

export interface Page {
  name: string;
  slug: string;
  title: string;
  description: string;
  transparentNavigation?: boolean;
  components: ComponentConfig[];
  children?: Page[];
}
