export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  COMPANY_ADMIN: "Admin",
  ADMIN: "Admin",
  IT_STAFF: "IT Staff",
  MANAGER: "Manager",
  AUDITOR: "Auditor",
  EMPLOYEE: "Employee",
};

export const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "COMPANY_ADMIN", label: "Admin" },
  { value: "BRANCH_ADMIN", label: "Branch Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "IT_STAFF", label: "IT Staff" },
  { value: "MANAGER", label: "Manager" },
  { value: "AUDITOR", label: "Auditor" },
  { value: "EMPLOYEE", label: "Employee" },
];

export const ROLE_HOME = {
  SUPER_ADMIN: "/super-admin/dashboard",
  COMPANY_ADMIN: "/",
  BRANCH_ADMIN: "/",
  ADMIN: "/",
  IT_STAFF: "/assets",
  MANAGER: "/requests",
  AUDITOR: "/audit",
  EMPLOYEE: "/employees",
};

export const normalizeRoleValue = (role = "") => {
  const normalized = String(role || "EMPLOYEE").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (normalized === "SUPERADMIN") return "SUPER_ADMIN";
  if (ROLE_LABELS[normalized]) return normalized;
  return "EMPLOYEE";
};

export const PERMISSION_OPTIONS = [
  { value: "dashboard.view", label: "Dashboard View", group: "Dashboard" },
  { value: "assets.view", label: "Asset View", group: "Assets" },
  { value: "assets.create", label: "Asset Add", group: "Assets" },
  { value: "assets.edit", label: "Asset Edit", group: "Assets" },
  { value: "assets.delete", label: "Asset Delete", group: "Assets" },
  { value: "assignments.manage", label: "Asset Assign", group: "Assignments" },
  { value: "qrconsole.generate", label: "QR Generate", group: "QR" },
  { value: "qrconsole.scan", label: "QR Scan", group: "QR" },
  { value: "requests.view", label: "Request View", group: "Requests" },
  { value: "requests.create", label: "Create Request", group: "Requests" },
  { value: "approvals.approve", label: "Request Approve", group: "Approvals" },
  { value: "approvals.reject", label: "Request Reject", group: "Approvals" },
  { value: "inventory.view", label: "Inventory View", group: "Inventory" },
  { value: "inventory.manage", label: "Inventory Management", group: "Inventory" },
  { value: "maintenance.view", label: "Maintenance View", group: "Maintenance" },
  { value: "maintenance.manage", label: "Maintenance Management", group: "Maintenance" },
  { value: "warranty.view", label: "Warranty View", group: "Warranty" },
  { value: "warranty.manage", label: "Warranty Management", group: "Warranty" },
  { value: "employeeportal.view", label: "Employee Portal Access", group: "Employees" },
  { value: "usersaccess.manage", label: "Users & Roles Management", group: "Users" },
  { value: "offices.view", label: "Office View", group: "Offices" },
  { value: "offices.manage", label: "Office Management", group: "Offices" },
  { value: "reports.view", label: "Reports View", group: "Reports" },
  { value: "reports.export", label: "Reports Export", group: "Reports" },
  { value: "auditsession.view", label: "Audit Session View", group: "Audit" },
  { value: "auditsession.manage", label: "Audit Session Management", group: "Audit" },
  { value: "setup.manage", label: "System Settings Access", group: "System" },
  { value: "procurements.manage", label: "Procurement Management", group: "Procurements" },
  { value: "workorders.manage", label: "Work Orders Management", group: "Work Orders" },
  { value: "tracking.view", label: "Tracking Map View", group: "Tracking" },
  { value: "myassets.view", label: "My Assets View", group: "My Assets" },
];

