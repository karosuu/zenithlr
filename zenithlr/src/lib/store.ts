import { promises as fs } from "fs";
import path from "path";
import type {
  Database,
  Lead,
  Listing,
  Locale,
  PageFields,
  Post,
  Review,
} from "./types";
import { tx } from "./i18n-text";

const dbPath = path.join(process.cwd(), "data", "db.json");

async function readDb(): Promise<Database> {
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw) as Database;
}

async function writeDb(db: Database) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function getDb() {
  return readDb();
}

export async function getPage(key: string): Promise<PageFields> {
  const db = await readDb();
  return db.pages[key] ?? {};
}

export async function savePage(key: string, fields: PageFields) {
  const db = await readDb();
  db.pages[key] = { ...db.pages[key], ...fields };
  await writeDb(db);
  return db.pages[key];
}

export async function getAgents() {
  const db = await readDb();
  return db.agents;
}

export async function getPublishedListings() {
  const db = await readDb();
  return db.listings.filter((listing) => listing.status === "published");
}

export async function getAllListings() {
  const db = await readDb();
  return db.listings;
}

export async function getListingBySlug(slug: string, locale: Locale) {
  const db = await readDb();
  return (
    db.listings.find(
      (listing) =>
        listing.slug === slug &&
        (listing.status === "published" || listing.status === "sold" || listing.status === "rented"),
    ) ??
    db.listings.find((listing) => tx(listing.title, locale).toLowerCase().includes(slug))
  );
}

export async function getListingById(id: string) {
  const db = await readDb();
  return db.listings.find((listing) => listing.id === id) ?? null;
}

export async function saveListing(listing: Listing) {
  const db = await readDb();
  const index = db.listings.findIndex((item) => item.id === listing.id);
  if (index >= 0) {
    db.listings[index] = listing;
  } else {
    db.listings.unshift(listing);
  }
  await writeDb(db);
  return listing;
}

export async function deleteListing(id: string) {
  const db = await readDb();
  db.listings = db.listings.filter((listing) => listing.id !== id);
  await writeDb(db);
}

export async function reorderListings(ids: string[]) {
  const db = await readDb();
  const byId = new Map(db.listings.map((listing) => [listing.id, listing]));
  const seen = new Set<string>();
  const next: Listing[] = [];

  for (const id of ids) {
    const listing = byId.get(id);
    if (!listing || seen.has(id)) continue;
    next.push(listing);
    seen.add(id);
  }
  for (const listing of db.listings) {
    if (!seen.has(listing.id)) next.push(listing);
  }

  db.listings = next;
  await writeDb(db);
  return db.listings;
}

export async function getPublishedPosts() {
  const db = await readDb();
  return db.posts
    .filter((post) => post.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getAllPosts() {
  const db = await readDb();
  return db.posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string) {
  const db = await readDb();
  return db.posts.find((post) => post.slug === slug && post.published) ?? null;
}

export async function getPostById(id: string) {
  const db = await readDb();
  return db.posts.find((post) => post.id === id) ?? null;
}

export async function savePost(post: Post) {
  const db = await readDb();
  const index = db.posts.findIndex((item) => item.id === post.id);
  if (index >= 0) {
    db.posts[index] = post;
  } else {
    db.posts.unshift(post);
  }
  await writeDb(db);
  return post;
}

export async function deletePost(id: string) {
  const db = await readDb();
  db.posts = db.posts.filter((post) => post.id !== id);
  await writeDb(db);
}

export async function getAllReviews() {
  const db = await readDb();
  return [...db.reviews].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.date.localeCompare(a.date),
  );
}

export async function getPublishedReviews() {
  const reviews = await getAllReviews();
  return reviews.filter((review) => review.published);
}

export async function getReviewById(id: string) {
  const db = await readDb();
  return db.reviews.find((review) => review.id === id) ?? null;
}

export async function saveReview(review: Review) {
  const db = await readDb();
  const index = db.reviews.findIndex((item) => item.id === review.id);
  if (index >= 0) {
    db.reviews[index] = review;
    await writeDb(db);
    return review;
  }
  const maxOrder = db.reviews.reduce((max, item) => Math.max(max, item.sortOrder), -1);
  const created = { ...review, sortOrder: maxOrder + 1 };
  db.reviews.push(created);
  await writeDb(db);
  return created;
}

export async function deleteReview(id: string) {
  const db = await readDb();
  db.reviews = db.reviews.filter((review) => review.id !== id);
  await writeDb(db);
}

export async function reorderReviews(ids: string[]) {
  const db = await readDb();
  const byId = new Map(db.reviews.map((review) => [review.id, review]));
  const seen = new Set<string>();
  const next: Review[] = [];

  for (const id of ids) {
    const review = byId.get(id);
    if (!review || seen.has(id)) continue;
    next.push(review);
    seen.add(id);
  }
  for (const review of db.reviews) {
    if (!seen.has(review.id)) next.push(review);
  }

  db.reviews = next.map((review, index) => ({ ...review, sortOrder: index }));
  await writeDb(db);
  return db.reviews;
}

export async function addLead(lead: Omit<Lead, "id" | "createdAt">) {
  const db = await readDb();
  const entry: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  db.leads.unshift(entry);
  await writeDb(db);
  return entry;
}

export function uniqueValues(listings: Listing[]) {
  const types = [...new Set(listings.map((listing) => listing.propertyType))].sort();
  const locations = [...new Set(listings.map((listing) => listing.location))].sort();
  const rooms = [...new Set(listings.map((listing) => listing.bedrooms))].sort(
    (a, b) => a - b,
  );
  return { types, locations, rooms };
}
