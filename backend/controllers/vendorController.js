import Vendor from "../models/Vendor.js";

export const listVendors = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== "SUPER_ADMIN" && req.user.companyId) {
      query.companyId = req.user.companyId;
    }
    const vendors = await Vendor.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVendor = async (req, res) => {
  try {
    const { name, contact, email, phone, address, reliability } = req.body;

    if (!name || !contact || !email) {
      return res.status(400).json({ success: false, message: "Vendor name, contact person, and email are required" });
    }

    const vendorPayload = {
      name,
      contactPerson: contact,
      email,
      phone: phone || "N/A",
      address: address || "N/A",
      reliability: reliability || "High",
      totalOrders: 0,
      suppliedAssets: [],
    };

    if (req.user.role !== "SUPER_ADMIN" && req.user.companyId) {
      vendorPayload.companyId = req.user.companyId;
    }

    const newVendor = await Vendor.create(vendorPayload);
    res.status(201).json({ success: true, vendor: newVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
