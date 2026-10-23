/**
 * ConnectSoulmate Services V1 Client API & Types
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: string[];
  service_count?: number;
  parent_priority?: number;
  bride_groom_priority?: number;
}

export interface ServicePackage {
  name: string;
  price: string;
  description?: string;
  features: string[];
}

export interface ServiceProvider {
  id: number;
  categoryId?: number;
  name: string;
  tagline: string | null;
  description: string | null;
  about?: string | null;
  location: string;
  city: string | null;
  state: string | null;
  phone?: string | null;
  email?: string | null;
  rating: number;
  reviewCount: number;
  review_count?: number;
  startingPrice?: number | null;
  starting_price?: number | null;
  priceRange?: string | null;
  price_range?: string | null;
  coverImage?: string | null;
  cover_image?: string | null;
  portfolioImages?: string[];
  portfolio_images?: string[];
  servicesOffered?: string[];
  services_offered?: string[];
  packages?: ServicePackage[];
  tags: string[];
  isFeatured?: boolean;
  is_featured?: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    subcategories?: string[];
  };
}

export interface ServiceEnquiryPayload {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export interface ServiceEnquiryResponse {
  success: boolean;
  message: string;
  enquiryId?: number;
  serviceName?: string;
}

/**
 * Fetch all active categories
 */
export async function fetchServiceCategories(mode?: string | null): Promise<ServiceCategory[]> {
  const url = new URL(`${API_URL}/api/services/categories`);
  if (mode) url.searchParams.set("mode", mode);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load service categories");
  const data = await res.json();
  return data.categories || [];
}

/**
 * Fetch category by slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  const res = await fetch(`${API_URL}/api/services/categories/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load category details");
  const data = await res.json();
  return data.category || null;
}

/**
 * Fetch service providers with filters
 */
export async function fetchServices(params: {
  category?: string;
  location?: string;
  search?: string;
  tag?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; services: ServiceProvider[] }> {
  const url = new URL(`${API_URL}/api/services`);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.location && params.location !== "all") url.searchParams.set("location", params.location);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.tag && params.tag !== "all" && params.tag !== "All") url.searchParams.set("tag", params.tag);
  if (params.featured) url.searchParams.set("featured", "true");
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load service providers");
  const data = await res.json();
  return {
    total: data.total || 0,
    services: data.services || [],
  };
}

/**
 * Fetch single service provider details
 */
export async function fetchServiceDetails(id: number): Promise<ServiceProvider | null> {
  const res = await fetch(`${API_URL}/api/services/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load service provider details");
  const data = await res.json();
  return data.service || null;
}

/**
 * Fetch distinct locations
 */
export async function fetchServiceLocations(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/services/locations`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.locations || [];
  } catch (e) {
    return [];
  }
}

/**
 * Submit an enquiry
 */
export async function submitServiceEnquiry(
  serviceId: number,
  payload: ServiceEnquiryPayload,
  token?: string | null
): Promise<ServiceEnquiryResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/services/${serviceId}/enquiry`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to submit enquiry");
  }

  return data;
}
