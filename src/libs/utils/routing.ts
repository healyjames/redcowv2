import type { ComponentConfig, RouteConfig } from '@/assets/types';

const brand = import.meta.env.PUBLIC_BRAND;
const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/*/images/*.{jpg,jpeg,png,webp,avif}', { eager: true });

if (!brand) {
    throw new Error('PUBLIC_BRAND env var not set');
}

export function loadImage(path: string) {;
  const image = images[`/src/assets/${brand}/images/${path}`];

  if (!image) {
    console.error(`Failed to load image: ${path}. Looking for key: ${image}`);
    console.error('Available images:', Object.keys(images).filter(k => k.includes(brand)));
    return null;
  }

  return image.default;
}

export function resolveDataRef(value: any, data: any): any {
  if (typeof value === 'string' && value.startsWith('dataRef:')) {
    const path = value.slice(8);

    const arrayMatch = path.match(/^(.+)\[(\d+),(\d+)\]$/);
    if (arrayMatch) {
      const [, dataPath, startIdx, endIdx] = arrayMatch;
      const arrayData = dataPath.split('.').reduce((obj: any, key) => obj?.[key], data as Record<string, any>);
      return Array.isArray(arrayData) ? arrayData.slice(parseInt(startIdx), parseInt(endIdx) + 1) : arrayData;
    }

    return path.split('.').reduce((obj: any, key) => obj?.[key], data as Record<string, any>);
  }

  if (Array.isArray(value)) {
    return value.map(resolveDataRef);
  }

  if (value && typeof value === 'object') {
    const resolved: any = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveDataRef(val);
    }
    return resolved;
  }

  return value;
}

export function resolveComponentProps(config: ComponentConfig) {
  const props: Record<string, any> = { ...config };

  for (const [key, value] of Object.entries(props)) {
    if (key !== 'type') {
      props[key] = resolveDataRef(value);
    }
  }

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

export function getAllRoutes(): RouteConfig[] {
  const flatRoutes: RouteConfig[] = [];
  for (const route of routes) {
    flatRoutes.push(route);
    if (route.nested) {
      flatRoutes.push(...route.nested);
    }
  }
  return flatRoutes;
}

export function getRouteBySlug(slug: string): RouteConfig | undefined {
  return getAllRoutes().find(route => route.slug === slug);
}