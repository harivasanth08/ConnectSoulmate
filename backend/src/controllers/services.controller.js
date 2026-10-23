const {
  getCategories,
  getCategoryBySlug,
  getServices,
  getServiceById,
  createEnquiry,
  getDistinctLocations,
} = require("../services/services.service");

/**
 * Controller for Services V1.
 */

async function listCategoriesController(req, res) {
  try {
    const { mode } = req.query;
    const categories = await getCategories(mode);

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error listing service categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
    });
  }
}

async function getCategoryController(req, res) {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Category slug is required",
      });
    }

    const category = await getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category details",
    });
  }
}

async function listServicesController(req, res) {
  try {
    const { category, location, search, tag, featured, limit, offset } = req.query;

    const result = await getServices({
      category,
      location,
      search,
      tag,
      featured,
      limit: limit ? Math.min(Number(limit), 100) : 50,
      offset: offset ? Number(offset) : 0,
    });

    return res.status(200).json({
      success: true,
      total: result.total,
      services: result.services,
    });
  } catch (error) {
    console.error("Error listing services:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service providers",
    });
  }
}

async function getServiceDetailsController(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid service ID is required",
      });
    }

    const service = await getServiceById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Error fetching service details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service details",
    });
  }
}

async function submitEnquiryController(req, res) {
  try {
    const serviceId = Number(req.params.id);
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid service ID is required",
      });
    }

    const { name, phone, email, message } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid full name (2 to 100 characters).",
      });
    }

    // Phone validation: Indian standard or international 10-15 digits
    const cleanedPhone = (phone || "").replace(/[\s\-\(\)\+]/g, "");
    if (!phone || typeof phone !== "string" || cleanedPhone.length < 10 || cleanedPhone.length > 15 || !/^\d+$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact phone number with at least 10 digits.",
      });
    }

    // Optional email validation
    if (email && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!message || typeof message !== "string" || message.trim().length < 5 || message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Please provide an enquiry message between 5 and 2000 characters.",
      });
    }

    const userId = req.user ? req.user.userId : null;

    const result = await createEnquiry({
      serviceId,
      userId,
      name,
      phone,
      email,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been sent successfully. The service provider can contact you regarding your requirements.",
      enquiryId: result.enquiryId,
      serviceName: result.serviceName,
    });
  } catch (error) {
    console.error("Error submitting service enquiry:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit enquiry. Please try again.",
    });
  }
}

async function listLocationsController(req, res) {
  try {
    const locations = await getDistinctLocations();
    return res.status(200).json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Error listing locations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
}

module.exports = {
  listCategoriesController,
  getCategoryController,
  listServicesController,
  getServiceDetailsController,
  submitEnquiryController,
  listLocationsController,
};