export const PERMISSION_MODULES = [
  {
    module: "Dashboard",
    permissions: [
      { label: "View", value: "dashboard.view" }
    ]
  },
  {
    module: "Assets",
    permissions: [
      { label: "View", value: "assets.view" },
      { label: "Create", value: "assets.create" },
      { label: "Edit", value: "assets.edit" },
      { label: "Delete", value: "assets.delete" }
    ]
  },
  {
    module: "My Assets",
    permissions: [
      { label: "View", value: "myassets.view" }
    ]
  },
  {
    module: "Requests",
    permissions: [
      { label: "View", value: "requests.view" },
      { label: "Create", value: "requests.create" }
    ]
  },
  {
    module: "Approvals",
    permissions: [
      { label: "Approve", value: "approvals.approve" },
      { label: "Reject", value: "approvals.reject" }
    ]
  },
  {
    module: "Inventory",
    permissions: [
      { label: "View", value: "inventory.view" },
      { label: "Manage", value: "inventory.manage" }
    ]
  },
  {
    module: "Maintenance",
    permissions: [
      { label: "View", value: "maintenance.view" },
      { label: "Manage", value: "maintenance.manage" }
    ]
  },
  {
    module: "Warranty",
    permissions: [
      { label: "View", value: "warranty.view" },
      { label: "Manage", value: "warranty.manage" }
    ]
  },
  {
    module: "Employees",
    permissions: [
      { label: "Portal Access", value: "employeeportal.view" }
    ]
  },
  {
    module: "Users & Roles",
    permissions: [
      { label: "Manage", value: "usersaccess.manage" }
    ]
  },
  {
    module: "Offices",
    permissions: [
      { label: "View", value: "offices.view" },
      { label: "Manage", value: "offices.manage" }
    ]
  },
  {
    module: "Reports",
    permissions: [
      { label: "View", value: "reports.view" },
      { label: "Export", value: "reports.export" }
    ]
  },
  {
    module: "Audit",
    permissions: [
      { label: "View", value: "auditsession.view" },
      { label: "Manage", value: "auditsession.manage" }
    ]
  },
  {
    module: "System Settings",
    permissions: [
      { label: "Access", value: "setup.manage" }
    ]
  },
  {
    module: "Procurements",
    permissions: [
      { label: "Manage", value: "procurements.manage" }
    ]
  },
  {
    module: "Work Orders",
    permissions: [
      { label: "Manage", value: "workorders.manage" }
    ]
  },
  {
    module: "QR Console",
    permissions: [
      { label: "Generate", value: "qrconsole.generate" },
      { label: "Scan", value: "qrconsole.scan" }
    ]
  },
  {
    module: "Tracking",
    permissions: [
      { label: "View Map", value: "tracking.view" }
    ]
  }
];

export const MENU_ACCESS_OPTIONS = [
  { label: "Dashboard", routes: ["/"] },
  { label: "Assets", routes: ["/assets", "/add-asset", "/edit-asset", "/asset-details"] },
  { label: "Masters", routes: ["/masters", "/master-editor", "/masters/asset-form", "/masters/request-form", "/masters/procurement-form", "/masters/categories"] },
  { label: "QR Console", routes: ["/scan-demo"] },
  { label: "Requests", routes: ["/requests", "/add-request", "/edit-request"] },
  { label: "Approvals", routes: ["/approvals"] },
  { label: "Procurements", routes: ["/procurements"] },
  { label: "Inventory", routes: ["/inventory"] },
  { label: "Work Orders", routes: ["/work-orders"] },
  { label: "Employee Portal", routes: ["/employees"] },
  { label: "Assignments", routes: ["/assignments"] },
  { label: "Maintenance", routes: ["/maintenance"] },
  { label: "Warranty", routes: ["/warranty"] },
  { label: "Offices", routes: ["/offices"] },
  { label: "Audit Session", routes: ["/audit"] },
  { label: "Reports", routes: ["/reports"] },
  { label: "Users & Access", routes: ["/roles"] },
  { label: "Setup", routes: ["/setup/users", "/setup/vendors", "/setup/products", "/setup/preferences"] },
  { label: "Users", routes: ["/setup/users"] },
  { label: "Vendors", routes: ["/setup/vendors"] },
  { label: "Products", routes: ["/setup/products"] },
  { label: "Preferences", routes: ["/setup/preferences"] },
  { label: "Tracking", routes: ["/tracking"] },
  { label: "My Assets", routes: ["/my-assets"] },
];

