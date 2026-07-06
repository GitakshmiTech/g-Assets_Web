const COMPUTER_CATEGORY_NAMES = ["laptop", "pc", "desktop", "computer", "mobile"];
const IT_CATEGORY_NAMES = [...COMPUTER_CATEGORY_NAMES, "monitor", "printer"];

const cloneCategories = (categories) =>
  categories.map((c) => ({
    ...c,
    subCategories: [...(c.subCategories || [])],
  }));

/** Default catalog — editable from Master Editor (Asset form). */
export const DEFAULT_CATEGORY_CATALOG = {
  groups: ["IT", "Building", "Furniture", "Vehicle", "General"],
  categories: [
    {
      id: "laptop",
      name: "Laptop",
      subCategories: ["Business Laptop", "Ultrabook", "Gaming"],
      network: true,
      group: "IT",
    },
    {
      id: "pc",
      name: "PC",
      subCategories: ["Desktop", "Workstation"],
      network: true,
      group: "IT",
    },
    {
      id: "desktop",
      name: "Desktop",
      subCategories: ["Office Desktop", "All-in-One"],
      network: true,
      group: "IT",
    },
    {
      id: "computer",
      name: "Computer",
      subCategories: ["Mini PC", "Tower"],
      network: true,
      group: "IT",
    },
    {
      id: "mobile",
      name: "Mobile",
      subCategories: ["Smartphone", "Tablet"],
      network: true,
      group: "IT",
    },
    {
      id: "monitor",
      name: "Monitor",
      subCategories: ["LCD", "LED", "Curved"],
      network: false,
      group: "IT",
    },
    {
      id: "printer",
      name: "Printer",
      subCategories: ["Laser", "Inkjet", "MFP"],
      network: false,
      group: "IT",
    },
    {
      id: "building",
      name: "Building",
      subCategories: ["Office Building", "Warehouse", "Apartment"],
      network: false,
      group: "Building",
    },
    {
      id: "vehicle",
      name: "Vehicle",
      subCategories: ["Car", "Bike", "Truck"],
      network: false,
      group: "Vehicle",
    },
    {
      id: "furniture",
      name: "Furniture",
      subCategories: ["Desk", "Table", "Cabinet"],
      network: false,
      group: "Furniture",
    },
    {
      id: "chair",
      name: "Chair",
      subCategories: ["Office", "Visitor", "Executive"],
      network: false,
      group: "Furniture",
    },
    {
      id: "long_term_assets",
      name: "Long Term Assets",
      subCategories: ["Building", "Machinery", "Land"],
      network: false,
      group: "Building",
    },
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
          group = "IT";
        } else {
          const nameLower = String(c.name).toLowerCase().trim();
          if (IT_CATEGORY_NAMES.includes(nameLower)) {
            group = "IT";
          } else if (["building", "office", "property"].includes(nameLower)) {
            group = "Building";
          } else if (["furniture", "chair", "desk", "table", "cabinet"].includes(nameLower)) {
            group = "Furniture";
          } else if (["vehicle", "car", "bike", "truck"].includes(nameLower)) {
            group = "Vehicle";
          } else {
            group = "General";
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
    ...categories.map((category) => category.group || "General"),
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
  if (!cat) return "General";

  const merged = mergeCategoryCatalog(catalog);
  const entry = merged.categories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
  if (entry) return entry.group || "General";

  const catLower = cat.toLowerCase();
  if (IT_CATEGORY_NAMES.includes(catLower)) {
    return "IT";
  }
  if (["building", "office", "property"].includes(catLower)) {
    return "Building";
  }
  if (["furniture", "chair", "desk", "table", "cabinet"].includes(catLower)) {
    return "Furniture";
  }
  if (["vehicle", "car", "bike", "truck"].includes(catLower)) {
    return "Vehicle";
  }
  return "General";
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
  const order = ["IT", "Building", "Furniture", "Vehicle", "General"];
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
