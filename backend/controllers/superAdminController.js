import Company from "../models/Company.js";
import User from "../models/User.js";
import Asset from "../models/Asset.js";

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCompanies = await Company.countDocuments({ isDeleted: { $ne: true } });
    const activeCompanies = await Company.countDocuments({ isDeleted: { $ne: true }, status: "Active" });
    const inactiveCompanies = await Company.countDocuments({ isDeleted: { $ne: true }, status: "Inactive" });
    const createdToday = await Company.countDocuments({ 
      isDeleted: { $ne: true },
      createdAt: { $gte: today }
    });
    
    const recentCompanies = await Company.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("companyName status createdAt email");

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        createdToday,
        recentCompanies
      },
    });
  } catch (error) {
    console.error("Get Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard data",
      data: null,
    });
  }
};
