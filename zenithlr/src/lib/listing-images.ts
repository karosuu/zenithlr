import type { ListingImage } from "@/lib/types";

export function withSortOrder(images: ListingImage[]): ListingImage[] {
  return images.map((item, index) => ({ ...item, sortOrder: index }));
}

export function sortListingImages(images: ListingImage[]): ListingImage[] {
  return [...images].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
}

export function pinCoverFirst(images: ListingImage[]): ListingImage[] {
  if (images.length === 0) return [];
  const sorted = sortListingImages(images);
  return withSortOrder(sorted.map((item, index) => ({ ...item, isCover: index === 0 })));
}

export function moveListingImages(
  images: ListingImage[],
  fromId: string,
  toId: string,
): ListingImage[] {
  if (fromId === toId) return images;
  const from = images.findIndex((item) => item.id === fromId);
  const to = images.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0) return images;
  if (from === 0 || to === 0 || images[from]?.isCover || images[to]?.isCover) {
    return images;
  }
  const next = [...images];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return withSortOrder(next);
}

export function setListingCover(images: ListingImage[], id: string): ListingImage[] {
  if (!images.some((item) => item.id === id)) return images;
  return pinCoverFirst(images.map((item) => ({ ...item, isCover: item.id === id })));
}

export function removeListingImages(
  images: ListingImage[],
  idsToRemove: Set<string>,
): ListingImage[] {
  const remaining = images.filter((item) => !idsToRemove.has(item.id));
  if (remaining.length === 0) return remaining;
  return pinCoverFirst(remaining);
}

export function appendListingImages(images: ListingImage[], urls: string[]): ListingImage[] {
  const added = urls.map((url, index) => ({
    id: crypto.randomUUID(),
    url,
    isCover: images.length === 0 && index === 0,
    sortOrder: images.length + index,
  }));
  return pinCoverFirst([...images, ...added]);
}
