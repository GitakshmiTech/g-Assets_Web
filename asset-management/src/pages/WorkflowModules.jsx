import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAssetList,
  refreshQrCodes,
  seedWarrantyMaintenanceDemo,
  updateAsset,
} from "../store/slices/assetSlice";
import {
  AssetLink,
  DataTable,
  KpiGrid,
  MiniBars,
  PageTitle,
} from "../components/common/ModuleComponents";
import {
  buildStats,
  currency,
  dateText,
  getInventoryAssets,
  groupByCount,
  repairCost,
  warrantyDays,
} from "../utils/assetUtils";
import { useToast } from "../components/toast/toastStore";
import { fetchRecommendedScanBaseUrl, getQrClientOrigin, getScanBaseUrl } from "../apis/apiConfig";
import apiInstance from "../apis/apiConfig";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { getOffices, saveOffice, deleteOffice } from "../utils/officeStore";
import { createRole, deleteRole, fetchRoles, updateRole } from "../utils/roleApi";
import { formatAccessLabels, MENU_ACCESS_OPTIONS, parseAccessLabels, PERMISSION_OPTIONS } from "../utils/permissions";
import { exportReportCsv, exportReportPdf, exportReportWord } from "../utils/reportExport";
import { pushAppNotification } from "../utils/notificationStore";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import PermissionGrid from "../components/common/PermissionGrid";
import { usePermissions } from "../hooks/usePermissions";
import "./RolesPage.css";
import "./WorkOrdersPage.css";

const assetColumns = [
  { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
  { key: "assetCode", label: "Code" },
  { key: "assetStatus", label: "Status" },
  { key: "assignedTo", label: "Assigned To", render: (row) => row.assignedTo?.name || row.assignedTo || "-" },
  {
    key: "travelAssignment",
    label: "Assignment Source",
    render: (row) => row.travelAssignment?.travelId ? `Travel ${row.travelAssignment.travelId}` : "-",
  },
  { key: "officeName", label: "Office" },
  { key: "department", label: "Department" },
];

const maintenanceDue = (asset) => {
  if (!asset.purchaseDate || !asset.maintenancePeriod) return null;
  const dueDate = new Date(asset.purchaseDate);
  const period = Number(asset.maintenancePeriod);
  if (isNaN(period) || period <= 0) return null;
  dueDate.setMonth(dueDate.getMonth() + period);

  while (dueDate < new Date()) {
    dueDate.setMonth(dueDate.getMonth() + period);
  }

  return dueDate;
};

const maintenanceStatus = (asset) => {
  const dueDate = maintenanceDue(asset);
  if (!dueDate) return "Not configured";
  const days = Math.ceil((dueDate - new Date()) / 86400000);
  if (asset.assetStatus === "UNDER_REPAIR") return "Under repair";
  if (days <= 7) return `Due in ${days} days`;
  return `Next due in ${days} days`;
};

function useDemoLoader() {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  return async () => {
    try {
      const result = await dispatch(seedWarrantyMaintenanceDemo()).unwrap();
      await dispatch(fetchAssetList());
      showToast({
        title: "Demo data loaded",
        message: `${result.count || 0} warranty and maintenance demo records are ready.`,
      });
    } catch (error) {
      showToast({
        title: "Demo load failed",
        message: error || "Unable to load demo warranty and maintenance data.",
        type: "error",
      });
    }
  };
}

export function Requests() {
  const { assetListData } = useModuleData();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const requests = getRequestRecords(assetListData);
  const { hasPermission, isAdmin } = usePermissions();

  const removeRequest = async (id) => {
    const confirmed = window.confirm("Delete this request?");
    if (!confirmed) return;
    try {
      await dispatch(deleteAsset(id)).unwrap();
      showToast({ title: "Request deleted", message: "The request was removed successfully." });
    } catch (error) {
      showToast({
        title: "Delete failed",
        message: error || "Unable to delete this request.",
        type: "error",
      });
    }
  };

  const approve = async (asset, field) => {
    try {
      await dispatch(updateAsset({ id: asset._id, payload: { [field]: "Approved", requestStatus: "Approved" } })).unwrap();
      showToast({
        title: "Request approved",
        message: `${asset.assetName || "Asset request"} approved successfully.`,
      });
    } catch (error) {
      showToast({
        title: "Approval failed",
        message: error || "Unable to approve this request.",
        type: "error",
      });
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Asset Request"
        title="Request & Approval Workflow"
        description="Employee request, manager approval, IT/admin approval, and purchase handoff."
      />
      <KpiGrid 
        action={
          (hasPermission("request.create") || isAdmin) && (
            <button className="module-button" onClick={() => navigate("/add-request")} style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none" }}>Add Request</button>
          )
        }
        items={[
          { label: "Requests", value: requests.length },
          { label: "Pending", value: requests.filter((item) => item.requestStatus !== "Approved").length },
          { label: "Approved", value: requests.filter((item) => item.requestStatus === "Approved").length },
        ]} 
      />
      <DataTable
        columns={[
          { key: "requestId", label: "Request ID" },
          { key: "requestType", label: "Type" },
          { key: "requestedBy", label: "Requested By" },
          { key: "department", label: "Department" },
          { key: "category", label: "Asset Type" },
          { key: "requestPriority", label: "Priority" },
          { key: "managerApproval", label: "Manager" },
          { key: "adminApproval", label: "IT/Admin" },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <div className="module-actions">
                {(hasPermission("request.create") || isAdmin) && (
                  <button className="module-button" onClick={() => navigate(`/edit-request/${row._id}`)}>Edit</button>
                )}
                {(hasPermission("request.approve") || isAdmin) && (
                  <button className="module-button" onClick={() => approve(row, "adminApproval")}>Approve</button>
                )}
                {(hasPermission("request.reject") || isAdmin) && (
                  <button className="module-button danger" onClick={() => removeRequest(row._id)}>Delete</button>
                )}
              </div>
            ),
          },
        ]}
        rows={requests}
      />
    </>
  );
}

