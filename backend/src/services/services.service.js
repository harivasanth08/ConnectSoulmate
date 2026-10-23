const pool = require("../config/database");

/**
 * Service layer for ConnectSoulmate Services V1.
 */

/**
 * Fetch all active categories with service counts and contextual ordering.
 * @param {string} mode - 'parent' | 'individual' | null
 */
async function getCategories(mode = null) {
  let orderClause = "c.bride_groom_priority DESC, c.name ASC";
  if (mode === "parent") {
    orderClause = "c.parent_priority DESC, c.name ASC";
  }

  const query = `
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.icon,
      c.subcategories,
      c.parent_priority,
      c.bride_groom_priority,
      COUNT(s.id) AS service_count
    FROM service_categories c
    LEFT JOIN services s ON c.id = s.category_id AND s.status = 'active'
    WHERE c.status = 'active'
    GROUP BY c.id
    ORDER BY ${orderClause}
  `;

  const [rows] = await pool.query(query);

  return rows.map((cat) => ({
    ...cat,
    service_count: Number(cat.service_count || 0),
    subcategories: typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : cat.subcategories || [],
  }));
}

/**
 * Fetch category details by slug.
 */
async function getCategoryBySlug(slug) {
  const [rows] = await pool.query(
    "SELECT * FROM service_categories WHERE slug = ? AND status = 'active' LIMIT 1",
    [slug]
  );

  if (rows.length === 0) return null;

  const cat = rows[0];
  return {
    ...cat,
    subcategories: typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : cat.subcategories || [],
  };
}

/**
 * Fetch list of services with filtering and search.
 */
async function getServices({ category = null, location = null, search = null, tag = null, featured = null, limit = 50, offset = 0 } = {}) {
  const whereClauses = ["s.status = 'active'"];
  const params = [];

  // Category filter by slug or ID
  if (category) {
    if (isNaN(category)) {
      whereClauses.push("c.slug = ?");
      params.push(category);
    } else {
      whereClauses.push("s.category_id = ?");
      params.push(Number(category));
    }
  }

  // Location filter (city or location substring)
  if (location && location.trim() && location.trim() !== "all") {
    whereClauses.push("(LOWER(s.city) = LOWER(?) OR LOWER(s.location) LIKE LOWER(?))");
    params.push(location.trim(), `%${location.trim()}%`);
  }

  // Free text search
  if (search && search.trim()) {
    const s = `%${search.trim().toLowerCase()}%`;
    whereClauses.push("(LOWER(s.name) LIKE ? OR LOWER(s.tagline) LIKE ? OR LOWER(s.description) LIKE ? OR LOWER(s.about) LIKE ? OR LOWER(s.city) LIKE ?)");
    params.push(s, s, s, s, s);
  }

  // Category-specific subcategory or tag filter
  if (tag && tag.trim() && tag.trim() !== "all" && tag.trim() !== "All") {
    const t = `%${tag.trim().toLowerCase()}%`;
    whereClauses.push("(LOWER(CAST(s.tags AS CHAR)) LIKE ? OR LOWER(CAST(s.services_offered AS CHAR)) LIKE ?)");
    params.push(t, t);
  }

  // Featured only
  if (featured === true || featured === "true" || featured === "1") {
    whereClauses.push("s.is_featured = 1");
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count total matching services
  const countSQL = `
    SELECT COUNT(s.id) AS total
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    ${whereSQL}
  `;
  const [countResult] = await pool.query(countSQL, params);
  const total = Number(countResult[0]?.total || 0);

  // Fetch paginated rows
  const querySQL = `
    SELECT 
      s.id,
      s.category_id,
      s.name,
      s.tagline,
      s.description,
      s.location,
      s.city,
      s.state,
      s.phone,
      s.email,
      s.rating,
      s.review_count,
      s.starting_price,
      s.price_range,
      s.cover_image,
      s.tags,
      s.is_featured,
      s.created_at,
      c.name AS category_name,
      c.slug AS category_slug,
      c.icon AS category_icon
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    ${whereSQL}
    ORDER BY s.is_featured DESC, s.rating DESC, s.review_count DESC, s.id DESC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, Number(limit) || 50, Number(offset) || 0];
  const [rows] = await pool.query(querySQL, queryParams);

  const parsedRows = rows.map((row) => ({
    ...row,
    rating: Number(row.rating || 0),
    review_count: Number(row.review_count || 0),
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
    is_featured: Boolean(row.is_featured),
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
      icon: row.category_icon,
    },
  }));

  return {
    total,
    services: parsedRows,
  };
}

/**
 * Fetch detailed provider info by ID.
 */
async function getServiceById(id) {
  const query = `
    SELECT 
      s.*,
      c.name AS category_name,
      c.slug AS category_slug,
      c.icon AS category_icon,
      c.subcategories AS category_subcategories
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.id = ? AND s.status = 'active'
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [id]);
  if (rows.length === 0) return null;

  const s = rows[0];

  return {
    id: s.id,
    categoryId: s.category_id,
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    about: s.about,
    location: s.location,
    city: s.city,
    state: s.state,
    phone: s.phone,
    email: s.email,
    rating: Number(s.rating || 0),
    reviewCount: Number(s.review_count || 0),
    startingPrice: s.starting_price,
    priceRange: s.price_range,
    coverImage: s.cover_image,
    portfolioImages: typeof s.portfolio_images === "string" ? JSON.parse(s.portfolio_images) : s.portfolio_images || [],
    servicesOffered: typeof s.services_offered === "string" ? JSON.parse(s.services_offered) : s.services_offered || [],
    packages: typeof s.packages === "string" ? JSON.parse(s.packages) : s.packages || [],
    tags: typeof s.tags === "string" ? JSON.parse(s.tags) : s.tags || [],
    isFeatured: Boolean(s.is_featured),
    category: {
      id: s.category_id,
      name: s.category_name,
      slug: s.category_slug,
      icon: s.category_icon,
      subcategories: typeof s.category_subcategories === "string" ? JSON.parse(s.category_subcategories) : s.category_subcategories || [],
    },
    createdAt: s.created_at,
  };
}

/**
 * Submit an enquiry for a service provider.
 */
async function createEnquiry({ serviceId, userId = null, name, phone, email = null, message }) {
  // 1. Verify service exists and is active
  const [serviceCheck] = await pool.query(
    "SELECT id, name, category_id FROM services WHERE id = ? AND status = 'active' LIMIT 1",
    [serviceId]
  );

  if (serviceCheck.length === 0) {
    const error = new Error("Service provider not found or no longer active.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Validate userId against users table if provided
  let validUserId = null;
  if (userId) {
    const [userRows] = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [userId]);
    if (userRows.length > 0) {
      validUserId = userRows[0].id;
    }
  }

  // 3. Insert enquiry
  const [result] = await pool.query(
    `INSERT INTO service_enquiries (service_id, user_id, name, phone, email, message, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [serviceId, validUserId, name.trim(), phone.trim(), email ? email.trim() : null, message.trim()]
  );

  return {
    enquiryId: result.insertId,
    serviceName: serviceCheck[0].name,
  };
}

/**
 * Fetch distinct available locations for filtering.
 */
async function getDistinctLocations() {
  const [rows] = await pool.query(`
    SELECT DISTINCT city 
    FROM services 
    WHERE status = 'active' AND city IS NOT NULL AND city != '' 
    ORDER BY city ASC
  `);

  return rows.map((r) => r.city);
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  getServices,
  getServiceById,
  createEnquiry,
  getDistinctLocations,
};
