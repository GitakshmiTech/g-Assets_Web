import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

export default function Unauthorized403() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
      <FaShieldAlt style={{ fontSize: '80px', color: '#dc3545', marginBottom: '20px' }} />
      <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', color: '#343a40' }}>403</h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#6c757d' }}>Unauthorized Access</h2>
      <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '30px' }}>
        You do not have permission to view this page. If you believe this is an error, please contact your Company Admin.
      </p>
      <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#0d6efd', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
