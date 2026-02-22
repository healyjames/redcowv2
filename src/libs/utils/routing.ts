import type { ComponentConfig, Page } from '@/libs/types';

const brand = import.meta.env.PUBLIC_BRAND;
const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/*/images/*.{jpg,jpeg,png,webp,avif}', { eager: true });
const pdfs = import.meta.glob<string>('/src/assets/*/menus/*.pdf', { eager: true, query: '?url', import: 'default' });

if (!brand) {
  throw new Error('PUBLIC_BRAND env var not set');
}

export function loadImage(path: string) {
  const image = images[`/src/assets/${brand}/images/${path}`];

  if (!image) {
    console.error(`Failed to load image: ${path}. Looking for key: ${image}`);
    console.error('Available images:', Object.keys(images).filter(k => k.includes(brand)));
    return null;
  }

  return image.default;
}

export function loadPdf(path: string): string | null {
  const pdf = pdfs[`/src/assets/${brand}/menus/${path}`];

  if (!pdf) {
    console.error(`Failed to load PDF: ${path}`);
    console.error('Available PDFs:', Object.keys(pdfs).filter(k => k.includes(brand)));
    return null;
  }

  return pdf;
}

export function resolveComponentProps(config: ComponentConfig) {
  const props: Record<string, any> = { ...config };

  if ('image' in props && typeof props.image === 'string') {
    const loadedImage = loadImage(props.image);
    if (loadedImage) {
      props.image = loadedImage;
    }
  }

  if ('cards' in props && Array.isArray(props.cards)) {
    props.cards = props.cards.map((card: any) => {
      if (card.image && typeof card.image === 'string') {
        const loadedImage = loadImage(card.image);
        return {
          ...card,
          image: loadedImage || card.image
        };
      }
      return card;
    });
  }

  if ('links' in props && Array.isArray(props.links)) {
    props.links = props.links.map((link: any) => {
      if (link.href && typeof link.href === 'string' && link.href.endsWith('.pdf')) {
        const filename = link.href.split('/').pop();
        const loadedPdf = loadPdf(filename!);
        return {
          ...link,
          href: loadedPdf || link.href
        };
      }
      return link;
    });
  }

  return props;
}

export function getAllPages(pages: Page[]): Page[] {
  const flatPages: Page[] = [];
  for (const page of pages) {
    flatPages.push(page);
    if (page.children) {
      flatPages.push(...page.children);
    }
  }
  return flatPages;
}

export function getPageBySlug(pages: Page[], slug: string): Page | undefined {
  return getAllPages(pages).find(page => page.slug === slug);
}
