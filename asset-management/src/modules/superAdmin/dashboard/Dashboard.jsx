import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiInstance from "../../../apis/apiConfig";
import "./Dashboard.css";

function SADashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    createdToday: 0,
    monthCompanies: 0,
    recentCompanies: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await apiInstance.get("/super-admin/dashboard");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <div className="p-4">Loading Dashboard...</div>;

  return (
    <div className="sa-dashboard">
      <div className="sa-dashboard-header">
        <h1>Welcome Super Admin</h1>
        <p>Manage companies and platform settings.</p>
      </div>

      <div className="sa-stats-grid">
        <Link to="/super-admin/companies" className="sa-stat-card">
          <h3>Total Companies</h3>
          <div className="sa-stat-value">{stats.totalCompanies}</div>
        </Link>
        <Link to="/super-admin/companies" className="sa-stat-card">
          <h3>Active</h3>
          <div className="sa-stat-value text-success">{stats.activeCompanies}</div>
        </Link>
        <Link to="/super-admin/companies" className="sa-stat-card">
          <h3>Inactive</h3>
          <div className="sa-stat-value text-warning">{stats.inactiveCompanies}</div>
        </Link>
        <Link to="/super-admin/companies" className="sa-stat-card">
          <h3>Created Today</h3>
          <div className="sa-stat-value text-primary">{stats.createdToday}</div>
        </Link>
      </div>

      <div className="sa-dashboard-content">
        <div className="sa-recent-companies">
          <h2>Recent Companies</h2>
          {stats.recentCompanies.length === 0 ? (
            <p>No companies found.</p>
          ) : (
            <div className="sa-company-cards">
              {stats.recentCompanies.map(company => (
                <div key={company._id} className="sa-company-card">
                  <div className="sa-company-card-header">
                    {company.logo ? (
                      <img src={company.logo} alt="Logo" className="sa-company-logo" />
                    ) : (
                      <div className="sa-company-logo-ph">{company.companyName.charAt(0)}</div>
                    )}
                    <div>
                      <h4>{company.companyName}</h4>
                      <small>{company.companyCode}</small>
                    </div>
                  </div>
                  <div className="sa-company-card-body">
                    <p>
                      <strong>Status: </strong>
                      <span className={`status-text ${company.status.toLowerCase()}`}>{company.status}</span>
                    </p>
                    <p>
                      <strong>Created: </strong>
                      {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="sa-company-card-footer">
                    <Link to={`/super-admin/companies/${company._id}`} className="sa-btn-view">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sa-recent-activity">
          <h2>Recent Activity</h2>
          <div className="sa-activity-list">
            <div className="sa-activity-item">
              <div className="sa-activity-dot create"></div>
              <p>Company <strong>Gitakshmi Pvt Ltd</strong> was created.</p>
            </div>
            <div className="sa-activity-item">
              <div className="sa-activity-dot update"></div>
              <p>Company <strong>ABC Technologies</strong> was updated.</p>
            </div>
            <div className="sa-activity-item">
              <div className="sa-activity-dot delete"></div>
              <p>Company <strong>XYZ Solutions</strong> was deleted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SADashboard;
