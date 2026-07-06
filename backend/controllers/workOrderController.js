import WorkOrder from "../models/WorkOrder.js";
import { postWorkOrderReimbursement } from "../services/expenseIntegrationService.js";

export const getAllWorkOrders = async (req, res) => {
  try {
    const { search, product, status } = req.query;
    const query = {};
    if (status && status !== "ALL") query.status = status;
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: "i" } },
        { assetId: { $regex: search, $options: "i" } },
        { assetName: { $regex: search, $options: "i" } },
        { complaintType: { $regex: search, $options: "i" } },
        { complaintTitle: { $regex: search, $options: "i" } },
      ];
    }
    if (product) query.assetName = { $regex: product, $options: "i" };
    const workOrders = await WorkOrder.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: workOrders.length, workOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error: Failed to fetch work orders.", error: error.message });
  }
};

export const getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ success: false, message: "Work Order/Complaint not found." });
    res.status(200).json({ success: true, workOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error: Failed to retrieve work order.", error: error.message });
  }
};

export const createWorkOrder = async (req, res) => {
  try {
    const {
      assetId,
      assetName,
      complaintType,
      complaintTitle,
      priority,
      raisedBy,
      raisedByEmail,
      employeeEmail,
      status,
      assignedTo,
      workOrderSelection,
      workOrderCost,
      invoiceNumber,
      tasks,
      checklists,
    } = req.body;

    const count = await WorkOrder.countDocuments();
    const complaintId = `Comp ID - ${count + 1}`;
    const workOrder = await WorkOrder.create({
      complaintId,
      complaintDate: new Date(),
      assetId: assetId || "Asset ID - Unknown",
      assetName: assetName || "Unknown Asset",
      complaintType: complaintType || "Maintenance",
      complaintTitle: complaintTitle || "",
      priority: priority || "Medium",
      raisedBy: raisedBy || req.user?.name || "System",
      raisedByEmail: raisedByEmail || req.user?.email || "",
      employeeEmail: employeeEmail || req.user?.email || "",
      status: status || "Open",
      assignedTo: assignedTo || "",
      workOrderSelection: workOrderSelection || "",
      workOrderCost: workOrderCost || 0,
      invoiceNumber: invoiceNumber || "",
      tasks: tasks || [],
      checklists: checklists || [],
    });

    res.status(201).json({ success: true, message: "Successfully created work order.", workOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error: Failed to create work order.", error: error.message });
  }
};

export const updateWorkOrder = async (req, res) => {
  try {
    const {
      priority,
      assignedTo,
      workOrderSelection,
      workOrderCost,
      invoiceNumber,
      tasks,
      checklists,
      status,
      raisedByEmail,
      employeeEmail,
    } = req.body;

    let workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ success: false, message: "Work Order not found." });

    let computedStatus = status || workOrder.status;
    if (!status && assignedTo && workOrder.status === "Open") computedStatus = "In Progress";

    workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          priority: priority || workOrder.priority,
          assignedTo: assignedTo !== undefined ? assignedTo : workOrder.assignedTo,
          workOrderSelection: workOrderSelection !== undefined ? workOrderSelection : workOrder.workOrderSelection,
          workOrderCost: workOrderCost !== undefined ? Number(workOrderCost) : workOrder.workOrderCost,
          invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : workOrder.invoiceNumber,
          tasks: tasks !== undefined ? tasks : workOrder.tasks,
          checklists: checklists !== undefined ? checklists : workOrder.checklists,
          raisedByEmail: raisedByEmail !== undefined ? raisedByEmail : workOrder.raisedByEmail,
          employeeEmail: employeeEmail !== undefined ? employeeEmail : workOrder.employeeEmail,
          status: computedStatus,
        },
      },
      { new: true, runValidators: true }
    );

    let reimbursementPost = null;
    if (workOrder.status === "Completed") {
      reimbursementPost = await postWorkOrderReimbursement(workOrder);
      if (reimbursementPost) {
        workOrder.expenseIntegration = { ...(workOrder.expenseIntegration || {}), reimbursement: reimbursementPost };
        await workOrder.save();
      }
    }

    res.status(200).json({ success: true, message: "Work Order updated successfully.", reimbursementPost, workOrder });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: "Server Error: Failed to update work order.", error: error.message, details: error.data || undefined });
  }
};
