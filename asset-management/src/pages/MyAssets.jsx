import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaExclamationTriangle, FaTimes, FaLaptop, FaCheckCircle, FaTools } from "react-icons/fa";
import apiInstance from "../apis/apiConfig";
import { fetchAssetList } from "../store/slices/assetSlice";
import {
  AssetLink,
  DataTable,
  KpiGrid,
  PageTitle,
} from "../components/common/ModuleComponents";
import { getInventoryAssets } from "../utils/assetUtils";
import { useToast } from "../components/toast/toastStore";
import { pushAppNotification } from "../utils/notificationStore";
import "./MyAssets.css";

export default function MyAssets() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { assetListData, loading } = useSelector((state) => state.assetList);
  const { showToast } = useToast();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    assetId: "",
    assetName: "",
    complaintTitle: "",
    incidentImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    dispatch(fetchAssetList());
  }, [dispatch]);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const { data } = await apiInstance.get("/work-orders");
        if (data.success) {
          setWorkOrders(data.workOrders || []);
        }
      } catch (err) {
        console.error("Failed to fetch work orders in MyAssets", err);
      }
    };
    fetchWorkOrders();
  }, []);

  // Filter assets to find those assigned to the logged-in user
  const inventoryAssets = getInventoryAssets(assetListData);
  const assignedAssets = inventoryAssets.filter((asset) => {
    const assignedId = asset.assignedTo?._id || asset.assignedTo?.id || asset.assignedTo;
    const matchesId = assignedId && String(assignedId) === String(user?._id || user?.id);
    const matchesEmpId = user?.employeeId && asset.employeeId && String(asset.employeeId).toLowerCase() === String(user.employeeId).toLowerCase();
    const matchesName = asset.assignedTo?.name && String(asset.assignedTo.name).toLowerCase() === String(user.name).toLowerCase();
    return matchesId || matchesEmpId || matchesName;
  });

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

        showToast({ title: "Report Submitted", message: "Your damage report has been logged successfully.", type: "success" });
        setIsReportModalOpen(false);
        setReportForm({ assetId: "", assetName: "", complaintTitle: "", incidentImage: "" });
        dispatch(fetchAssetList()); // Refresh assets state to show updated status
      }
    } catch (error) {
      showToast({ title: "Error", message: error.response?.data?.message || "Failed to submit report.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const myAssetColumns = [
    { key: "assetName", label: "Asset", render: (row) => <AssetLink asset={row} /> },
    { key: "assetCode", label: "Asset Code" },
    { key: "serialNumber", label: "Serial No" },
    {
      key: "assetStatus",
      label: "Status",
      render: (row) => {
        let displayStatus = row.assetStatus;
        
        // Find the most recent work order for this asset to reflect its status
        const assetWorkOrders = workOrders.filter(
          (w) => String(w.assetId) === String(row._id) || String(w.assetId) === String(row.assetCode)
        );
        if (assetWorkOrders.length > 0) {
          // Sort to get the latest work order based on date or _id
          const latestWO = assetWorkOrders.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || 0);
            const dateB = new Date(b.date || b.createdAt || 0);
            return dateB - dateA;
          })[0];
          
          // Only override status if repair is active/ongoing
          if (latestWO.status !== "Completed") {
            displayStatus = latestWO.status;
          }
        } else if (row.assetStatus === "UNDER_REPAIR") {
          displayStatus = "In Progress"; // Fallback
        }

        let badgeClass = "default";
        if (displayStatus === "ASSIGNED" || displayStatus === "AVAILABLE") {
          badgeClass = "assigned";
        } else if (displayStatus === "Completed") {
          badgeClass = "completed"; // Usually success color
        } else if (displayStatus === "Open") {
          badgeClass = "open";
        } else if (displayStatus === "In Progress" || displayStatus === "UNDER_REPAIR") {
          badgeClass = "ongoing";
        }

        return (
          <span className={`status-badge ${badgeClass}`}>
            {displayStatus}
          </span>
        );
      },
    },
    { key: "officeName", label: "Office" },
    { key: "department", label: "Department" },
  ];

  const totalAssigned = assignedAssets.length;
  const underRepair = assignedAssets.filter((a) => a.assetStatus === "UNDER_REPAIR").length;
  const activeAssets = totalAssigned - underRepair;

  return (
    <div className="my-assets-page">
      <PageTitle
        eyebrow="User Workspace"
        title="My Assets"
        description="View and manage assets assigned to your profile. Report dynamic damage or issues directly to support."
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <KpiGrid
            items={[
              { label: "Total Assigned Assets", value: totalAssigned, icon: <FaLaptop /> },
              { label: "Active Assets", value: activeAssets, icon: <FaCheckCircle style={{ color: "#10b981" }} /> },
              { label: "Assets Under Repair", value: underRepair, icon: <FaTools style={{ color: "#f59e0b" }} /> },
            ]}
          />
        </div>
        <div style={{ marginLeft: '16px', marginTop: '16px' }}>
          <button
            type="button"
            className="report-damage-btn"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              setReportForm({
                assetId: assignedAssets.length > 0 ? assignedAssets[0]._id : "",
                assetName: assignedAssets.length > 0 ? assignedAssets[0].assetName : "",
                complaintTitle: "",
                incidentImage: "",
              });
              setIsReportModalOpen(true);
            }}
          >
            <FaExclamationTriangle size={12} /> Report Damage
          </button>
        </div>
      </div>

      <div className="my-assets-container">

        {loading ? (
          <div className="loading-container">Loading assigned assets...</div>
        ) : (
          <DataTable columns={myAssetColumns} rows={assignedAssets} />
        )}
      </div>

      {isReportModalOpen && (
        <div className="drawer-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="review-drawer drawer-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-title-block">
                <span className="drawer-badge">Report</span>
                <h2>Report Damage</h2>
              </div>
              <button className="close-drawer-btn" onClick={() => setIsReportModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="drawer-form">
              <div className="drawer-body">
                <div className="form-group">
                  <label>Selected Asset</label>
                  <select
                    value={reportForm.assetId}
                    onChange={(e) => {
                      const selected = assignedAssets.find((a) => String(a._id) === String(e.target.value));
                      if (selected) {
                        setReportForm({ ...reportForm, assetId: selected._id, assetName: selected.assetName });
                      }
                    }}
                    required
                  >
                    <option value="" disabled>Select an asset</option>
                    {assignedAssets.map((asset) => (
                      <option key={asset._id} value={asset._id}>
                        {asset.assetName} ({asset.assetCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Issue Description <span style={{ color: "red" }}>*</span></label>
                  <textarea
                    placeholder="Describe the damage or problem with this asset..."
                    value={reportForm.complaintTitle}
                    onChange={(e) => setReportForm({ ...reportForm, complaintTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                  />
                  {reportForm.incidentImage && (
                    <div className="drawer-image-preview-container">
                      <img src={reportForm.incidentImage} alt="Preview" className="drawer-image-preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  className="drawer-cancel-btn"
                  onClick={() => setIsReportModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="drawer-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
