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
