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
  { value: "dashboard.overview.view", label: "Dashboard View", group: "Dashboard" },
  { value: "asset.register.view", label: "Asset View", group: "Assets" },
  { value: "asset.register.create", label: "Asset Add", group: "Assets" },
  { value: "asset.register.edit", label: "Asset Edit", group: "Assets" },
  { value: "asset.register.delete", label: "Asset Delete", group: "Assets" },
  { value: "asset.assignments.assign", label: "Asset Assign", group: "Assets" },
  { value: "asset.register.export", label: "QR Generate", group: "QR" },
  { value: "asset.register.view", label: "QR Scan", group: "QR" },
  { value: "request.procurement.view", label: "Request View", group: "Requests" },
  { value: "request.procurement.create", label: "Create Request", group: "Requests" },
  { value: "request.procurement.approve", label: "Request Approve", group: "Requests" },
  { value: "request.procurement.reject", label: "Request Reject", group: "Requests" },
  { value: "inventory.stock.view", label: "Inventory View", group: "Inventory" },
  { value: "inventory.stock.edit", label: "Inventory Management", group: "Inventory" },
  { value: "maintenance.logs.view", label: "Maintenance View", group: "Maintenance" },
  { value: "maintenance.logs.edit", label: "Maintenance Management", group: "Maintenance" },
  { value: "warranty.tracker.view", label: "Warranty View", group: "Warranty" },
  { value: "warranty.tracker.edit", label: "Warranty Management", group: "Warranty" },
  { value: "employee.portal.view", label: "Employee Portal Access", group: "Employees" },
  { value: "employee.users.edit", label: "Users & Roles Management", group: "Users" },
  { value: "office.offices.view", label: "Office View", group: "Offices" },
  { value: "office.offices.edit", label: "Office Management", group: "Offices" },
  { value: "report.reports.view", label: "Reports View", group: "Reports" },
  { value: "report.reports.export", label: "Reports Export", group: "Reports" },
  { value: "asset.register.view", label: "Audit Session View", group: "Audit" },
  { value: "asset.register.edit", label: "Audit Session Management", group: "Audit" },
  { value: "settings.preferences.view", label: "System Settings Access", group: "System" },
  { value: "request.procurement.edit", label: "Procurement Management", group: "Procurements" },
  { value: "maintenance.logs.edit", label: "Work Orders Management", group: "Work Orders" },
  { value: "tracking.map.view", label: "Tracking Map View", group: "Tracking" },
];

