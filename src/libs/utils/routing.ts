import type { ComponentConfig, Page } from '@/libs/types';

const images = import.meta.glob<{ default: ImageMetadata }>('@brand/images/*.{jpg,jpeg,png,webp,avif,svg}', { eager: true });

const imagesByName = new Map(
  Object.entries(images).map(([path, module]) => [path.split('/').pop() ?? path, module.default])
);

export function loadImage(path: string) {
  const image = imagesByName.get(path);

  if (!image) {
    console.error(`Failed to load image: ${path}`);
    console.error('Available images:', [...imagesByName.keys()]);
    return null;
  }

  return image;
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
