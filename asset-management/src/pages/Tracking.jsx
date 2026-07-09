import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAssetList } from "../store/slices/assetSlice";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "./Tracking.css";

const COLORS = [
  { name: "blue", hex: "#3B82F6" },
  { name: "red", hex: "#EF4444" },
  { name: "green", hex: "#10B981" },
  { name: "purple", hex: "#8B5CF6" },
  { name: "orange", hex: "#F59E0B" },
  { name: "pink", hex: "#EC4899" },
  { name: "teal", hex: "#14B8A6" },
];

const getAssetColor = (index) => {
  return COLORS[index % COLORS.length];
};

const createMarkerIcon = (colorHex) => {
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${colorHex}" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svgTemplate,
    className: "custom-map-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to handle auto-fitting bounds
const MapFitter = ({ assets }) => {
  const map = useMap();
  
  useEffect(() => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(assets.map(a => [a.gpsLocation.latitude, a.gpsLocation.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [assets, map]);
  
  return null;
};

const Tracking = () => {
  const dispatch = useDispatch();
  const { assetListData, loading } = useSelector((state) => state.assetList);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAssetList({}));
  }, [dispatch]);

  const trackedAssets = useMemo(() => {
    return assetListData
      .filter((asset) => asset.gpsLocation && asset.gpsLocation.latitude && asset.gpsLocation.longitude)
      .filter((asset) => {
        const matchesSearch = asset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              asset.assetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              asset.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? asset.category === categoryFilter : true;
        const matchesStatus = statusFilter ? asset.assetStatus === statusFilter : true;
        const matchesUser = userFilter ? asset.assignedTo?.name === userFilter : true;
        return matchesSearch && matchesCategory && matchesStatus && matchesUser;
      });
  }, [assetListData, searchTerm, categoryFilter, statusFilter, userFilter]);

  const categories = [...new Set(assetListData.map(a => a.category).filter(Boolean))];
  const statuses = [...new Set(assetListData.map(a => a.assetStatus).filter(Boolean))];
  const users = [...new Set(assetListData.map(a => a.assignedTo?.name).filter(Boolean))];

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h1>Asset Tracking Map</h1>
        <div className="tracking-filters">
          <input 
            type="text" 
            placeholder="Search by name, ID, or user..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tracking-search"
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="">All Users</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      
      <div className="tracking-main-content">
        <div className="tracking-map-wrapper">
          {loading ? (
            <div className="tracking-loading">Loading Map Data...</div>
          ) : (
            <MapContainer 
              center={[20.5937, 78.9629]} // Default to India center
              zoom={5} 
              scrollWheelZoom={true} 
              className="tracking-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {trackedAssets.length > 0 && <MapFitter assets={trackedAssets} />}
              {trackedAssets.map((asset, index) => {
                const assetColor = getAssetColor(index);
                const icon = createMarkerIcon(assetColor.hex);
                // Offset coordinates slightly to avoid complete overlapping
                const latOffset = (index - (trackedAssets.length - 1) / 2) * 0.00012;
                const lngOffset = (index - (trackedAssets.length - 1) / 2) * 0.00012;
                return (
                  <Marker 
                    key={asset._id} 
                    position={[
                      asset.gpsLocation.latitude + latOffset,
                      asset.gpsLocation.longitude + lngOffset
                    ]}
                    icon={icon}
                  >
                    <Popup className="asset-popup">
                      <div className="popup-content">
                        <h3>{asset.assetName || "Unnamed Asset"}</h3>
                        <p><strong>Code:</strong> {asset.assetCode || asset.serialNumber || "N/A"}</p>
                        <p><strong>Category:</strong> {asset.category}</p>
                        <p><strong>Status:</strong> <span className={`status-badge ${asset.assetStatus}`}>{asset.assetStatus}</span></p>
                        <p><strong>Assigned To:</strong> {asset.assignedTo ? asset.assignedTo.name : "Unassigned"}</p>
                        <button 
                          className="btn-google-maps"
                          onClick={() => window.open(`https://www.google.com/maps?q=${asset.gpsLocation.latitude},${asset.gpsLocation.longitude}`, '_blank')}
                        >
                          Open in Google Maps
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
        
        <div className="tracking-sidebar">
          <h3>Tracked Assets ({trackedAssets.length})</h3>
          <div className="tracking-sidebar-list">
            {trackedAssets.length > 0 ? (
              trackedAssets.map((asset, index) => {
                const assetColor = getAssetColor(index);
                return (
                  <div key={asset._id} className="tracking-sidebar-item">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: assetColor.hex,
                        border: "1px solid rgba(0,0,0,0.15)",
                        flexShrink: 0
                      }} />
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{asset.assetName}</h4>
                    </div>
                    <div className="tracking-sidebar-item-details">
                      <span><strong>Code:</strong> {asset.assetCode || asset.serialNumber || 'N/A'}</span>
                      <span><strong>User:</strong> {asset.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-assets-text">No assets found matching filters.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="tracking-stats">
        Total Tracked Assets: <strong>{trackedAssets.length}</strong> out of {assetListData.length}
      </div>
    </div>
  );
};

export default Tracking;