export const PERMISSION_MODULES = [
  {
    module: "Dashboard",
    permissions: [
      { label: "View", value: "dashboard.overview.view" }
    ]
  },
  {
    module: "Assets",
    permissions: [
      { label: "View", value: "asset.register.view" },
      { label: "Create", value: "asset.register.create" },
      { label: "Edit", value: "asset.register.edit" },
      { label: "Delete", value: "asset.register.delete" },
      { label: "Assign", value: "asset.assignments.assign" }
    ]
  },
  {
    module: "Requests",
    permissions: [
      { label: "View", value: "request.procurement.view" },
      { label: "Create", value: "request.procurement.create" },
      { label: "Approve", value: "request.procurement.approve" },
      { label: "Reject", value: "request.procurement.reject" }
    ]
  },
  {
    module: "Inventory",
    permissions: [
      { label: "View", value: "inventory.stock.view" },
      { label: "Manage", value: "inventory.stock.edit" }
    ]
  },
  {
    module: "Maintenance",
    permissions: [
      { label: "View", value: "maintenance.logs.view" },
      { label: "Manage", value: "maintenance.logs.edit" }
    ]
  },
  {
    module: "Warranty",
    permissions: [
      { label: "View", value: "warranty.tracker.view" },
      { label: "Manage", value: "warranty.tracker.edit" }
    ]
  },
  {
    module: "Employees",
    permissions: [
      { label: "Portal Access", value: "employee.portal.view" }
    ]
  },
  {
    module: "Users & Roles",
    permissions: [
      { label: "View", value: "user.view" },
      { label: "Manage", value: "employee.users.edit" }
    ]
  },
  {
    module: "Offices",
    permissions: [
      { label: "View", value: "office.offices.view" },
      { label: "Manage", value: "office.offices.edit" }
    ]
  },
  {
    module: "Reports",
    permissions: [
      { label: "View", value: "report.reports.view" },
      { label: "Export", value: "report.reports.export" }
    ]
  },
  {
    module: "Audit",
    permissions: [
      { label: "View", value: "asset.register.view" },
      { label: "Manage", value: "asset.register.edit" }
    ]
  },
  {
    module: "System Settings",
    permissions: [
      { label: "Access", value: "settings.preferences.view" }
    ]
  },
  {
    module: "Procurements",
    permissions: [
      { label: "Manage", value: "request.procurement.edit" }
    ]
  },
  {
    module: "Work Orders",
    permissions: [
      { label: "Manage", value: "maintenance.logs.edit" }
    ]
  },
  {
    module: "QR Console",
    permissions: [
      { label: "Generate", value: "asset.register.export" },
      { label: "Scan", value: "asset.register.view" }
    ]
  },
  {
    module: "Tracking",
    permissions: [
      { label: "View Map", value: "tracking.map.view" }
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
      "dashboard.overview.view",
      "asset.register.view",
      "asset.register.create",
      "asset.register.edit",
      "asset.register.delete",
      "asset.assignments.assign",
      "asset.register.export",
      "asset.register.view",
      "request.procurement.view",
      "request.procurement.approve",
      "request.procurement.reject",
      "inventory.stock.view",
      "inventory.stock.edit",
      "maintenance.logs.view",
      "maintenance.logs.edit",
      "warranty.tracker.view",
      "warranty.tracker.edit",
      "employee.portal.view",
      "employee.users.edit",
      "office.offices.view",
      "office.offices.edit",
      "report.reports.view",
      "report.reports.export",
      "asset.register.view",
      "request.procurement.edit",
      "maintenance.logs.edit",
      "settings.preferences.view",
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
      "dashboard.overview.view",
      "asset.register.view",
      "asset.register.create",
      "asset.register.edit",
      "asset.register.delete",
      "asset.assignments.assign",
      "asset.register.export",
      "asset.register.view",
      "request.procurement.view",
      "request.procurement.approve",
      "request.procurement.reject",
      "inventory.stock.view",
      "inventory.stock.edit",
      "maintenance.logs.view",
      "maintenance.logs.edit",
      "warranty.tracker.view",
      "warranty.tracker.edit",
      "employee.portal.view",
      "employee.users.edit",
      "office.offices.view",
      "office.offices.edit",
      "report.reports.view",
      "report.reports.export",
      "asset.register.view",
      "request.procurement.edit",
      "maintenance.logs.edit",
      "settings.preferences.view",
    ],
  },
  IT_STAFF: {
    sidebarAccess: [
      "Dashboard",
      "Assets",
      "QR Console",
      "Requests",
      "Procurements",
      "Inventory",
      "Work Orders",
      "Assignments",
      "Maintenance",
      "Warranty",
      "Reports",
      "Masters",
      "Setup",
      "Vendors",
      "Products",
    ],
    permissions: [
      "dashboard.overview.view",
      "asset.register.view",
      "asset.register.create",
      "asset.register.edit",
      "asset.assignments.assign",
      "asset.register.export",
      "asset.register.view",
      "request.procurement.view",
      "request.procurement.create",
      "inventory.stock.view",
      "maintenance.logs.view",
      "maintenance.logs.edit",
      "warranty.tracker.view",
      "report.reports.view",
      "request.procurement.edit",
      "maintenance.logs.edit",
    ],
  },
  MANAGER: {
    sidebarAccess: ["Dashboard", "Assets", "Requests", "Approvals", "Reports", "Setup", "Products"],
    permissions: ["dashboard.overview.view", "asset.register.view", "request.procurement.view", "request.procurement.approve", "request.procurement.reject", "report.reports.view"],
  },
  EMPLOYEE: {
    sidebarAccess: ["Employee Portal", "Requests", "Warranty", "QR Console", "My Assets"],
    permissions: ["employee.portal.view", "asset.register.view", "request.procurement.create", "request.procurement.view", "warranty.tracker.view", "asset.register.view"],
  },
  AUDITOR: {
    sidebarAccess: ["Audit Session", "Reports", "Assets", "Setup", "Products"],
    permissions: ["asset.register.view", "report.reports.view", "asset.register.view"],
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
  "/": ["dashboard.overview.view"],
  "/assets": ["asset.register.view"],
  "/requests": ["request.procurement.view"],
  "/approvals": ["request.procurement.approve"],
  "/inventory": ["inventory.stock.view", "inventory.stock.edit"],
  "/employees": ["employee.portal.view"],
  "/assignments": ["asset.assignments.assign"],
  "/maintenance": ["maintenance.logs.view", "maintenance.logs.edit"],
  "/warranty": ["warranty.tracker.view", "warranty.tracker.edit"],
  "/offices": ["office.offices.view", "office.offices.edit"],
  "/audit": ["asset.register.view", "asset.register.edit"],
  "/reports": ["report.reports.view"],
  "/roles": ["employee.users.edit"],
  "/master-editor": ["settings.preferences.view", "employee.users.edit"],
  "/masters": ["settings.preferences.view", "employee.users.edit"],
  "/masters/asset-form": ["asset.register.create", "asset.register.edit", "asset.register.view"],
  "/masters/request-form": ["request.procurement.view"],
  "/masters/procurement-form": ["request.procurement.edit"],
  "/masters/categories": [],
  "/add-request": ["request.procurement.create"],
  "/edit-request": ["request.procurement.create"],
  "/asset-details": ["asset.register.view"],
  "/profile": [],
  "/procurements": ["request.procurement.edit"],
  "/work-orders": ["maintenance.logs.edit"],
  "/setup/users": ["employee.users.edit"],
  "/setup/vendors": ["request.procurement.edit", "employee.users.edit"],
  "/setup/products": ["asset.register.view"],
  "/setup/preferences": ["settings.preferences.view"],
  "/tracking": ["tracking.map.view"],
  "/my-assets": [],
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
