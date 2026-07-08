const COMPUTER_CATEGORY_NAMES = ["computers & workstations", "server room & data infrastructure", "networking equipment", "mobile & smart devices"];
const IT_CATEGORY_NAMES = [...COMPUTER_CATEGORY_NAMES, "monitors & peripherals", "office automation & av devices", "power & electrical assets", "security & access control"];

const cloneCategories = (categories) =>
  categories.map((c) => ({
    ...c,
    subCategories: [...(c.subCategories || [])],
  }));

/** Default catalog — editable from Master Editor (Asset form). */
export const DEFAULT_CATEGORY_CATALOG = {
  groups: ["Hardware", "Digital", "Miscellaneous"],
  categories: [
    {
      id: "computers_workstations",
      name: "Computers & Workstations",
      subCategories: [
        "Developer Laptops",
        "Designer MacBooks",
        "Management/HR Laptops",
        "Office Desktops",
        "All-in-One (AIO) PCs",
        "Testing Workstations",
        "Linux/Ubuntu Workstations",
        "Spare/Backup Laptops"
      ],
      network: true,
      group: "Hardware",
    },
    {
      id: "monitors_peripherals",
      name: "Monitors & Peripherals",
      subCategories: [
        "24-inch Monitors",
        "27-inch Monitors",
        "Dual Monitor Mounts / Arms",
        "Wired Keyboards",
        "Wireless Keyboards",
        "Mechanical Keyboards",
        "Standard Optical Mice",
        "Ergonomic/Wireless Mice",
        "Graphic Tablets / Stylus Pens",
        "Laptop Docking Stations / USB-C Hubs",
        "Laptop Cooling Pads",
        "External Webcams",
        "Noise-Cancelling Headsets",
        "Wireless Earbuds"
      ],
      network: false,
      group: "Hardware",
    },
    {
      id: "server_infrastructure",
      name: "Server Room & Data Infrastructure",
      subCategories: [
        "Rack Servers",
        "Tower Servers",
        "Blade Servers",
        "NAS Storage Boxes",
        "SAN Arrays",
        "Internal Hard Drives",
        "Internal SSDs",
        "External Portable HDDs/SSDs",
        "Server Racks",
        "PDU",
        "Server KVM Switches",
        "Hardware Security Modules"
      ],
      network: true,
      group: "Hardware",
    },
    {
      id: "networking_equipment",
      name: "Networking Equipment",
      subCategories: [
        "Core Routers",
        "Edge Firewalls",
        "Managed Network Switches",
        "Unmanaged Network Switches",
        "Wi-Fi Access Points",
        "Wi-Fi Controllers",
        "LAN Patch Panels",
        "VoIP Gateways",
        "IP Phones",
        "Network Range Extenders",
        "Fiber Optic Media Converters",
        "4G/5G Backup Dongles"
      ],
      network: true,
      group: "Hardware",
    },
    {
      id: "mobile_smart_devices",
      name: "Mobile & Smart Devices",
      subCategories: [
        "Android Testing Phones",
        "iOS Testing Phones",
        "Android Tablets",
        "iPads",
        "Smart Watches",
        "POS Terminals",
        "Barcode Scanners"
      ],
      network: true,
      group: "Hardware",
    },
    {
      id: "office_automation_av",
      name: "Office Automation & AV Devices",
      subCategories: [
        "Heavy-Duty Laser Printers",
        "Barcode/Label Printers",
        "Flatbed Scanners",
        "Conference Room Projectors",
        "Smart TVs/Displays",
        "Video Conferencing Systems",
        "Bluetooth Conference Speakers",
        "Smart Podiums/Mics",
        "Digital Signage Displays"
      ],
      network: true,
      group: "Hardware",
    },
    {
      id: "power_electrical",
      name: "Power & Electrical Assets",
      subCategories: [
        "Online Central UPS",
        "Desktop Small UPS",
        "UPS Battery Banks",
        "Inverters",
        "Server Room Precision ACs",
        "Office Standard ACs",
        "Diesel Generator",
        "Automatic Voltage Stabilizers"
      ],
      network: false,
      group: "Hardware",
    },
    {
      id: "security_access_control",
      name: "Security & Access Control",
      subCategories: [
        "CCTV Cameras",
        "NVR/DVR",
        "CCTV Hard Drives",
        "Biometric Machines",
        "RFID Card Readers",
        "Electromagnetic Door Locks",
        "Fire Alarm Panels",
        "Smoke Detectors",
        "Digital Safes"
      ],
      network: true,
      group: "Hardware",
    },
    {
      id: "core_software_os",
      name: "Core Software & Operating Systems",
      subCategories: [
        "Windows 11 Pro Licenses",
        "Windows Server Licenses",
        "Windows Server CALs",
        "macOS MDM Profiles",
        "RHEL Subscriptions",
        "Microsoft 365",
        "Google Workspace",
        "Adobe Creative Cloud",
        "Figma Licenses",
        "Canva Pro"
      ],
      network: false,
      group: "Digital",
    },
    {
      id: "development_tech_software",
      name: "Development & Tech Software",
      subCategories: [
        "GitHub/GitLab Subscriptions",
        "JetBrains IDE Licenses",
        "Visual Studio Enterprise",
        "Postman Enterprise",
        "Docker Desktop",
        "Jira/Confluence",
        "Slack/Discord Premium",
        "Zoom/Webex"
      ],
      network: false,
      group: "Digital",
    },
    {
      id: "hosting_cloud_web",
      name: "Hosting, Cloud & Web Infrastructure",
      subCategories: [
        "AWS Accounts & Instances",
        "DigitalOcean Droplets",
        "Render/Heroku",
        "Plesk/cPanel VPS",
        "Premium WordPress Themes",
        "Premium WordPress Plugins",
        "Database Software Licenses"
      ],
      network: false,
      group: "Digital",
    },
    {
      id: "digital_certificates_virtual",
      name: "Digital Certificates & Virtual Property",
      subCategories: [
        "Domain Names",
        "SSL/TLS Certificates",
        "Static IP Addresses",
        "Apple Developer Account",
        "Google Play Console",
        "Third-Party API Keys"
      ],
      network: false,
      group: "Digital",
    },
    {
      id: "security_backup_software",
      name: "Security & Backup Software",
      subCategories: [
        "Antivirus/EDR",
        "Cloud Backup Subscriptions",
        "VPN Services",
        "Password Managers",
        "Firewall Security Subscriptions"
      ],
      network: false,
      group: "Digital",
    },
    {
      id: "non_it_facilities",
      name: "Non-IT Facilities",
      subCategories: [
        "Ergonomic Office Chairs",
        "Developer Desks",
        "Conference Room Tables",
        "Cafeteria Machines",
        "Water Purifiers/RO",
        "Paper Shredders"
      ],
      network: false,
      group: "Miscellaneous",
    }
  ],
};

