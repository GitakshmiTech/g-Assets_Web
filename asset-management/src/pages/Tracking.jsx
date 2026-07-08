import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAssetList } from "../store/slices/assetSlice";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "./Tracking.css";

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
              <MarkerClusterGroup chunkedLoading>
                {trackedAssets.map((asset) => (
                  <Marker 
                    key={asset._id} 
                    position={[asset.gpsLocation.latitude, asset.gpsLocation.longitude]}
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
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>
        
        <div className="tracking-sidebar">
          <h3>Tracked Assets ({trackedAssets.length})</h3>
          <div className="tracking-sidebar-list">
            {trackedAssets.length > 0 ? (
              trackedAssets.map(asset => (
                <div key={asset._id} className="tracking-sidebar-item">
                  <h4>{asset.assetName}</h4>
                  <div className="tracking-sidebar-item-details">
                    <span><strong>Code:</strong> {asset.assetCode || asset.serialNumber || 'N/A'}</span>
                    <span><strong>User:</strong> {asset.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </div>
              ))
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
