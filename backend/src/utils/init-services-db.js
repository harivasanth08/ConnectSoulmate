const pool = require("../config/database");

/**
 * Idempotent schema initialization and seed data for ConnectSoulmate Services V1.
 */
async function initServicesDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing Services database schema...");

    // 1. service_categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT DEFAULT NULL,
        icon VARCHAR(50) DEFAULT NULL,
        subcategories JSON DEFAULT NULL,
        parent_priority INT DEFAULT 50,
        bride_groom_priority INT DEFAULT 50,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cat_slug (slug),
        INDEX idx_cat_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. services (providers) table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        category_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(150) NOT NULL,
        tagline VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        about TEXT DEFAULT NULL,
        location VARCHAR(150) NOT NULL,
        city VARCHAR(100) DEFAULT NULL,
        state VARCHAR(100) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        rating DECIMAL(2, 1) DEFAULT 4.8,
        review_count INT DEFAULT 0,
        starting_price INT DEFAULT NULL,
        price_range VARCHAR(50) DEFAULT NULL,
        cover_image VARCHAR(500) DEFAULT NULL,
        portfolio_images JSON DEFAULT NULL,
        services_offered JSON DEFAULT NULL,
        packages JSON DEFAULT NULL,
        tags JSON DEFAULT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_srv_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
        INDEX idx_srv_category (category_id),
        INDEX idx_srv_city (city),
        INDEX idx_srv_status (status),
        INDEX idx_srv_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. service_enquiries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_enquiries (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        service_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED DEFAULT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) DEFAULT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'contacted', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_enq_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        CONSTRAINT fk_enq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_enq_service (service_id),
        INDEX idx_enq_user (user_id),
        INDEX idx_enq_status (status),
        INDEX idx_enq_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Seed Categories if table is empty
    const [existingCategories] = await connection.query("SELECT COUNT(*) AS count FROM service_categories");
    if (existingCategories[0].count === 0) {
      console.log("Seeding default service categories...");

      const categories = [
        {
          name: "Photography",
          slug: "photography",
          description: "Capture every beautiful moment with cinematic wedding and candid shoots.",
          icon: "Camera",
          subcategories: JSON.stringify([
            "Wedding Photography",
            "Pre-Wedding Photography",
            "Candid Photography",
            "Traditional Photography"
          ]),
          parent_priority: 40,
          bride_groom_priority: 95
        },
        {
          name: "Videography",
          slug: "videography",
          description: "Relive your celebration through captivating wedding films and teasers.",
          icon: "Video",
          subcategories: JSON.stringify([
            "Wedding Videography",
            "Cinematic Wedding Films",
            "Pre-Wedding Films"
          ]),
          parent_priority: 35,
          bride_groom_priority: 90
        },
        {
          name: "Makeup & Beauty",
          slug: "makeup-beauty",
          description: "Look your radiant best with expert bridal makeup and groom styling artists.",
          icon: "Sparkles",
          subcategories: JSON.stringify([
            "Bridal Makeup",
            "Groom Grooming",
            "Hair Styling",
            "Beauty Services"
          ]),
          parent_priority: 30,
          bride_groom_priority: 88
        },
        {
          name: "Wedding Wear",
          slug: "wedding-wear",
          description: "Exquisite bridal lehengas, silk sarees, and royal sherwanis for your big day.",
          icon: "Shirt",
          subcategories: JSON.stringify([
            "Bridal Wear",
            "Groom Wear",
            "Sarees",
            "Lehengas",
            "Sherwanis"
          ]),
          parent_priority: 50,
          bride_groom_priority: 85
        },
        {
          name: "Jewellery",
          slug: "jewellery",
          description: "Timeless gold, diamond, and traditional heritage jewellery collections.",
          icon: "Gem",
          subcategories: JSON.stringify([
            "Bridal Jewellery",
            "Gold Jewellery",
            "Diamond Jewellery",
            "Traditional Jewellery"
          ]),
          parent_priority: 55,
          bride_groom_priority: 80
        },
        {
          name: "Decoration",
          slug: "decoration",
          description: "Breathtaking mandaps, stage floral artistry, and enchanting theme setups.",
          icon: "Flower2",
          subcategories: JSON.stringify([
            "Wedding Decoration",
            "Stage Decoration",
            "Floral Decoration",
            "Mandap Decoration"
          ]),
          parent_priority: 80,
          bride_groom_priority: 75
        },
        {
          name: "Wedding Venues",
          slug: "wedding-venues",
          description: "Magnificent marriage halls, scenic beach resorts, and grand open lawns.",
          icon: "Building2",
          subcategories: JSON.stringify([
            "Marriage Halls",
            "Function Halls",
            "Resorts",
            "Outdoor Venues"
          ]),
          parent_priority: 100,
          bride_groom_priority: 70
        },
        {
          name: "Catering",
          slug: "catering",
          description: "Authentic multi-cuisine wedding feasts prepared with love and hygiene.",
          icon: "UtensilsCrossed",
          subcategories: JSON.stringify([
            "Vegetarian Catering",
            "Non-Vegetarian Catering",
            "Traditional Catering",
            "Wedding Catering"
          ]),
          parent_priority: 95,
          bride_groom_priority: 65
        },
        {
          name: "Mehendi",
          slug: "mehendi",
          description: "Intricate bridal henna, contemporary Arabic patterns, and festive designs.",
          icon: "Palette",
          subcategories: JSON.stringify([
            "Bridal Mehendi",
            "Traditional Mehendi",
            "Modern Designs"
          ]),
          parent_priority: 25,
          bride_groom_priority: 78
        },
        {
          name: "Invitations",
          slug: "invitations",
          description: "Luxury printed wedding cards and bespoke interactive digital invitations.",
          icon: "Mail",
          subcategories: JSON.stringify([
            "Printed Invitations",
            "Digital Invitations",
            "Custom Wedding Invitations"
          ]),
          parent_priority: 60,
          bride_groom_priority: 60
        },
        {
          name: "Music & Entertainment",
          slug: "music-entertainment",
          description: "High-energy wedding DJs, classical musicians, and live sangeet performances.",
          icon: "Music",
          subcategories: JSON.stringify([
            "DJ",
            "Live Music",
            "Traditional Music",
            "Wedding Entertainment"
          ]),
          parent_priority: 45,
          bride_groom_priority: 68
        },
        {
          name: "Honeymoon & Travel",
          slug: "honeymoon-travel",
          description: "Romantic getaway itineraries, luxury resort packages, and seamless travel.",
          icon: "Plane",
          subcategories: JSON.stringify([
            "Honeymoon Packages",
            "Travel Planning",
            "Resort Packages"
          ]),
          parent_priority: 20,
          bride_groom_priority: 72
        }
      ];

      for (const cat of categories) {
        await connection.query(
          `INSERT INTO service_categories (name, slug, description, icon, subcategories, parent_priority, bride_groom_priority)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            cat.name,
            cat.slug,
            cat.description,
            cat.icon,
            cat.subcategories,
            cat.parent_priority,
            cat.bride_groom_priority
          ]
        );
      }
      console.log("✓ 12 Service categories seeded successfully.");
    }

    // 5. Seed Realistic Sample Providers if empty
    const [existingServices] = await connection.query("SELECT COUNT(*) AS count FROM services");
    if (existingServices[0].count === 0) {
      console.log("Seeding sample service providers...");

      // Get category map: slug -> id
      const [catRows] = await connection.query("SELECT id, slug FROM service_categories");
      const catMap = {};
      catRows.forEach((r) => {
        catMap[r.slug] = r.id;
      });

      const providers = [
        {
          categorySlug: "photography",
          name: "Moments Studio",
          tagline: "Timeless candid wedding & pre-wedding storytelling",
          description: "We capture authentic wedding moments through candid, artistic and cinematic photography.",
          about: "Moments Studio is an acclaimed wedding photography collective with over 8 years of capturing soulful Indian weddings. Our passionate crew of photojournalists and portrait specialists believe in unscripted emotions, golden light, and timeless memories.",
          location: "Visakhapatnam, Andhra Pradesh",
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          phone: "+91 98480 12345",
          email: "hello@momentsstudio.in",
          rating: 4.9,
          review_count: 84,
          starting_price: 45000,
          price_range: "₹45,000 - ₹1,80,000",
          cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Pre-Wedding Shoot",
            "Wedding Photography",
            "Candid Photography",
            "Traditional Photography",
            "Wedding Albums & Drone Coverage"
          ]),
          packages: JSON.stringify([
            {
              name: "Classic",
              price: "₹45,000",
              description: "Full day candid & traditional coverage with master digital album.",
              features: [
                "1 Candid Photographer + 1 Traditional",
                "Full Wedding Day Coverage",
                "300+ Color-Graded High-Res Photos",
                "Custom Hardcover Coffee Table Album (40 Pages)"
              ]
            },
            {
              name: "Premium",
              price: "₹85,000",
              description: "Complete 2-day wedding & sangeet coverage with cinematic portraits.",
              features: [
                "2 Candid + 2 Traditional Photographers",
                "Pre-Wedding Outdoor Shoot Included",
                "Full Drone Aerial Photography",
                "Two Premium Leather-Bound Wedding Albums",
                "Private Cloud Gallery for Guests"
              ]
            },
            {
              name: "Cinematic Luxury",
              price: "₹1,40,000",
              description: "All-inclusive multi-day celebration package with prime crew.",
              features: [
                "Senior Creative Lead + 4 Photographers",
                "Pre-Wedding Concept Shoot (2 Outfits)",
                "Full Drone Coverage for All Ceremonies",
                "3 Luxury Hardbound Albums + Mini Parent Albums",
                "Same-Day Teaser Delivery"
              ]
            }
          ]),
          tags: JSON.stringify(["Candid", "Wedding", "Pre-Wedding", "Cinematic"]),
          is_featured: true
        },
        {
          categorySlug: "photography",
          name: "Forever Frames",
          tagline: "Fine art wedding memories crafted with heartfelt elegance",
          description: "Specializing in destination weddings, royal ceremonies, and intimate pre-wedding portraits across South India.",
          about: "Forever Frames brings together award-winning visual artists devoted to celebrating love. With a contemporary editorial style, we preserve every smile, tear, and joyful twirl with supreme care.",
          location: "Hyderabad, Telangana",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 98490 23456",
          email: "contact@foreverframes.in",
          rating: 4.8,
          review_count: 62,
          starting_price: 50000,
          price_range: "₹50,000 - ₹2,00,000",
          cover_image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Wedding Photography",
            "Pre-Wedding Photography",
            "Candid Photography",
            "Traditional Photography"
          ]),
          packages: JSON.stringify([
            {
              name: "Silver Moments",
              price: "₹50,000",
              description: "Single day candid and traditional photography.",
              features: ["2 Photographers", "High-Resolution Edited Files", "1 Photobook"]
            },
            {
              name: "Gold Heritage",
              price: "₹95,000",
              description: "Multi-day coverage with pre-wedding portrait session.",
              features: ["3 Photographers", "Pre-Wedding Shoot", "Drone Stills", "2 Designer Albums"]
            }
          ]),
          tags: JSON.stringify(["Wedding", "Candid", "Traditional", "Pre-Wedding"]),
          is_featured: true
        },
        {
          categorySlug: "photography",
          name: "Royal Lens Photography",
          tagline: "Regal portraiture and vivid traditional wedding documentation",
          description: "Delivering vibrant cultural colors and crisp portraits for South Indian rituals and grand receptions.",
          about: "Royal Lens Photography has covered over 300 traditional South Indian weddings. We honor customs and family rituals while infusing modern lighting and creative flair.",
          location: "Vijayawada, Andhra Pradesh",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          phone: "+91 97010 34567",
          email: "info@royallens.com",
          rating: 4.7,
          review_count: 51,
          starting_price: 35000,
          price_range: "₹35,000 - ₹1,20,000",
          cover_image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Traditional Photography",
            "Candid Moments",
            "Wedding Albums",
            "Pre-Wedding Shoots"
          ]),
          packages: JSON.stringify([
            {
              name: "Classic Rituals",
              price: "₹35,000",
              description: "Muhurtham and reception coverage.",
              features: ["2 Photographers", "Full ritual coverage", "Hardcover album"]
            }
          ]),
          tags: JSON.stringify(["Traditional", "Wedding", "Candid"]),
          is_featured: false
        },
        {
          categorySlug: "videography",
          name: "CineSoul Wedding Films",
          tagline: "Blockbuster cinematic films celebrating true love stories",
          description: "High-definition 4K cinematic wedding cinema, emotional teaser trailers, and drone cinematography.",
          about: "At CineSoul, we treat your wedding like a motion picture. Our team of cinematographers and sound designers curate films that evoke tears of joy for generations.",
          location: "Hyderabad, Telangana",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 98485 55678",
          email: "films@cinesoul.in",
          rating: 4.9,
          review_count: 73,
          starting_price: 60000,
          price_range: "₹60,000 - ₹2,50,000",
          cover_image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Cinematic Wedding Films",
            "Pre-Wedding Films",
            "Wedding Videography",
            "4K Drone Cinematography"
          ]),
          packages: JSON.stringify([
            {
              name: "Cinematic Highlight",
              price: "₹60,000",
              description: "3-5 minute 4K cinematic wedding highlight film.",
              features: ["2 Cinematographers", "4K Video Editing", "Licensed Soundtrack", "Social Media Teaser"]
            },
            {
              name: "Full Feature Film",
              price: "₹1,20,000",
              description: "Complete 20-30 minute wedding documentary film + 4K Teaser.",
              features: ["3 Cinematographers + Drone Operator", "Pre-Wedding Love Story Video", "4K Master Delivery"]
            }
          ]),
          tags: JSON.stringify(["Cinematic", "Wedding Films", "Pre-Wedding Films"]),
          is_featured: true
        },
        {
          categorySlug: "makeup-beauty",
          name: "Elegance Bridal Studio",
          tagline: "Exquisite HD and Airbrush bridal transformations",
          description: "Celebrity bridal makeup artist providing long-lasting HD makeup, hair styling, and groom grooming.",
          about: "Led by certified international makeup artist Ananya Reddy, Elegance Bridal Studio is known for natural, luminous skin, defined eyes, and graceful traditional draping.",
          location: "Visakhapatnam, Andhra Pradesh",
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          phone: "+91 99887 76655",
          email: "glam@elegancebridal.in",
          rating: 4.9,
          review_count: 96,
          starting_price: 18000,
          price_range: "₹18,000 - ₹65,000",
          cover_image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Bridal Makeup (HD & Airbrush)",
            "Groom Grooming",
            "Hair Styling & Extensions",
            "Saree Draping & Dupatta Setting"
          ]),
          packages: JSON.stringify([
            {
              name: "Bridal Glow",
              price: "₹18,000",
              description: "Single event HD bridal makeup and hair styling.",
              features: ["HD Makeup with Luxury Brands", "Intricate Hair Styling", "Saree Draping", "Lashes Included"]
            },
            {
              name: "Royal Bride Package",
              price: "₹38,000",
              description: "Muhurtham + Reception dual look transformation.",
              features: ["Airbrush Waterproof Makeup", "2 Distinct Hairstyles", "Touch-Up Kit", "Family Member Makeup (1 Pax)"]
            }
          ]),
          tags: JSON.stringify(["Bridal Makeup", "Airbrush", "Hair Styling", "Groom Grooming"]),
          is_featured: true
        },
        {
          categorySlug: "wedding-wear",
          name: "Zari & Silk Studio",
          tagline: "Handcrafted pure Kanchipuram silk sarees and bespoke bridal lehengas",
          description: "Premier bridal couture and groom sherwanis blending timeless royal heritage with modern silhouettes.",
          about: "Zari & Silk Studio curates the finest handloom Kanchipuram silks, bridal lehengas, and tailored sherwanis. We offer personalized consultations and custom embroidery.",
          location: "Hyderabad, Telangana",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 91234 56789",
          email: "couture@zarisilk.in",
          rating: 4.8,
          review_count: 58,
          starting_price: 25000,
          price_range: "₹25,000 - ₹3,50,000",
          cover_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Bridal Wear",
            "Groom Wear",
            "Sarees & Lehengas",
            "Custom Tailoring & Blouse Embroidery",
            "Sherwanis & Bandhgalas"
          ]),
          packages: JSON.stringify([
            {
              name: "Bridal Ensemble",
              price: "₹45,000",
              description: "Pure zari bridal saree with custom hand-embroidered blouse.",
              features: ["Authentic Silk Mark Certified", "Custom Maggam Work", "Matching Stole"]
            }
          ]),
          tags: JSON.stringify(["Bridal Wear", "Groom Wear", "Sarees", "Lehengas", "Sherwanis"]),
          is_featured: true
        },
        {
          categorySlug: "jewellery",
          name: "Swarna Sparkle Jewellers",
          tagline: "Heritage gold, diamond, and uncut polki bridal jewellery",
          description: "Certified hallmark temple jewellery, antique choke sets, and radiant diamond bridal collections.",
          about: "With three generations of trust, Swarna Sparkle creates heirloom bridal jewellery that celebrates enduring love. All our ornaments are BIS hallmarked with transparent certification.",
          location: "Visakhapatnam, Andhra Pradesh",
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          phone: "+91 93456 78901",
          email: "info@swarnasparkle.com",
          rating: 4.9,
          review_count: 112,
          starting_price: 50000,
          price_range: "₹50,000 - ₹10,00,000+",
          cover_image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Bridal Jewellery Sets",
            "Gold Jewellery (22KT BIS)",
            "Diamond Jewellery (IGI Certified)",
            "Traditional Temple Jewellery",
            "Custom Bridal Consultation"
          ]),
          packages: JSON.stringify([
            {
              name: "Bridal Solitaire Set",
              price: "₹1,50,000",
              description: "Complete necklace, jhumkas, and maang tikka package.",
              features: ["Hallmark Gold", "Conflict-Free Diamonds", "Certificate of Authenticity", "Lifetime Polish"]
            }
          ]),
          tags: JSON.stringify(["Gold Jewellery", "Diamond Jewellery", "Bridal Jewellery", "Traditional"]),
          is_featured: true
        },
        {
          categorySlug: "wedding-venues",
          name: "Dream Venue & Convention Centre",
          tagline: "Grand air-conditioned convention hall with lush manicured lawns",
          description: "Luxurious marriage hall accommodating up to 2,000 guests, equipped with executive green rooms and ample parking.",
          about: "Dream Venue is Visakhapatnam's premier wedding destination. Featuring 25,000 sq.ft of pillarless banquet space, oceanfront outdoor lawns, and 12 luxury guest rooms, we make dream celebrations a reality.",
          location: "Visakhapatnam, Andhra Pradesh",
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          phone: "+91 98481 99999",
          email: "reservations@dreamvenue.in",
          rating: 4.8,
          review_count: 89,
          starting_price: 150000,
          price_range: "₹1,50,000 - ₹5,00,000",
          cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Marriage Halls",
            "Function Halls",
            "Outdoor Lawns & Resorts",
            "Bridal Suite & Guest Accommodation",
            "Valet Parking & Generator Backup"
          ]),
          packages: JSON.stringify([
            {
              name: "Grand Ballroom",
              price: "₹1,80,000",
              description: "12-hour booking of the main hall with 4 complimentary AC rooms.",
              features: ["Capacity: 1200 Guests", "Full Central AC", "4 Deluxe AC Rooms", "Generator Power Backup"]
            },
            {
              name: "Palatial 24h Access",
              price: "₹3,20,000",
              description: "24-hour access to both the indoor hall and outdoor banquet lawn.",
              features: ["Capacity: 2500 Guests", "Indoor + Outdoor Access", "8 AC Rooms Included", "Valet Parking Team"]
            }
          ]),
          tags: JSON.stringify(["Marriage Halls", "Function Halls", "Resorts", "Outdoor Venues"]),
          is_featured: true
        },
        {
          categorySlug: "decoration",
          name: "Golden Petals Decor",
          tagline: "Spectacular floral mandaps, fairy lights, and themed stage decor",
          description: "Transforming venues into magical fairytales with fresh exotic flowers, brass lamps, and bespoke thematic designs.",
          about: "Golden Petals Decor is celebrated for artistic wedding sets, contemporary cocktail lighting, and magnificent South Indian temple-style mandaps designed to leave guests spellbound.",
          location: "Hyderabad, Telangana",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 97000 88888",
          email: "design@goldenpetals.in",
          rating: 4.9,
          review_count: 67,
          starting_price: 75000,
          price_range: "₹75,000 - ₹4,00,000",
          cover_image: "https://images.unsplash.com/photo-1519225429815-e01ffb0fa011?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1519225429815-e01ffb0fa011?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Wedding Decoration",
            "Stage Decoration",
            "Floral Decoration",
            "Mandap Decoration",
            "Entrance Arch & Pathway Lighting"
          ]),
          packages: JSON.stringify([
            {
              name: "Floral Mandap Classic",
              price: "₹85,000",
              description: "Traditional fresh marigold, jasmine, and rose mandap with backdrop.",
              features: ["Square Temple Mandap", "Stage Carpeting", "Entrance Welcome Arch", "Warm LED Spotlights"]
            },
            {
              name: "Enchanted Fairytale",
              price: "₹1,90,000",
              description: "Complete venue thematic decor with imported blooms and fairy lights.",
              features: ["Grand Stage Backdrop", "Aisle Floral Decor", "Photo Booth Area", "VIP Dining Decor"]
            }
          ]),
          tags: JSON.stringify(["Wedding Decoration", "Mandap Decoration", "Floral Decoration", "Stage Decoration"]),
          is_featured: true
        },
        {
          categorySlug: "catering",
          name: "Royal Feast Catering",
          tagline: "Authentic multi-cuisine wedding feasts and traditional live counters",
          description: "Renowned for delicious traditional banana leaf vegetarian spreads and gourmet royal non-vegetarian buffets.",
          about: "Royal Feast Catering brings 15+ years of culinary mastery to your wedding table. Using pure ghee, farm-fresh ingredients, and stringent hygiene standards, we delight your guests with memorable flavors.",
          location: "Visakhapatnam, Andhra Pradesh",
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          phone: "+91 94401 22334",
          email: "feast@royalfeastcatering.com",
          rating: 4.8,
          review_count: 140,
          starting_price: 450,
          price_range: "₹450 - ₹1,200 per plate",
          cover_image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Traditional Banana Leaf Feast",
            "Vegetarian Multi-Cuisine Catering",
            "Non-Vegetarian Royal Buffet",
            "Live Sweet & Chat Counters",
            "Beverage & Mocktail Bars"
          ]),
          packages: JSON.stringify([
            {
              name: "Traditional South Indian (Pure Veg)",
              price: "₹450 / plate",
              description: "32-item authentic Andhra/South Indian wedding feast on banana leaf.",
              features: ["3 Starters", "3 Sweets including Hot Jalebi/Pootharekulu", "4 Curries & Sambar", "Traditional Ice Cream"]
            },
            {
              name: "Royal Grand Buffet",
              price: "₹850 / plate",
              description: "Lavish multi-cuisine spread with live interactive dessert & chat stations.",
              features: ["5 Starters", "Biryani & Continental Station", "Live Dosa & Tawa Counter", "Assorted Gourmet Desserts"]
            }
          ]),
          tags: JSON.stringify(["Vegetarian Catering", "Non-Vegetarian Catering", "Traditional Catering", "Wedding Catering"]),
          is_featured: true
        },
        {
          categorySlug: "mehendi",
          name: "Henna by Ayesha",
          tagline: "Fine organic bridal henna artist with dark stain guarantee",
          description: "Bespoke bridal portraits, Radha-Krishna motifs, Arabic patterns, and fast festive designs for guests.",
          about: "Ayesha is an acclaimed bridal mehendi artist using 100% natural, chemical-free henna made in-house. Her razor-sharp detailing and exquisite story motifs make every bride's hands a masterpiece.",
          location: "Hyderabad, Telangana",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 99123 44556",
          email: "ayesha@hennadesigns.in",
          rating: 4.9,
          review_count: 78,
          starting_price: 8000,
          price_range: "₹8,000 - ₹30,000",
          cover_image: "https://images.unsplash.com/photo-1560932684-5e552e2894e9?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1560932684-5e552e2894e9?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Bridal Mehendi",
            "Figure & Story Mehendi",
            "Traditional Mehendi",
            "Guest Mehendi Packages"
          ]),
          packages: JSON.stringify([
            {
              name: "Royal Bridal Henna",
              price: "₹12,000",
              description: "Elbow-length bridal mehendi with portrait figures and intricate feet motifs.",
              features: ["100% Natural Organic Cone", "Couple Silhouette Motifs", "Aftercare Essential Oil Included"]
            }
          ]),
          tags: JSON.stringify(["Bridal Mehendi", "Traditional Mehendi", "Modern Designs"]),
          is_featured: false
        },
        {
          categorySlug: "invitations",
          name: "Aura Wedding Invitations",
          tagline: "Luxury boxed wedding cards and animated digital invites",
          description: "Personalized metallic foil invitation suites, eco-friendly seed paper, and WhatsApp video save-the-dates.",
          about: "Aura creates heirloom wedding invitations that set the tone for your grand celebration. From traditional Sanskrit calligraphy to modern minimalist laser-cut boxes, every card is crafted with perfection.",
          location: "Bangalore, Karnataka",
          city: "Bangalore",
          state: "Karnataka",
          phone: "+91 98800 11223",
          email: "orders@auracards.in",
          rating: 4.8,
          review_count: 65,
          starting_price: 15000,
          price_range: "₹15,000 - ₹1,50,000",
          cover_image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Printed Invitations",
            "Digital & Video Invitations",
            "Custom Wedding Stationery",
            "Gift Boxes & Favors"
          ]),
          packages: JSON.stringify([
            {
              name: "Digital Royal Suite",
              price: "₹15,000",
              description: "Custom animated video invite + PDF with live map and RSVP integration.",
              features: ["Bespoke Illustrated Couple", "Multi-Event Itinerary Video", "WhatsApp RSVP Tracking"]
            }
          ]),
          tags: JSON.stringify(["Printed Invitations", "Digital Invitations", "Custom Wedding Invitations"]),
          is_featured: false
        },
        {
          categorySlug: "music-entertainment",
          name: "Rhythm Symphony Live",
          tagline: "Electrifying wedding DJs, traditional nadaswaram, and live band",
          description: "Setting the dance floor on fire with Bollywood DJ sets, classical morning mangalavadyam, and sangeet choreography.",
          about: "Rhythm Symphony delivers unforgettable sound, light, and musical experiences. Our artists include top club DJs, classical percussionists, and anchor emcees who keep the energy soaring.",
          location: "Hyderabad, Telangana",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 97030 66778",
          email: "events@rhythmsymphony.in",
          rating: 4.8,
          review_count: 49,
          starting_price: 35000,
          price_range: "₹35,000 - ₹1,50,000",
          cover_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Wedding DJ & Club Setup",
            "Live Sangeet Band",
            "Traditional Nadaswaram & Shenai",
            "Intelligent Sound & Beam Lighting"
          ]),
          packages: JSON.stringify([
            {
              name: "Sangeet DJ Blast",
              price: "₹45,000",
              description: "High-power sound system, DJ console, LED lights, and fog machine.",
              features: ["Top Sangeet DJ", "JBL 10KW Sound Setup", "Sharpy Beam Lights", "Wireless Mics & Emcee"]
            }
          ]),
          tags: JSON.stringify(["DJ", "Live Music", "Traditional Music", "Wedding Entertainment"]),
          is_featured: false
        },
        {
          categorySlug: "honeymoon-travel",
          name: "Serene Horizon Holidays",
          tagline: "Curated romantic honeymoon escapes and luxury resort itineraries",
          description: "Handcrafted honeymoon packages to Maldives, Bali, Switzerland, Kashmir, and Kerala backwaters.",
          about: "Serene Horizon specializes exclusively in romantic couples' travel. We take care of flights, 5-star private pool villas, candlelight dinners on the beach, and visa assistance so you can focus on romance.",
          location: "Visakhapatnam, Andhra Pradesh",
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          phone: "+91 98488 44332",
          email: "honeymoon@serenehorizon.com",
          rating: 4.9,
          review_count: 81,
          starting_price: 65000,
          price_range: "₹65,000 - ₹4,50,000",
          cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          portfolio_images: JSON.stringify([
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
          ]),
          services_offered: JSON.stringify([
            "Honeymoon Packages",
            "Custom Travel Planning",
            "Resort & Water Villa Bookings",
            "Candlelight Beach Dinners",
            "Visa & Flight Coordination"
          ]),
          packages: JSON.stringify([
            {
              name: "Kerala Backwater Bliss",
              price: "₹65,000",
              description: "5 Days / 4 Nights luxury private houseboat and Munnar hill resort.",
              features: ["Private Luxury Houseboat", "All Meals Included", "Couples Ayurvedic Spa", "Private Chauffeur Car"]
            },
            {
              name: "Maldives Overwater Villa",
              price: "₹1,85,000",
              description: "4 Nights All-Inclusive in an overwater bungalow with sea plane transfers.",
              features: ["All-Inclusive Dining & Drinks", "Free Sunset Cruise", "Snorkeling Tour", "Floating Breakfast"]
            }
          ]),
          tags: JSON.stringify(["Honeymoon Packages", "Travel Planning", "Resort Packages"]),
          is_featured: true
        }
      ];

      for (const p of providers) {
        const catId = catMap[p.categorySlug];
        if (!catId) continue;

        await connection.query(
          `INSERT INTO services 
            (category_id, name, tagline, description, about, location, city, state, phone, email, rating, review_count, starting_price, price_range, cover_image, portfolio_images, services_offered, packages, tags, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            catId,
            p.name,
            p.tagline,
            p.description,
            p.about,
            p.location,
            p.city,
            p.state,
            p.phone,
            p.email,
            p.rating,
            p.review_count,
            p.starting_price,
            p.price_range,
            p.cover_image,
            p.portfolio_images,
            p.services_offered,
            p.packages,
            p.tags,
            p.is_featured ? 1 : 0
          ]
        );
      }
      console.log(`✓ ${providers.length} Sample service providers seeded successfully.`);
    }

    console.log("Services database schema initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Services database schema:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  initServicesDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initServicesDatabase };
