import Asset from "../models/Asset.js";
import { postAssetDepreciationExpense } from "../services/expenseIntegrationService.js";

const normalizeAssetRequest = (item = {}) => String(item.assetId || item.id || item._id || "").trim();

export const getAvailableAssetsForTravel = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { assetStatus: "AVAILABLE", recordType: { $ne: "REQUEST" } };
    if (category) query.category = { $regex: category, $options: "i" };
    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: "i" } },
        { assetCode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    const assets = await Asset.find(query).sort({ assetName: 1 }).limit(100);
    res.json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignTravelAssetsFromExpense = async (req, res) => {
  try {
    const { travelId, travelRequestId, employeeName, employeeEmail, employeeId, department, expectedReturn, assets = [] } = req.body;
    if (!travelId && !travelRequestId) {
      return res.status(400).json({ success: false, message: "travelId or travelRequestId is required" });
    }
    if (!Array.isArray(assets) || !assets.length) {
      return res.status(400).json({ success: false, message: "At least one asset is required" });
    }

    const assignments = [];
    for (const item of assets) {
      const assetId = normalizeAssetRequest(item);
      if (!assetId) {
        assignments.push({ assetId: null, assigned: false, message: "Missing assetId" });
        continue;
      }

      const asset = await Asset.findOne({ _id: assetId, assetStatus: "AVAILABLE" });
      if (!asset) {
        assignments.push({ assetId, assigned: false, message: "Asset is not available" });
        continue;
      }

      asset.assetStatus = "ASSIGNED";
      asset.assignedTo = employeeName || employeeEmail || employeeId || "Travel Employee";
      asset.employeeEmail = employeeEmail || asset.employeeEmail;
      asset.employeeId = employeeId || asset.employeeId;
      asset.department = department || asset.department;
      asset.assignedDate = new Date();
      asset.assignedBy = "Expense Travel Approval";
      asset.expectedReturn = expectedReturn ? new Date(expectedReturn) : asset.expectedReturn;
      asset.travelAssignment = {
        travelId,
        travelRequestId,
        expectedReturn: expectedReturn ? new Date(expectedReturn) : undefined,
        assignedFor: employeeName || employeeEmail || employeeId || "Travel Employee",
      };
      asset.lifecycleTimeline.push({
        title: "Travel Assignment",
        detail: `Assigned for travel request ${travelId || travelRequestId}.`,
        date: new Date(),
      });
      await asset.save();
      assignments.push({ assetId, assetName: asset.assetName, assetCode: asset.assetCode, assigned: true });
    }

    const assignedCount = assignments.filter((item) => item.assigned).length;
    res.json({ success: assignedCount > 0, assignedCount, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postDepreciationForAssets = async (req, res) => {
  try {
    const period = req.body.period || new Date().toISOString().slice(0, 7);
    const assets = await Asset.find({
      recordType: { $ne: "REQUEST" },
      price: { $gt: 0 },
      assetStatus: { $nin: ["RETIRED", "DISPOSED", "RECYCLED"] },
      "depreciationPostings.period": { $ne: period },
    }).sort({ createdAt: 1 });

    const postings = [];
    for (const asset of assets) {
      const result = await postAssetDepreciationExpense({ asset, period });
      if (!result) continue;
      const expense = result.expense || result.data?.expense;
      asset.depreciationPostings.push({
        period,
        postedAt: new Date(),
        expenseId: expense?._id || expense?.id || "",
        amount: expense?.amount || 0,
        status: result.success === false ? "failed" : "posted",
      });
      await asset.save();
      postings.push({ assetId: asset._id, assetName: asset.assetName, result });
    }

    res.json({ success: true, period, count: postings.length, postings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