export function Inventory() {
  const { assetListData } = useModuleData();
  const inventoryAssets = getInventoryAssets(assetListData);
  const stats = buildStats(assetListData);

  return (
    <>
      <PageTitle eyebrow="Inventory" title="Inventory Tracking" description="Status, office-wise, and category-wise inventory control." />
      <KpiGrid items={[
        { label: "Total", value: stats.total },
        { label: "Available", value: stats.available },
        { label: "Assigned", value: stats.assigned },
        { label: "Repair", value: stats.repair },
      ]} />
      <div className="chart-grid">
        <MiniBars title="Office-wise Assets" data={groupByCount(inventoryAssets, "officeName")} />
        <MiniBars title="Category-wise Assets" data={groupByCount(inventoryAssets, "category")} />
      </div>
      <DataTable columns={assetColumns} rows={inventoryAssets} />
    </>
  );
}

export function Employees() {
  const { assetListData } = useModuleData();
  const { user } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  
  const visibleAssets = user?.role === "EMPLOYEE"
    ? assetListData.filter((asset) => {
        const assignedId = asset.assignedTo?._id || asset.assignedTo?.id || asset.assignedTo;
        const matchesId = assignedId && String(assignedId) === String(user._id || user.id);
        const matchesEmpId = user.employeeId && asset.employeeId && String(asset.employeeId).toLowerCase() === String(user.employeeId).toLowerCase();
        const matchesName = asset.assignedTo?.name && String(asset.assignedTo.name).toLowerCase() === String(user.name).toLowerCase();
        return matchesId || matchesEmpId || matchesName;
      })
    : assetListData;
    
  const employees = useMemo(() => {
    const map = {};
    visibleAssets.forEach((asset) => {
      const employee = asset.assignedTo?.name || asset.assignedTo || asset.ownerName;
      if (!employee) return;
      if (!map[employee]) {
        map[employee] = {
          id: employee,
          employee,
          department: asset.department,
          officeName: asset.officeName,
          assignedAssets: 0,
          repairCost: 0,
        };
      }
      map[employee].assignedAssets += 1;
      map[employee].repairCost += repairCost(asset);
    });
    return Object.values(map);
  }, [visibleAssets]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    assetId: "",
    assetName: "",
    complaintTitle: "",
    incidentImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportForm({ ...reportForm, incidentImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.assetId || !reportForm.complaintTitle) {
      return showToast({ title: "Error", message: "Asset and Issue Description are required.", type: "error" });
    }
    
    setIsSubmitting(true);
    try {
      const response = await apiInstance.post("/work-orders", {
        assetId: reportForm.assetId,
        assetName: reportForm.assetName,
        complaintType: "Damage Report",
        complaintTitle: reportForm.complaintTitle,
        priority: "High",
        raisedBy: user.name,
        raisedByEmail: user.email,
        employeeEmail: user.email,
        incidentImage: reportForm.incidentImage,
      });
      
      if (response.data.success) {
        // Send notification to Admin roles
        pushAppNotification({
          title: "New Damage Report Submitted",
          message: `Employee ${user.name} reported damage on asset: ${reportForm.assetName || "Unknown"}.`,
          type: "info",
          meta: {
            menuLabel: "Work Orders",
            route: "/work-orders",
            targetRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
          }
        });

        showToast({ title: "Report Submitted", message: "Your issue has been reported successfully.", type: "success" });
        setIsReportModalOpen(false);
        setReportForm({ assetId: "", assetName: "", complaintTitle: "", incidentImage: "" });
      }
    } catch (error) {
      showToast({ title: "Error", message: error.response?.data?.message || "Failed to submit report.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmployee = user?.role === "EMPLOYEE";

  const employeeAssetColumns = [
    { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
    { key: "assetCode", label: "Code" },
    { key: "assetStatus", label: "Status", render: (row) => (
      <span className={`status-badge ${row.assetStatus?.toLowerCase()}`}>
        {row.assetStatus}
      </span>
    )},
    { key: "officeName", label: "Office" },
    { key: "department", label: "Department" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          className="action-link-btn"
          style={{ 
            background: "none", 
            border: "none", 
            color: "#ef4444", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            fontWeight: 600,
            padding: 0
          }}
          onClick={() => {
            setReportForm({
              assetId: row._id,
              assetName: row.assetName,
              complaintTitle: "",
              incidentImage: "",
            });
            setIsReportModalOpen(true);
          }}
          disabled={row.assetStatus === "UNDER_REPAIR"}
        >
          <FaExclamationTriangle size={12} /> Report Damage
        </button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PageTitle eyebrow="Employee Portal" title="Employee Assets" description="Assigned assets, ownership, repair access, and warranty visibility." />
        {!isEmployee && (
          <button className="module-button" onClick={() => setIsReportModalOpen(true)} style={{ margin: 0 }}>
            <FaExclamationTriangle style={{ marginRight: "8px" }} /> Report Damage
          </button>
        )}
      </div>
      
      {isEmployee ? (
        <>
          <KpiGrid items={[
            { label: "Assigned Assets", value: visibleAssets.length },
            { label: "Assets Under Repair", value: visibleAssets.filter((a) => a.assetStatus === "UNDER_REPAIR").length },
          ]} />
          <DataTable
            columns={employeeAssetColumns}
            rows={visibleAssets}
          />
        </>
      ) : (
        <>
          <KpiGrid items={[
            { label: "Employees With Assets", value: employees.length },
            { label: "Assigned Assets", value: visibleAssets.filter((asset) => asset.assignedTo).length },
          ]} />
          <DataTable
            columns={[
              { key: "employee", label: "Employee", render: (row) => <span className="text-action" style={{ cursor: "default", textDecoration: "none" }}>{row.employee}</span> },
              { key: "department", label: "Department" },
              { key: "officeName", label: "Office" },
              { key: "assignedAssets", label: "Assets" },
              { key: "repairCost", label: "Repair Cost", render: (row) => currency(row.repairCost) },
            ]}
            rows={employees}
          />
        </>
      )}
      
      {isReportModalOpen && (
        <div className="drawer-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="review-drawer drawer-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-title-block">
                <span className="drawer-badge">New</span>
                <h2>Report Asset Damage</h2>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsReportModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="drawer-form">
              <div className="drawer-body">
                <div className="form-group">
                  <label>Select Asset</label>
                  <select 
                    value={reportForm.assetId}
                    onChange={(e) => {
                      const selected = visibleAssets.find(a => a._id === e.target.value);
                      setReportForm({ ...reportForm, assetId: e.target.value, assetName: selected?.assetName || "" });
                    }}
                    required
                  >
                    <option value="">-- Select an asset --</option>
                    {visibleAssets.map(asset => (
                      <option key={asset._id} value={asset._id}>{asset.assetName} ({asset.assetCode})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Issue Description</label>
                  <textarea 
                    placeholder="Describe what happened..."
                    value={reportForm.complaintTitle}
                    onChange={(e) => setReportForm({ ...reportForm, complaintTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                  {reportForm.incidentImage && (
                    <div className="drawer-image-preview-container">
                      <img src={reportForm.incidentImage} alt="Preview" className="drawer-image-preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="drawer-cancel-btn" onClick={() => setIsReportModalOpen(false)}>Cancel</button>
                <button type="submit" className="drawer-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function Assignments() {
  const { assetListData } = useModuleData();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [assignedBy, setAssignedBy] = useState("Admin");

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await apiInstance.get("/users");
        if (data.success) {
          const mapped = data.users.map((u) => ({
            name: u.name,
            id: u.employeeId || u.id || u._id || "N/A",
            email: u.email,
          }));
          setEmployees(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch employees for dropdown", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (e) => {
    const selectedName = e.target.value;
    setAssignedTo(selectedName);
    const employee = employees.find(emp => emp.name === selectedName);
    if (employee) {
      setEmployeeId(employee.id);
      setEmployeeEmail(employee.email);
    } else {
      setEmployeeId("");
      setEmployeeEmail("");
    }
  };

  const assign = async (event) => {
    event.preventDefault();
    if (!selectedId || !assignedTo) return;
    try {
      await dispatch(updateAsset({
        id: selectedId,
        payload: {
          assignedTo,
          employeeId,
          employeeEmail,
          assignedBy,
          assignedDate: new Date(),
          assetStatus: "ASSIGNED",
        },
      })).unwrap();
      showToast({
        title: "Asset Assigned Successfully!",
        message: `The asset has been properly assigned to ${assignedTo} (${employeeId}). A notification email will be sent to ${employeeEmail}.`,
      });
      setSelectedId("");
      setAssignedTo("");
      setEmployeeId("");
      setEmployeeEmail("");
    } catch (error) {
      showToast({
        title: "Assignment failed",
        message: error || "Unable to assign this asset.",
        type: "error",
      });
    }
  };

  return (
    <>
      <PageTitle eyebrow="Assignments" title="Assign, Transfer & Return Assets" description="Assign assets to employees and use the detail page for transfers and returns." />
      <form className="action-panel" onSubmit={assign}>
        <h3>Quick Assign Asset</h3>
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">Select available asset</option>
          {assetListData.map((asset) => <option value={asset._id} key={asset._id}>{asset.assetName} - {asset.assetCode}</option>)}
        </select>
        <select value={assignedTo} onChange={handleEmployeeChange}>
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option value={emp.name} key={emp.id}>{emp.name}</option>
          ))}
        </select>
        <input placeholder="Employee ID" value={employeeId} readOnly className="custom-input" style={{ backgroundColor: "#f0f0f0" }} />
        <input placeholder="Employee email" value={employeeEmail} readOnly className="custom-input" style={{ backgroundColor: "#f0f0f0" }} />
        <input placeholder="Assigned by" value={assignedBy} onChange={(event) => setAssignedBy(event.target.value)} />
        <button type="submit">Assign Asset</button>
      </form>
      <DataTable columns={assetColumns} rows={assetListData.filter((asset) => asset.assignedTo)} />
    </>
  );
}

export function Maintenance() {
  const { assetListData } = useModuleData();
  const loadDemoData = useDemoLoader();
  const repairs = assetListData.flatMap((asset) =>
    (asset.repairHistory || []).map((repair) => ({
      ...repair,
      assetName: asset.assetName,
      assetCode: asset.assetCode,
      officeName: asset.officeName,
    })),
  );

  return (
    <>
      <PageTitle
        eyebrow="Maintenance"
        title="Tickets & Repair History"
        description="Open tickets, repair spend, vendors, and permanent repair records."
      />
      <KpiGrid 
        action={<button className="module-button" onClick={loadDemoData}>Load Demo Data</button>}
        items={[
          { label: "Tickets", value: repairs.length },
          { label: "Open", value: repairs.filter((item) => item.status !== "COMPLETED").length },
          { label: "Assets Under Repair", value: assetListData.filter((asset) => asset.assetStatus === "UNDER_REPAIR").length },
          { label: "Maintenance Due Soon", value: assetListData.filter((asset) => maintenanceStatus(asset).startsWith("Due in")).length },
          { label: "Repair Spend", value: currency(repairs.reduce((sum, item) => sum + Number(item.repairCost || 0), 0)) },
        ]} 
      />
      <DataTable
        columns={[
          { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
          { key: "assetCode", label: "Code" },
          { key: "maintenancePeriod", label: "Maintenance Period", render: (row) => row.maintenancePeriod ? `${row.maintenancePeriod} months` : "-" },
          { key: "nextMaintenance", label: "Next Maintenance", render: (row) => dateText(maintenanceDue(row)) },
          { key: "maintenanceStatus", label: "Check Result", render: (row) => maintenanceStatus(row) },
          { key: "assetStatus", label: "Asset Status" },
        ]}
        rows={assetListData.filter((asset) => asset.maintenancePeriod || asset.assetStatus === "UNDER_REPAIR")}
        emptyText="No maintenance configuration yet"
      />
      <DataTable
        columns={[
          { key: "ticketId", label: "Ticket" },
          { key: "assetName", label: "Asset" },
          { key: "issue", label: "Issue" },
          { key: "repairDetails", label: "Repair" },
          { key: "vendorName", label: "Vendor" },
          { key: "repairCost", label: "Cost", render: (row) => currency(row.repairCost) },
          { key: "status", label: "Status" },
        ]}
        rows={repairs}
      />
    </>
  );
}

export function Warranty() {
  const { assetListData } = useModuleData();
  const loadDemoData = useDemoLoader();
  const warranties = assetListData
    .filter((asset) => asset.warrantyEnd)
    .map((asset) => {
      const days = warrantyDays(asset);
      let warrantyCheck = "Active";

      if (days < 0) warrantyCheck = "Expired";
      else if (days <= Number(asset.warrantyReminderDays || 10)) warrantyCheck = "Expiring Soon";

      return { ...asset, days, warrantyCheck };
    });

  return (
    <>
      <PageTitle
        eyebrow="Warranty"
        title="Warranty & AMC Alerts"
        description="Expiry tracking and reminder workflow."
      />
      <KpiGrid 
        action={<button className="module-button" onClick={loadDemoData}>Load Demo Data</button>}
        items={[
          { label: "Tracked Warranties", value: warranties.length },
          { label: "Expiring Soon", value: warranties.filter((asset) => asset.days >= 0 && asset.days <= Number(asset.warrantyReminderDays || 10)).length },
          { label: "Expired", value: warranties.filter((asset) => asset.days < 0).length },
          { label: "Active", value: warranties.filter((asset) => asset.warrantyCheck === "Active").length },
        ]} 
      />
      <DataTable
        columns={[
          { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
          { key: "vendor", label: "Vendor" },
          { key: "warrantyStart", label: "Start", render: (row) => dateText(row.warrantyStart) },
          { key: "warrantyEnd", label: "End", render: (row) => dateText(row.warrantyEnd) },
          { key: "days", label: "Days Left" },
          { key: "warrantyReminderDays", label: "Reminder Days" },
          { key: "warrantyCheck", label: "Check Result" },
        ]}
        rows={warranties}
      />
    </>
  );
}

export function Offices() {
  const { assetListData } = useModuleData();
  const { showToast } = useToast();
  const [offices, setOffices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [formData, setFormData] = useState({
    officeName: "",
    branchCode: "",
    city: "",
    state: "",
    contact: ""
  });

  useEffect(() => {
    setOffices(getOffices());
  }, []);

  const handleOpenModal = (office = null) => {
    if (office) {
      setEditingOffice(office);
      setFormData({
        officeName: office.officeName || "",
        branchCode: office.branchCode || "",
        city: office.city || "",
        state: office.state || "",
        contact: office.contact || ""
      });
    } else {
      setEditingOffice(null);
      setFormData({ officeName: "", branchCode: "", city: "", state: "", contact: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffice(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.officeName.trim()) {
      showToast({ title: "Validation Error", message: "Office Name is required.", type: "error" });
      return;
    }

    const saved = saveOffice({
      ...(editingOffice ? { id: editingOffice.id } : {}),
      ...formData
    });
    setOffices(saved);
    showToast({ title: "Success", message: `Office ${editingOffice ? "updated" : "added"} successfully.` });
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this office?")) {
      const updated = deleteOffice(id);
      setOffices(updated);
      showToast({ title: "Deleted", message: "Office deleted successfully." });
    }
  };

  const enrichedOffices = offices.map((office) => {
    const assignedAssets = assetListData.filter((asset) => asset.officeName === office.officeName);
    return {
      ...office,
      count: assignedAssets.length,
      repairCost: assignedAssets.reduce((sum, asset) => sum + repairCost(asset), 0),
    };
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <PageTitle eyebrow="Office Management" title="Branch & Location Control" description="Manage all company branches and locations." />
        <button 
          onClick={() => handleOpenModal()} 
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Office
        </button>
      </div>

      <DataTable
        columns={[
          { key: "officeName", label: "Office Name" },
          { key: "branchCode", label: "Branch Code" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "contact", label: "Contact Person" },
          { key: "count", label: "Assets Assigned" },
          { key: "repairCost", label: "Total Repair Cost", render: (row) => currency(row.repairCost) },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleOpenModal(row)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(row.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
              </div>
            )
          }
        ]}
        rows={enrichedOffices}
      />

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'modalFadeIn 0.3s ease-out' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{editingOffice ? "Edit Office" : "Add New Office"}</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Office Name *</label>
                  <input type="text" value={formData.officeName} onChange={(e) => setFormData({...formData, officeName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. Mumbai Head Office" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Branch Code</label>
                    <input type="text" value={formData.branchCode} onChange={(e) => setFormData({...formData, branchCode: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. HO-01" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Contact Person</label>
                    <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Manager Name" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>City</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>State</label>
                    <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>{editingOffice ? "Update Office" : "Save Office"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function Audit() {
  const { assetListData } = useModuleData();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [verifyingId, setVerifyingId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const auditRows = assetListData.map((asset) => ({
    ...asset,
    lastAudit: asset.auditLogs?.[asset.auditLogs.length - 1],
  }));

  const verifyAsset = async (asset, status = "Verified") => {
    const auditEntry = {
      auditDate: new Date().toISOString(),
      verifiedBy: user?.name || user?.email || "Auditor",
      physicalStatus: status,
      locationVerified: status === "Verified" ? "Yes" : "No",
      notes: `Asset ${status} from Audit Session`,
    };

    try {
      setVerifyingId(asset._id);
      await dispatch(updateAsset({
        id: asset._id,
        payload: {
          auditLogs: [...(asset.auditLogs || []), auditEntry],
          lifecycleTimeline: [
            ...(asset.lifecycleTimeline || []),
            {
              title: `Audit ${status}`,
              detail: `${status} by ${auditEntry.verifiedBy}.`,
              date: new Date().toISOString(),
            },
          ],
        },
      })).unwrap();
      
      await dispatch(fetchAssetList());
      
      // Push Notification
      pushAppNotification({
        title: `Audit: ${status}`,
        message: `${asset.assetName || "Asset"} has been ${status.toLowerCase()} by auditor.`,
        type: status === "Verified" ? "success" : "error",
      });

      showToast({
        title: `Asset ${status}`,
        message: `${asset.assetName || "Asset"} audit status updated.`,
      });
      setSelectedAsset(null);
    } catch (error) {
      showToast({
        title: "Audit action failed",
        message: error || "Unable to update this asset.",
        type: "error",
      });
    } finally {
      setVerifyingId("");
    }
  };

  return (
    <>
      <PageTitle eyebrow="Audit" title="QR Verification & Audit Logs" description="Scan QR codes, verify physical assets, and identify missing inventory." />
      <KpiGrid items={[
        { label: "Assets", value: assetListData.length },
        { label: "Verified", value: auditRows.filter((asset) => asset.lastAudit?.physicalStatus === "Verified").length },
        { label: "Pending", value: auditRows.filter((asset) => !asset.lastAudit).length },
        { label: "Missing/Damaged", value: auditRows.filter((asset) => ["Missing", "Damaged", "Rejected"].includes(asset.lastAudit?.physicalStatus)).length },
      ]} />
      <DataTable
        columns={[
          { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
          { key: "assetCode", label: "Code" },
          { key: "officeName", label: "Office" },
          { key: "lastAudit", label: "Last Status", render: (row) => <span style={{ fontWeight: '500', color: row.lastAudit?.physicalStatus === 'Verified' ? '#10b981' : row.lastAudit?.physicalStatus === 'Rejected' ? '#ef4444' : '#6b7280' }}>{row.lastAudit?.physicalStatus || "Pending"}</span> },
          { key: "auditDate", label: "Audit Date", render: (row) => dateText(row.lastAudit?.auditDate) },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  title="Verify Asset"
                  disabled={verifyingId === row._id || row.lastAudit?.physicalStatus === "Verified"}
                  onClick={() => verifyAsset(row, "Verified")}
                  style={{ 
                    background: row.lastAudit?.physicalStatus === "Verified" ? '#10b981' : '#ecfdf5', 
                    color: row.lastAudit?.physicalStatus === "Verified" ? '#fff' : '#10b981', 
                    border: 'none', borderRadius: '6px', width: '32px', height: '32px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: row.lastAudit?.physicalStatus === "Verified" ? 'default' : 'pointer', 
                    opacity: row.lastAudit?.physicalStatus === "Verified" ? 0.6 : (verifyingId === row._id ? 0.5 : 1),
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (row.lastAudit?.physicalStatus !== "Verified" && verifyingId !== row._id) e.currentTarget.style.background = '#d1fae5'; }}
                  onMouseOut={(e) => { if (row.lastAudit?.physicalStatus !== "Verified" && verifyingId !== row._id) e.currentTarget.style.background = '#ecfdf5'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </button>
                <button
                  title="Reject / Missing"
                  disabled={verifyingId === row._id || row.lastAudit?.physicalStatus === "Rejected"}
                  onClick={() => verifyAsset(row, "Rejected")}
                  style={{ 
                    background: row.lastAudit?.physicalStatus === "Rejected" ? '#ef4444' : '#fef2f2', 
                    color: row.lastAudit?.physicalStatus === "Rejected" ? '#fff' : '#ef4444', 
                    border: 'none', borderRadius: '6px', width: '32px', height: '32px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: row.lastAudit?.physicalStatus === "Rejected" ? 'default' : 'pointer', 
                    opacity: row.lastAudit?.physicalStatus === "Rejected" ? 0.6 : (verifyingId === row._id ? 0.5 : 1),
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (row.lastAudit?.physicalStatus !== "Rejected" && verifyingId !== row._id) e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseOut={(e) => { if (row.lastAudit?.physicalStatus !== "Rejected" && verifyingId !== row._id) e.currentTarget.style.background = '#fef2f2'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </button>
                <button
                  title="View Details"
                  onClick={() => setSelectedAsset(row)}
                  style={{ 
                    background: '#f1f5f9', color: '#64748b', 
                    border: 'none', borderRadius: '6px', width: '32px', height: '32px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            ),
          },
        ]}
        rows={auditRows}
      />

      {/* Modal for viewing asset details before audit action */}
      {selectedAsset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'modalFadeIn 0.3s ease-out' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Audit Verification</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Review asset details before proceeding</p>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#111827' }}>{selectedAsset.assetName}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px', background: '#f3f4f6', color: '#4b5563', fontSize: '12px', fontWeight: '500' }}>{selectedAsset.category || 'N/A'}</span>
                    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px', background: '#ecfdf5', color: '#059669', fontSize: '12px', fontWeight: '500' }}>{selectedAsset.assetStatus || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Asset Code</div>
                  <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{selectedAsset.assetCode || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Serial Number</div>
                  <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{selectedAsset.serialNumber || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Assigned To</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                      {selectedAsset.assignedTo?.name ? selectedAsset.assignedTo.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{selectedAsset.assignedTo?.name || 'Unassigned'}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Location / Office</div>
                  <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{selectedAsset.officeName || 'N/A'}</div>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p style={{ margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.5' }}>
                  <strong>Action Required:</strong> Please physically verify the presence and condition of this asset before making a decision.
                </p>
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button 
                onClick={() => setSelectedAsset(null)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
              >
                Cancel
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => verifyAsset(selectedAsset, "Rejected")}
                  disabled={verifyingId === selectedAsset._id}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', opacity: verifyingId === selectedAsset._id ? 0.7 : 1 }}
                  onMouseOver={(e) => { if (verifyingId !== selectedAsset._id) e.currentTarget.style.background = '#dc2626'; }}
                  onMouseOut={(e) => { if (verifyingId !== selectedAsset._id) e.currentTarget.style.background = '#ef4444'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  Reject / Missing
                </button>
                <button 
                  onClick={() => verifyAsset(selectedAsset, "Verified")}
                  disabled={verifyingId === selectedAsset._id || selectedAsset.lastAudit?.physicalStatus === "Verified"}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', opacity: (verifyingId === selectedAsset._id || selectedAsset.lastAudit?.physicalStatus === "Verified") ? 0.7 : 1 }}
                  onMouseOver={(e) => { if (verifyingId !== selectedAsset._id && selectedAsset.lastAudit?.physicalStatus !== "Verified") e.currentTarget.style.background = '#059669'; }}
                  onMouseOut={(e) => { if (verifyingId !== selectedAsset._id && selectedAsset.lastAudit?.physicalStatus !== "Verified") e.currentTarget.style.background = '#10b981'; }}
                >
                  {verifyingId === selectedAsset._id ? (
                    <>Verifying...</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Verify Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Reports() {
  const { assetListData } = useModuleData();
  const { showToast } = useToast();
  const exportMenuRef = useRef(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const repairs = assetListData.flatMap((asset) => asset.repairHistory || []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleExport = (format) => {
    try {
      if (format === "csv") exportReportCsv(assetListData);
      if (format === "word") exportReportWord(assetListData);
      if (format === "pdf") exportReportPdf(assetListData);
      setExportMenuOpen(false);
      showToast({
        title: "Report exported",
        message: `Asset report downloaded as ${format.toUpperCase()}.`,
        type: "info",
      });
    } catch (error) {
      showToast({
        title: "Export failed",
        message: error?.message || "Unable to export report.",
        type: "error",
      });
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Reports"
        title="Reports & Analytics"
        description="Asset, repair, warranty, and office reports with CSV export."
      />
      <KpiGrid 
        action={(
          <div className="export-dropdown-wrap" ref={exportMenuRef}>
            <button 
              type="button" 
              className="module-button" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                height: "36px", 
                padding: "0 16px", 
                fontSize: "13px", 
                borderRadius: "var(--radius-md)" 
              }} 
              onClick={() => setExportMenuOpen((open) => !open)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export Report</span>
            </button>
            {exportMenuOpen && (
              <div className="export-dropdown-menu">
                <button type="button" onClick={() => handleExport("pdf")}>Download PDF</button>
                <button type="button" onClick={() => handleExport("word")}>Download Word</button>
                <button type="button" onClick={() => handleExport("csv")}>Download CSV</button>
              </div>
            )}
          </div>
        )}
        items={[
          { label: "Total Assets", value: assetListData.length },
          { label: "Total Repair Cost", value: currency(assetListData.reduce((sum, asset) => sum + repairCost(asset), 0)) },
          { label: "Repair Records", value: repairs.length },
        ]} 
      />
      <div className="chart-grid">
        <MiniBars title="Office-wise Asset Count" data={groupByCount(assetListData, "officeName")} />
        <MiniBars title="Category-wise Asset Count" data={groupByCount(assetListData, "category")} />
      </div>
      <DataTable columns={assetColumns} rows={assetListData} />
    </>
  );
}

export function Roles() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ label: "", sidebarAccess: [], permissions: [] });
  const [editingKey, setEditingKey] = useState("");
  const [editForm, setEditForm] = useState({ label: "", sidebarAccess: [], permissions: [] });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(
        data.map((role) => {
          const sidebarAccess = role.sidebarAccess?.length ? role.sidebarAccess : parseAccessLabels(role.access);
          return {
            id: role.key,
            key: role.key,
            role: role.label,
            sidebarAccess,
            permissions: role.permissions || [],
            access: formatAccessLabels(sidebarAccess) || "-",
            isSystem: Boolean(role.isSystem),
          };
        }),
      );
    } catch (error) {
      showToast({ title: "fetchRoles failed", message: String(error.message || error), type: "error" });
      setRoles([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoles();
  }, []);

  const addRole = async (event) => {
    event.preventDefault();
    if (!newRole.label.trim()) {
      showToast({ title: "Role required", message: "Enter a role name.", type: "error" });
      return;
    }
    if (!newRole.sidebarAccess.length) {
      showToast({ title: "Access required", message: "Select at least one visible menu for this role.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      await createRole({
        label: newRole.label.trim(),
        sidebarAccess: newRole.sidebarAccess,
        permissions: newRole.permissions,
      });
      setNewRole({ label: "", sidebarAccess: [], permissions: [] });
      setShowAddRole(false);
      await loadRoles();
      showToast({ title: "Role added", message: "New role is available in registration dropdown." });
    } catch (error) {
      showToast({
        title: "Unable to add role",
        message: error?.response?.data?.message || error?.message || "Try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    setEditingKey(row.key);
    setEditForm({
      label: row.role === "-" ? "" : row.role,
      sidebarAccess: row.sidebarAccess || [],
      permissions: row.permissions || [],
    });
  };

  const cancelEdit = () => {
    setEditingKey("");
    setEditForm({ label: "", sidebarAccess: [], permissions: [] });
  };

  const saveEdit = async (row) => {
    if (!editForm.label.trim()) {
      showToast({ title: "Role required", message: "Enter a role name.", type: "error" });
      return;
    }
    if (!editForm.sidebarAccess.length) {
      showToast({ title: "Access required", message: "Select at least one visible menu for this role.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      await updateRole(row.key, {
        label: editForm.label.trim(),
        sidebarAccess: editForm.sidebarAccess,
        permissions: editForm.permissions,
      });
      cancelEdit();
      await loadRoles();
      showToast({ title: "Role updated", message: "Role changes saved successfully." });
    } catch (error) {
      showToast({
        title: "Unable to update role",
        message: error?.response?.data?.message || error?.message || "Try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async () => {
    const row = deleteTarget;
    if (!row) return;

    setSaving(true);
    try {
      await deleteRole(row.key);
      if (editingKey === row.key) cancelEdit();
      setDeleteTarget(null);
      await loadRoles();
      showToast({ title: "Role deleted", message: "Role removed from the list." });
    } catch (error) {
      showToast({
        title: "Unable to delete role",
        message: error?.response?.data?.message || error?.message || "Try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSelection = (currentSelection, value) => {
    const selected = parseAccessLabels(currentSelection);
    return selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
  };

  const renderAccessPicker = (id, value, onChange) => {
    const options = MENU_ACCESS_OPTIONS;
    const selected = parseAccessLabels(value);
    const selectedLabels = selected.map((item) => options.find((option) => option.label === item))
      .filter(Boolean)
      .map((option) => option.label);
    const summary = selectedLabels.length ? formatAccessLabels(selectedLabels) : "Select visible menus";

    return (
      <details className="role-access-dropdown" style={{ width: "100%", maxWidth: "400px" }}>
        <summary id={id}>
          <span className="role-dropdown-summary-text">{summary}</span>
        </summary>
        <div className="role-access-menu" aria-labelledby={id} style={{ maxHeight: "300px", overflowY: "auto" }}>
          {options.map((option) => (
            <label key={option.label} className="role-access-option">
              <input
                type="checkbox"
                checked={selected.includes(option.label)}
                onChange={() => onChange(updateSelection(value, option.label))}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </details>
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="Roles"
        title="Role-Based Access Control"
        description="Manage role visibility, access scope, and registration options from one place."
      />
      
      <KpiGrid 
        action={
          <button 
            type="button" 
            className="module-button" 
            style={{ backgroundColor: "var(--color-primary)", color: "#fff", border: "none", display: "flex", gap: "8px", alignItems: "center" }}
            onClick={() => setShowAddRole(!showAddRole)}
          >
            {showAddRole ? "Cancel Add Role" : "+ Add New Role"}
          </button>
        }
        items={[
          { label: "Total Roles", value: roles.length },
          { label: "System Roles", value: roles.filter((role) => role.isSystem).length },
          { label: "Custom Roles", value: roles.filter((role) => !role.isSystem).length },
        ]} 
      />

      {showAddRole && (
        <section 
          className="form-section fade-in" 
          style={{ 
            background: "var(--bg-surface)", 
            border: "1px solid var(--border-color)", 
            borderRadius: "var(--radius-lg)", 
            padding: "24px", 
            marginBottom: "24px",
            boxShadow: "var(--shadow-md)"
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "600", color: "var(--text-main)", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>Create New Role</h3>
          <form onSubmit={addRole} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor="new-role-name" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Role Name</label>
                <input
                  id="new-role-name"
                  className="custom-input"
                  style={{ height: "40px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}
                  placeholder="e.g. HR Manager"
                  value={newRole.label}
                  onChange={(e) => setNewRole({ ...newRole, label: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor="new-role-access" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Visible Sidebar Menus</label>
                {renderAccessPicker("new-role-access", newRole.sidebarAccess, (next) =>
                  setNewRole({ ...newRole, sidebarAccess: next })
                )}
              </div>
            </div>
            
            <PermissionGrid 
              selectedPermissions={newRole.permissions} 
              onChange={(next) => setNewRole({ ...newRole, permissions: next })} 
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
              <button type="button" className="module-button secondary-button" onClick={() => setShowAddRole(false)}>Cancel</button>
              <button type="submit" className="module-button" style={{ backgroundColor: "var(--color-primary)", color: "#fff", border: "none", padding: "0 24px" }} disabled={saving}>
                {saving ? "Creating..." : "Save Role"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="roles-table-shell" style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <DataTable
          columns={[
            { 
              key: "role", 
              label: "Role", 
              render: (row) => editingKey === row.key ? (
                <input 
                  className="custom-input" 
                  style={{ height: "36px", fontSize: "13px", padding: "0 10px", width: "100%", boxSizing: "border-box", borderRadius: "var(--radius-sm)" }} 
                  value={editForm.label} 
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} 
                />
              ) : (
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{row.role}</span>
              )
            },
            { 
              key: "type", 
              label: "Type", 
              render: (row) => row.isSystem ? (
                <span className="role-system-tag" style={{ background: "rgba(33, 133, 243, 0.1)", color: "var(--color-primary)", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>System</span>
              ) : (
                <span className="role-custom-tag" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Custom</span>
              ) 
            },
            { 
              key: "access", 
              label: "Visible / Primary Access", 
              render: (row) => editingKey === row.key ? (
                <div className="role-edit-access-stack">
                  {renderAccessPicker(`edit-role-access-${row.key}`, editForm.sidebarAccess, (next) =>
                    setEditForm({ ...editForm, sidebarAccess: next })
                  )}
                </div>
              ) : (
                <span className="role-table-access-text" style={{ color: "var(--text-muted)", fontSize: "13px" }}>{row.access}</span>
              ) 
            },
            { 
              key: "actions", 
              label: "Actions", 
              render: (row) => editingKey === row.key ? (
                <div className="role-row-actions">
                  <button type="button" className="module-button" style={{ backgroundColor: "var(--color-primary)", color: "#fff", padding: "0 16px", height: "32px", fontSize: "12px", borderRadius: "var(--radius-sm)", border: "none" }} onClick={() => saveEdit(row)}>Save</button>
                  <button type="button" className="module-button secondary-button" style={{ padding: "0 12px", height: "32px", fontSize: "12px", borderRadius: "var(--radius-sm)" }} onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="role-row-actions" style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="module-button secondary-button" style={{ padding: "0 14px", height: "32px", fontSize: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", color: "var(--text-main)" }} onClick={() => startEdit(row)}>Edit</button>
                  <button 
                    type="button" 
                    className="module-button danger" 
                    style={{ padding: "0 14px", height: "32px", fontSize: "12px", background: "#FEF2F2", borderColor: "#FECACA", color: "#DC2626", borderRadius: "var(--radius-sm)" }} 
                    onClick={() => setDeleteTarget(row)}
                  >
                    Delete
                  </button>
                </div>
              ) 
            }
          ]}
          rows={roles}
          expandable={true}
          renderExpanded={(row) => (
            editingKey === row.key ? (
              <div style={{ padding: "20px", background: "var(--bg-subtle)", borderTop: "1px solid var(--border-color)" }}>
                <PermissionGrid 
                  selectedPermissions={editForm.permissions} 
                  onChange={(next) => setEditForm({ ...editForm, permissions: next })} 
                />
              </div>
            ) : (
              <div style={{ padding: "20px", background: "var(--bg-subtle)", borderTop: "1px solid var(--border-color)" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--text-main)" }}>Assigned Permissions</h4>
                {row.permissions && row.permissions.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {row.permissions.map(p => {
                      const option = PERMISSION_OPTIONS.find(opt => opt.value === p);
                      return (
                        <span key={p} style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", color: "var(--text-muted)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                          {option ? `${option.group}: ${option.label}` : p}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No specific permissions assigned.</span>
                )}
              </div>
            )
          )}
        />
      </div>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="DELETE ROLE PERMANENTLY?"
        message={
          deleteTarget
            ? `If you delete "${deleteTarget.role}", it will be removed from registration and access lists. Do you want to delete it?`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeRole}
      />
    </>
  );
}

export function ScanDemo() {
  const { assetListData } = useModuleData();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refreshForNetwork = async () => {
    if (!filteredAssets || filteredAssets.length === 0) {
      showToast({
        title: "No assets found",
        message: "Please add assets first to generate QR codes.",
        type: "error",
      });
      return;
    }
    const scanBaseUrl = getScanBaseUrl(getQrClientOrigin());
    setRefreshing(true);
    try {
      await dispatch(refreshQrCodes(scanBaseUrl)).unwrap();
      await dispatch(fetchAssetList());
      showToast({ title: "QR Codes Generated", message: "QR codes have been generated successfully." });
    } catch (error) {
      showToast({ title: "Generation failed", message: error || "Unable to generate QR codes.", type: "error" });
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAssets = assetListData.filter(a => 
    (a.assetName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.assetCode || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageTitle
        eyebrow="QR Management"
        title="QR Scanner Console"
      />

      <div className="action-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search asset name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            type="button" 
            className="secondary-button" 
            onClick={() => {
              if (!filteredAssets || filteredAssets.length === 0) {
                showToast({
                  title: "No assets to download",
                  message: "There are no asset QR codes available to download.",
                  type: "error",
                });
                return;
              }
              window.print();
            }}
            style={{ margin: 0 }}
          >
            Download QR PDF
          </button>
          <button 
            type="button" 
            className="module-button" 
            disabled={refreshing} 
            onClick={refreshForNetwork}
            style={{ margin: 0 }}
          >
            {refreshing ? "Generating..." : "Generate Bulk QR"}
          </button>
        </div>
      </div>
      
      <div className="qr-console-table-wrap">
        <DataTable
          columns={[
            { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
            { key: "assetCode", label: "Code" },
            { key: "serialNumber", label: "Serial" },
            {
              key: "qrCode",
              label: "QR Code",
              render: (row) => row.qrCode ? (
                <div className="qr-sticker-badge">
                  <img src={row.qrCode} alt="QR" />
                </div>
              ) : "-"
            }
          ]}
          rows={filteredAssets}
        />
      </div>
    </>
  );
}

function useModuleData() {
  const dispatch = useDispatch();
  const { assetListData, loading, error } = useSelector((state) => state.assetList);

  useEffect(() => {
    dispatch(fetchAssetList());
  }, [dispatch]);

  return { assetListData, loading, error };
}
