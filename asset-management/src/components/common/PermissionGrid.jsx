import { useMemo } from "react";
import { PERMISSION_MODULES } from "../../utils/permissions";
import "./PermissionGrid.css";

export default function PermissionGrid({ selectedPermissions = [], onChange }) {
  const allPermissions = useMemo(() => {
    return PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.value));
  }, []);

  const isAllSelected = selectedPermissions.length === allPermissions.length && allPermissions.length > 0;

  const handleGlobalSelectAll = (checked) => {
    if (checked) {
      onChange(allPermissions);
    } else {
      onChange([]);
    }
  };

  const handleModuleSelectAll = (modulePermissions, checked) => {
    if (checked) {
      const newSelected = [...new Set([...selectedPermissions, ...modulePermissions.map(p => p.value)])];
      onChange(newSelected);
    } else {
      const valuesToRemove = modulePermissions.map(p => p.value);
      const newSelected = selectedPermissions.filter(val => !valuesToRemove.includes(val));
      onChange(newSelected);
    }
  };

  const handlePermissionChange = (value, checked) => {
    if (checked) {
      onChange([...selectedPermissions, value]);
    } else {
      onChange(selectedPermissions.filter(val => val !== value));
    }
  };

  return (
    <div className="permission-grid-container">
      <div className="permission-grid-header">
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Access Permissions</h4>
        <label className="checkbox-label global-select" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: "var(--color-primary)", fontSize: "13px" }}>
          <input 
            type="checkbox" 
            checked={isAllSelected}
            onChange={(e) => handleGlobalSelectAll(e.target.checked)}
            style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
          />
          <span>Select All Permissions</span>
        </label>
      </div>
      
      <div className="permission-modules-wrapper">
        {PERMISSION_MODULES.map((mod) => {
          const moduleVals = mod.permissions.map((p) => p.value);
          const isModuleAllSelected = moduleVals.every(val => selectedPermissions.includes(val)) && moduleVals.length > 0;
          
          return (
            <div key={mod.module} className="permission-module-card">
              <div className="permission-module-header">
                <h5 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>{mod.module}</h5>
                <label className="checkbox-label module-select" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                  <input 
                    type="checkbox"
                    checked={isModuleAllSelected}
                    onChange={(e) => handleModuleSelectAll(mod.permissions, e.target.checked)}
                    style={{ cursor: "pointer", width: "14px", height: "14px", accentColor: "var(--color-primary)" }}
                  />
                  <span>Select All</span>
                </label>
              </div>
              
              <div className="permission-items-grid">
                {mod.permissions.map((perm) => (
                  <label key={perm.value} className="checkbox-label item-select" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                    <input 
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.value)}
                      onChange={(e) => handlePermissionChange(perm.value, e.target.checked)}
                      style={{ cursor: "pointer", width: "14px", height: "14px", accentColor: "var(--color-primary)" }}
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
