const trim = (value) => String(value || "").replace(/\/+$/, "");

export const integrationConfig = {
  expenseApiBaseUrl: trim(process.env.EXPENSE_API_BASE_URL || "http://localhost:5000/api"),
  serviceToken: process.env.INTEGRATION_SERVICE_TOKEN || process.env.ASSET_EXPENSE_INTEGRATION_TOKEN || "asset-expense-dev-token",
  companyId: process.env.EXPENSE_COMPANY_ID || process.env.INTEGRATION_DEFAULT_COMPANY_ID || "",
  blockOverBudget: String(process.env.BLOCK_ASSET_PO_OVER_BUDGET || "true").toLowerCase() !== "false"
};

export const callExpenseIntegration = async (path, payload = {}, { method = "POST", tolerateFailure = false } = {}) => {
  const url = `${integrationConfig.expenseApiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-integration-token": integrationConfig.serviceToken,
        "x-source-system": "asset-management"
      },
      body: method === "GET" ? undefined : JSON.stringify({ companyId: integrationConfig.companyId, ...payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || data.message || `Expense integration failed (${response.status})`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (error) {
    if (tolerateFailure) {
      return { success: false, error: error.message, data: error.data || null };
    }
    throw error;
  }
};

const productCategory = (products = []) => {
  const text = products.map((item) => item.productName).join(" ").toLowerCase();
  if (text.includes("software") || text.includes("license")) return "Software";
  if (text.includes("chair") || text.includes("table") || text.includes("office")) return "Office Supplies";
  return "Software";
};

export const checkPurchaseOrderBudget = async ({ purchaseOrder, department }) => {
  const result = await callExpenseIntegration("/integrations/assets/budget-check", {
    sourceType: "purchase_order",
    sourceId: String(purchaseOrder?._id || purchaseOrder?.poNumber || "draft"),
    poNumber: purchaseOrder?.poNumber,
    amount: Number(purchaseOrder?.netTotal || 0),
    department: department || purchaseOrder?.department || purchaseOrder?.shippingAddress?.department || "Operations",
    date: purchaseOrder?.purchaseOrderDate || new Date()
  }, { tolerateFailure: true });

  if (result?.success === false) {
    return {
      allowed: true,
      budgetFound: false,
      integrationWarning: result.error || "Expense budget check unavailable",
      message: "Budget check unavailable; purchase is allowed with warning."
    };
  }

  return result;
};

export const syncVendorToExpense = async (vendor = {}, metadata = {}) => {
  if (!vendor?.orgName && !vendor?.name) return null;
  return callExpenseIntegration("/integrations/assets/vendors", {
    sourceId: vendor.email || vendor.phone || vendor.orgName || vendor.name,
    orgName: vendor.orgName || vendor.name,
    name: vendor.orgName || vendor.name,
    contactPerson: vendor.contactPerson,
    email: vendor.email,
    phone: vendor.phone,
    metadata
  }, { tolerateFailure: true });
};

export const postPurchaseOrderExpense = async (purchaseOrder) => {
  return callExpenseIntegration("/integrations/assets/expenses", {
    sourceType: "purchase_order",
    sourceId: String(purchaseOrder._id),
    poNumber: purchaseOrder.poNumber,
    amount: Number(purchaseOrder.netTotal || purchaseOrder.subTotal || 0),
    taxAmount: Number(purchaseOrder.tax || 0),
    category: productCategory(purchaseOrder.products),
    merchant: purchaseOrder.vendor?.orgName || "Asset Vendor",
    vendorName: purchaseOrder.vendor?.orgName,
    expenseDate: purchaseOrder.purchaseOrderDate || purchaseOrder.updatedAt || new Date(),
    description: `Capital expenditure for asset purchase order ${purchaseOrder.poNumber}`,
    metadata: {
      products: purchaseOrder.products,
      raisedBy: purchaseOrder.raisedBy,
      status: purchaseOrder.status
    }
  }, { tolerateFailure: true });
};

export const postWorkOrderReimbursement = async (workOrder) => {
  if (!(Number(workOrder.workOrderCost || 0) > 0) || workOrder.status !== "Completed") return null;
  return callExpenseIntegration("/integrations/assets/expenses", {
    sourceType: "maintenance_reimbursement",
    sourceId: String(workOrder._id),
    workOrderId: workOrder.complaintId,
    assetId: workOrder.assetId,
    assetName: workOrder.assetName,
    amount: Number(workOrder.workOrderCost || 0),
    category: "Office Supplies",
    merchant: workOrder.assignedTo || "Asset Maintenance",
    invoiceNumber: workOrder.invoiceNumber || "",
    employeeEmail: workOrder.employeeEmail || workOrder.raisedByEmail || "",
    expenseDate: workOrder.updatedAt || new Date(),
    description: `Maintenance reimbursement for ${workOrder.assetName || workOrder.assetId}: ${workOrder.complaintTitle || workOrder.complaintType || "Work order"}`,
    metadata: {
      complaintId: workOrder.complaintId,
      raisedBy: workOrder.raisedBy,
      assignedTo: workOrder.assignedTo,
      invoiceNumber: workOrder.invoiceNumber,
      complaintType: workOrder.complaintType
    }
  }, { tolerateFailure: true });
};

export const postAssetDepreciationExpense = async ({ asset, period }) => {
  const price = Number(asset.price || 0);
  if (!(price > 0)) return null;
  const usefulLifeMonths = Number(asset.customFields?.usefulLifeMonths || process.env.DEFAULT_ASSET_USEFUL_LIFE_MONTHS || 36);
  const amount = Math.round((price / Math.max(1, usefulLifeMonths)) * 100) / 100;
  if (!(amount > 0)) return null;

  return callExpenseIntegration("/integrations/assets/expenses", {
    sourceType: "asset_depreciation",
    sourceId: `${asset._id}:${period}`,
    assetId: String(asset._id),
    assetName: asset.assetName,
    amount,
    category: "Office Supplies",
    merchant: "Asset Depreciation",
    expenseDate: new Date(),
    description: `Monthly depreciation for ${asset.assetName || asset.assetCode || asset._id}`,
    consumeBudget: false,
    depreciationPeriod: period,
    metadata: {
      assetCode: asset.assetCode,
      originalPrice: price,
      usefulLifeMonths
    }
  }, { tolerateFailure: true });
};
