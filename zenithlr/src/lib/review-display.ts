export const HOMEPAGE_REVIEW_LIMIT = 4;

export type ReviewOrderItem = {
  id: string;
  published: boolean;
  featured: boolean;
};

export function homepageReviewLabel(reviews: ReviewOrderItem[], id: string) {
  const review = reviews.find((item) => item.id === id);
  if (!review?.published || !review.featured) return null;

  const featured = reviews.filter((item) => item.published && item.featured);
  const index = featured.findIndex((item) => item.id === id);
  if (index < 0) return null;
  if (index >= HOMEPAGE_REVIEW_LIMIT) return "Homepage, overflow";

  return `Homepage ${index + 1}/${Math.min(HOMEPAGE_REVIEW_LIMIT, featured.length)}`;
}