/**
 * Merge saved catalog with defaults (fixes missing fields / empty list).
 */
export function mergeCategoryCatalog(saved) {
  if (!saved || typeof saved !== "object" || !Array.isArray(saved.categories)) {
    return {
      groups: [...DEFAULT_CATEGORY_CATALOG.groups],
      categories: cloneCategories(DEFAULT_CATEGORY_CATALOG.categories),
    };
  }

  const savedGroups = Array.isArray(saved.groups)
    ? saved.groups.map((g) => String(g).trim()).filter(Boolean)
    : [];

  const categories = saved.categories
    .filter((c) => c && String(c.name || "").trim())
    .map((c, index) => {
      const subs = Array.isArray(c.subCategories)
        ? c.subCategories.map((s) => String(s).trim()).filter(Boolean)
        : String(c.subCategories || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

      // Infer group if not set
      let group = c.group;
      if (!group) {
        if (c.network) {
          group = "Hardware";
        } else {
          const nameLower = String(c.name).toLowerCase().trim();
          if (IT_CATEGORY_NAMES.includes(nameLower)) {
            group = "Hardware";
          } else if (["software", "cloud", "digital"].some(keyword => nameLower.includes(keyword))) {
            group = "Digital";
          } else {
            group = "Miscellaneous";
          }
        }
      }

      const nameLower = String(c.name).toLowerCase().trim();
      const network =
        c.network === undefined
          ? COMPUTER_CATEGORY_NAMES.includes(nameLower)
          : Boolean(c.network);

      return {
        id: String(c.id || `cat_${index}_${String(c.name).trim()}`),
        name: String(c.name).trim(),
        subCategories: subs,
        network,
        group: group,
      };
    });

  const groups = [...new Set([
    ...savedGroups,
    ...categories.map((category) => category.group || "Miscellaneous"),
  ])];

  if (!categories.length && !groups.length) {
    return {
      groups: [...DEFAULT_CATEGORY_CATALOG.groups],
      categories: cloneCategories(DEFAULT_CATEGORY_CATALOG.categories),
    };
  }

  return { groups, categories };
}

/**
 * Get the group name for a given category name.
 */
export function getCategoryGroup(categoryName, catalog) {
  const cat = String(categoryName || "").trim();
  if (!cat) return "Miscellaneous";

  const merged = mergeCategoryCatalog(catalog);
  const entry = merged.categories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
  if (entry) return entry.group || "Miscellaneous";

  const catLower = cat.toLowerCase();
  if (IT_CATEGORY_NAMES.includes(catLower)) {
    return "Hardware";
  }
  if (["software", "cloud", "digital"].some(keyword => catLower.includes(keyword))) {
    return "Digital";
  }
  return "Miscellaneous";
}

/**
 * Whether the selected category should show IP + computer specification sections.
 */
export function isNetworkAssetCategory(category, catalog) {
  const cat = String(category || "").trim();
  if (!cat) return false;

  const merged = mergeCategoryCatalog(catalog);
  const entry = merged.categories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
  if (entry) return Boolean(entry.network);

  return COMPUTER_CATEGORY_NAMES.includes(cat.toLowerCase());
}

export function getSubcategoriesForCategory(category, catalog) {
  const cat = String(category || "").trim();
  if (!cat) return [];
  const merged = mergeCategoryCatalog(catalog);
  const entry = merged.categories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
  return entry?.subCategories || [];
}

/**
 * Get all unique group names from the catalog.
 * Returns them in a predictable order.
 */
export function getAvailableGroups(catalog) {
  const merged = mergeCategoryCatalog(catalog);
  const seen = new Set();
  const order = ["Hardware", "Digital", "Miscellaneous"];
  (merged.groups || []).forEach((group) => {
    if (group) seen.add(group);
  });
  merged.categories.forEach((c) => {
    if (c.group) seen.add(c.group);
  });
  // Return in preferred order, then any extras
  const result = order.filter((g) => seen.has(g));
  seen.forEach((g) => { if (!order.includes(g)) result.push(g); });
  return result;
}

/**
 * Get all categories that belong to a given group.
 */
export function getCategoriesForGroup(group, catalog) {
  if (!group) return [];
  const merged = mergeCategoryCatalog(catalog);
  return merged.categories.filter((c) => c.group === group);
}
