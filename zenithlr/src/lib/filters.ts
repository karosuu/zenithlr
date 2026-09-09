import type { Listing, ListingGoal } from "./types";

export type ListingQuery = {
  goal?: ListingGoal | "all";
  type?: string;
  location?: string;
  rooms?: number;
  min?: number;
  max?: number;
  sort?: "default" | "date" | "asc" | "desc";
};

export function parseListingQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ListingQuery {
  const one = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const goal = one("goal");
  const rooms = one("rooms");
  const min = one("min");
  const max = one("max");
  const sort = one("sort");

  return {
    goal:
      goal === "rent" || goal === "sell" || goal === "investment" || goal === "all"
        ? goal
        : "all",
    type: one("type") || undefined,
    location: one("location") || undefined,
    rooms: rooms ? Number(rooms) : undefined,
    min: min ? Number(min) : undefined,
    max: max ? Number(max) : undefined,
    sort:
      sort === "date" || sort === "asc" || sort === "desc" || sort === "default"
        ? sort
        : "default",
  };
}

export function filterListings(listings: Listing[], query: ListingQuery) {
  let result = listings.filter((listing) => listing.status === "published");

  if (query.goal && query.goal !== "all") {
    result = result.filter((listing) => listing.goals.includes(query.goal as ListingGoal));
  }
  if (query.type && query.type !== "all") {
    result = result.filter((listing) => listing.propertyType === query.type);
  }
  if (query.location && query.location !== "all") {
    result = result.filter((listing) => listing.location === query.location);
  }
  if (query.rooms) {
    result = result.filter((listing) => listing.bedrooms >= query.rooms!);
  }
  if (query.min != null) {
    result = result.filter((listing) => listing.price >= query.min!);
  }
  if (query.max != null) {
    result = result.filter((listing) => listing.price <= query.max!);
  }

  if (query.sort === "asc") {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === "desc") {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === "date") {
    result = [...result].reverse();
  }

  return result;
}

export function priceBounds(listings: Listing[]) {
  const prices = listings.map((listing) => listing.price).filter((price) => price > 0);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
