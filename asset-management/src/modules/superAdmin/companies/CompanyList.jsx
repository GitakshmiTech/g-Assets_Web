import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCompanies, deleteCompany } from "./companySlice";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import "./CompanyList.css";

function CompanyList() {
  const dispatch = useDispatch();
  const { companies, total, loading } = useSelector((state) => state.company);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const limit = 10;

  useEffect(() => {
    dispatch(fetchCompanies({
      search: searchTerm,
      page,
      limit,
      sortBy: sortField,
      order: sortOrder
    }));
  }, [dispatch, searchTerm, page, sortField, sortOrder]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      dispatch(deleteCompany(id));
    }
  };

  const handleSort = (field) => {
    const order = (sortField === field && sortOrder === "asc") ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <div className="company-list-container">
      <div className="company-list-header">
        <h2>Companies</h2>
        <Link to="/super-admin/companies/create" className="btn-primary">
          <FaPlus /> Create Company
        </Link>
      </div>

      <div className="company-list-controls">
        <div className="search-box">
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search by Name, Code, Email, Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="company-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th onClick={() => handleSort("companyName")}>Company Name {sortField === "companyName" && (sortOrder === "asc" ? "↑" : "↓")}</th>
              <th onClick={() => handleSort("companyCode")}>Company Code {sortField === "companyCode" && (sortOrder === "asc" ? "↑" : "↓")}</th>
              <th>Email</th>
              <th>Phone</th>
              <th onClick={() => handleSort("status")}>Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}</th>
              <th onClick={() => handleSort("createdAt")}>Created Date {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center">Loading...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No companies found.</td></tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id}>
                  <td>
                    {company.logo ? (
                      <img src={company.logo} alt="Logo" className="company-logo-thumb" />
                    ) : (
                      <div className="company-logo-placeholder">{company.companyName.charAt(0).toUpperCase()}</div>
                    )}
                  </td>
                  <td>{company.companyName}</td>
                  <td>{company.companyCode}</td>
                  <td>{company.email}</td>
                  <td>{company.phone}</td>
                  <td>
                    <span className={`status-badge status-${company.status.toLowerCase()}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <Link to={`/super-admin/companies/edit/${company._id}`} className="action-btn edit-btn" title="Edit"><FaEdit /></Link>
                    <button onClick={() => handleDelete(company._id)} className="action-btn delete-btn" title="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      {total > 0 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

export default CompanyList;