export const DEFAULT_ROLE_CONFIG = {
  SUPER_ADMIN: {
    sidebarAccess: MENU_ACCESS_OPTIONS.map((item) => item.label),
    permissions: PERMISSION_OPTIONS.map((item) => item.value),
  },
  COMPANY_ADMIN: {
    sidebarAccess: [
      "Dashboard",
      "Assets",
      "Masters",
      "QR Console",
      "Requests",
      "Approvals",
      "Procurements",
      "Inventory",
      "Work Orders",
      "Employee Portal",
      "Assignments",
      "Maintenance",
      "Warranty",
      "Offices",
      "Audit Session",
      "Reports",
      "Users & Access",
      "Setup",
      "Users",
      "Vendors",
      "Products",
      "Preferences",
      "Tracking",
    ],
    permissions: [
      "dashboard.view",
      "assets.view",
      "assets.create",
      "assets.edit",
      "assets.delete",
      "assignments.manage",
      "qrconsole.generate",
      "qrconsole.scan",
      "requests.view",
      "requests.create",
      "approvals.approve",
      "approvals.reject",
      "inventory.view",
      "inventory.manage",
      "maintenance.view",
      "maintenance.manage",
      "warranty.view",
      "warranty.manage",
      "employeeportal.view",
      "usersaccess.manage",
      "offices.view",
      "offices.manage",
      "reports.view",
      "reports.export",
      "auditsession.view",
      "auditsession.manage",
      "setup.manage",
      "procurements.manage",
      "workorders.manage",
      "tracking.view",
      "myassets.view",
    ],
  },
  ADMIN: {
    sidebarAccess: [
      "Dashboard",
      "Assets",
      "Masters",
      "QR Console",
      "Requests",
      "Approvals",
      "Procurements",
      "Inventory",
      "Work Orders",
      "Employee Portal",
      "Assignments",
      "Maintenance",
      "Warranty",
      "Offices",
      "Audit Session",
      "Reports",
      "Users & Access",
      "Setup",
      "Users",
      "Vendors",
      "Products",
      "Preferences",
    ],
    permissions: [
      "dashboard.view",
      "assets.view",
      "assets.create",
      "assets.edit",
      "assets.delete",
      "assignments.manage",
      "qrconsole.generate",
      "qrconsole.scan",
      "requests.view",
      "requests.create",
      "approvals.approve",
      "approvals.reject",
      "inventory.view",
      "inventory.manage",
      "maintenance.view",
      "maintenance.manage",
      "warranty.view",
      "warranty.manage",
      "employeeportal.view",
      "usersaccess.manage",
      "offices.view",
      "offices.manage",
      "reports.view",
      "reports.export",
      "auditsession.view",
      "auditsession.manage",
      "setup.manage",
      "procurements.manage",
      "workorders.manage",
      "tracking.view",
      "myassets.view",
    ],
  },
  IT_STAFF: {
    sidebarAccess: [
      "Dashboard",
      "Assets",
      "QR Console",
      "Tracking",
      "Assignments",
      "Maintenance",
      "Warranty",
      "Work Orders",
      "Inventory",
      "Requests",
      "My Assets",
    ],
    permissions: [
      "dashboard.view",
      "assets.view",
      "assets.create",
      "assets.edit",
      "assets.delete",
      "assignments.manage",
      "qrconsole.generate",
      "qrconsole.scan",
      "tracking.view",
      "maintenance.view",
      "maintenance.manage",
      "warranty.view",
      "warranty.manage",
      "inventory.view",
      "inventory.manage",
      "requests.view",
      "requests.create",
      "myassets.view",
      "workorders.manage",
      "employeeportal.view",
    ],
  },
  MANAGER: {
    sidebarAccess: [
      "Dashboard",
      "Assets",
      "Requests",
      "Approvals",
      "Reports",
      "My Assets",
      "Employee Portal",
      "Assignments",
    ],
    permissions: [
      "dashboard.view",
      "assets.view",
      "assets.create",
      "assets.edit",
      "assets.delete",
      "requests.view",
      "requests.create",
      "approvals.approve",
      "approvals.reject",
      "reports.view",
      "assignments.manage",
      "myassets.view",
      "employeeportal.view",
    ],
  },
  EMPLOYEE: {
    sidebarAccess: [
      "My Assets",
      "Requests",
      "Employee Portal",
      "QR Console",
    ],
    permissions: [
      "myassets.view",
      "requests.create",
      "requests.view",
      "qrconsole.scan",
      "qrconsole.generate",
      "employeeportal.view",
    ],
  },
  AUDITOR: {
    sidebarAccess: [
      "Dashboard",
      "Assets",
      "Audit Session",
      "Reports",
      "My Assets",
    ],
    permissions: [
      "dashboard.view",
      "assets.view",
      "reports.view",
      "auditsession.view",
      "auditsession.manage",
      "myassets.view",
      "employeeportal.view",
    ],
  },
};

