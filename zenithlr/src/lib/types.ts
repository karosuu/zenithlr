export type Locale = "en" | "es";

export type Localized = {
  en: string;
  es: string;
};

export type ListingGoal = "rent" | "sell" | "investment";
export type ListingStatus = "draft" | "published" | "sold" | "rented";
export type PricePeriod = "sale" | "month";

export type Agent = {
  id: string;
  name: string;
  role: Localized;
  phone: string;
  whatsapp: string;
  email: string;
  photo: string;
  bio: Localized;
};

export type ListingImage = {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
};

export type Listing = {
  id: string;
  slug: string;
  propertyId: string;
  status: ListingStatus;
  goals: ListingGoal[];
  featured: boolean;
  agentId: string;
  title: Localized;
  location: string;
  propertyType: string;
  price: number;
  pricePeriod: PricePeriod;
  currency: "USD";
  bedrooms: number;
  bathrooms: number;
  constructionArea?: number;
  lotArea?: number;
  levels?: number;
  kitchen?: number;
  serviceRoom?: number;
  maintenanceFee?: number;
  yearBuilt?: number;
  parking?: number;
  description: Localized;
  specialFeatures: Localized;
  amenities: Localized[];
  faq: { question: Localized; answer: Localized }[];
  videoUrl?: string;
  mapUrl?: string;
  images: ListingImage[];
};

export type Post = {
  id: string;
  slug: string;
  published: boolean;
  date: string;
  pdf?: string;
  author?: string;
  role?: Localized;
  heroImage?: string;
  heroBand?: string;
  heroPhoto?: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
};

export type Lead = {
  id: string;
  createdAt: string;
  type: "contact" | "visit" | "sell-with-us" | "newsletter";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  listingSlug?: string;
  locale: Locale;
};

export type PageFields = Record<string, Localized | string>;

export type Review = {
  id: string;
  author: string;
  quote: Localized;
  date: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type Database = {
  agents: Agent[];
  listings: Listing[];
  posts: Post[];
  leads: Lead[];
  pages: Record<string, PageFields>;
  reviews: Review[];
};