export const ROUTE_ROLES = {
  "/": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/assets": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/requests": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF", "MANAGER"],
  "/approvals": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "MANAGER"],
  "/inventory": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/employees": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "EMPLOYEE"],
  "/assignments": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/maintenance": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/warranty": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/offices": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/audit": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "AUDITOR"],
  "/reports": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/roles": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/master-editor": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/masters": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/scan-demo": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/add-asset": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/edit-asset": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/add-request": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF", "MANAGER"],
  "/edit-request": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF", "MANAGER"],
  "/asset-details": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF", "AUDITOR"],
  "/profile": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF", "MANAGER", "AUDITOR", "EMPLOYEE"],
  "/procurements": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/work-orders": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/setup/users": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/setup/vendors": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF"],
  "/setup/products": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN", "IT_STAFF", "MANAGER", "AUDITOR"],
  "/setup/preferences": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/tracking": ["SUPER_ADMIN", "COMPANY_ADMIN", "ADMIN"],
  "/my-assets": ["SUPER_ADMIN", "COMPANY_ADMIN", "BRANCH_ADMIN", "ADMIN", "IT_STAFF", "MANAGER", "EMPLOYEE", "AUDITOR"],
};

export const ROUTE_PERMISSIONS = {
  "/": ["dashboard.view"],
  "/assets": ["assets.view"],
  "/requests": ["requests.view"],
  "/approvals": ["approvals.approve"],
  "/inventory": ["inventory.view", "inventory.manage"],
  "/employees": ["employeeportal.view"],
  "/assignments": ["assignments.manage"],
  "/maintenance": ["maintenance.view", "maintenance.manage"],
  "/warranty": ["warranty.view", "warranty.manage"],
  "/offices": ["offices.view", "offices.manage"],
  "/audit": ["auditsession.view", "auditsession.manage"],
  "/reports": ["reports.view"],
  "/roles": ["usersaccess.manage"],
  "/master-editor": ["setup.manage", "usersaccess.manage"],
  "/masters": ["setup.manage", "usersaccess.manage"],
  "/masters/asset-form": ["assets.create", "assets.edit", "assets.view"],
  "/masters/request-form": ["requests.view"],
  "/masters/procurement-form": ["procurements.manage"],
  "/masters/categories": [],
  "/add-request": ["requests.create"],
  "/edit-request": ["requests.create"],
  "/asset-details": ["assets.view"],
  "/profile": [],
  "/procurements": ["procurements.manage"],
  "/work-orders": ["workorders.manage"],
  "/setup/users": ["usersaccess.manage"],
  "/setup/vendors": ["procurements.manage", "usersaccess.manage"],
  "/setup/products": ["assets.view"],
  "/setup/preferences": ["setup.manage"],
  "/tracking": ["tracking.view"],
  "/my-assets": ["myassets.view"],
};

export const parseAccessLabels = (access = "") =>
  Array.isArray(access)
    ? access.map((item) => String(item || "").trim()).filter(Boolean)
    : String(access || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

export const formatAccessLabels = (labels = []) =>
  labels.filter(Boolean).join(", ");

export const getMenuOption = (label) =>
  MENU_ACCESS_OPTIONS.find((item) => item.label.toLowerCase() === String(label || "").trim().toLowerCase());

export const getAccessibleRoutes = (access = "") =>
  parseAccessLabels(access)
    .flatMap((label) => getMenuOption(label)?.routes || [])
    .filter(Boolean);

export const roleHasMenuAccess = (role, menuLabel, access = "") => {
  if (role === "SUPER_ADMIN") {
    return ["SA Dashboard", "Companies"].includes(menuLabel);
  }
  const selected = parseAccessLabels(access);
  if (selected.length) {
    return selected.some((label) => label.toLowerCase() === menuLabel.toLowerCase());
  }
  return false;
};

export const canAccessRoute = (role, pathname, access = "", permissions = []) => {
  if (role === "SUPER_ADMIN") {
    return pathname.startsWith("/super-admin") || pathname === "/profile";
  }
  if (pathname.startsWith("/super-admin")) {
    return false;
  }
  if (["COMPANY_ADMIN", "BRANCH_ADMIN", "ADMIN"].includes(role)) {
    return true;
  }
  if (pathname === "/profile") return true;

  const routePermissionKey = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (routePermissionKey && permissions.length) {
    const allowed = ROUTE_PERMISSIONS[routePermissionKey];
    if (!allowed.length || allowed.some((permission) => permissions.includes(permission))) {
      return true;
    }
  }

  const accessRoutes = getAccessibleRoutes(access);
  if (accessRoutes.length) {
    if (accessRoutes.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return true;
    }
  }

  const routeKey = Object.keys(ROUTE_ROLES)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!routeKey) return true;
  return ROUTE_ROLES[routeKey].includes(role);
};

export const getRoleHome = (role, access = "") => {
  const accessRoutes = getAccessibleRoutes(access);
  return ROLE_HOME[role] || accessRoutes[0] || "/employees";
};
