import { useState } from "react";
import {
  FORM_TYPES,
  getDefaultFormConfig,
  loadFormConfig,
  saveFormConfig,
} from "../../utils/assetFormBuilder";
import { mergeCategoryCatalog } from "../../utils/categoryCatalog";
import { useToast } from "../../components/toast/toastStore";

const DEFAULT_GROUP_ORDER = ["IT", "Building", "Furniture", "Vehicle", "General"];

function getGroupsFromCategories(categories) {
  const seen = new Set();
  const extra = [];
  categories.forEach((c) => {
    const g = c.group || "General";
    if (!seen.has(g)) {
      seen.add(g);
      if (!DEFAULT_GROUP_ORDER.includes(g)) extra.push(g);
    }
  });
  const ordered = DEFAULT_GROUP_ORDER.filter((g) => seen.has(g));
  return [...ordered, ...extra];
}

function getGroupsFromCatalog(catalog) {
  const savedGroups = Array.isArray(catalog?.groups)
    ? catalog.groups.map((group) => String(group).trim()).filter(Boolean)
    : [];
  return getGroupsFromCategories([
    ...savedGroups.map((group) => ({ group })),
    ...((catalog?.categories) || []),
  ]);
}

export function useCategoryCatalog() {
  const { showToast } = useToast();
  const [config, setConfig] = useState(() => loadFormConfig(FORM_TYPES.ASSET));

  // Derive the live category list (always use merged defaults if empty)
  const getRawCategories = (cfg) => {
    const list = cfg?.__categoryCatalog?.categories;
    return Array.isArray(list) ? list : mergeCategoryCatalog(null).categories;
  };

  const categoryRows = getRawCategories(config);

  // Derived groups list from categories
  const groups = getGroupsFromCatalog(config.__categoryCatalog);

  // ─── GROUP OPERATIONS ────────────────────────────────────────────────────────

  const addGroup = (groupName) => {
    const name = String(groupName || "").trim();
    if (!name) {
      showToast({ title: "Enter group name", type: "info" });
      return false;
    }
    const existing = getGroupsFromCatalog(config.__categoryCatalog);
    if (existing.some((g) => g.toLowerCase() === name.toLowerCase())) {
      showToast({ title: "Group already exists", type: "info" });
      return false;
    }
    setConfig((cur) => {
      const currentGroups = getGroupsFromCatalog(cur.__categoryCatalog);
      return {
        ...cur,
        __categoryCatalog: {
          ...(cur.__categoryCatalog || {}),
          groups: [...currentGroups, name],
          categories: getRawCategories(cur),
        },
      };
    });
    return true;
  };

  const renameGroup = (oldName, newName) => {
    const trimmed = String(newName || "").trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase() === oldName.toLowerCase()) return true;
    const existing = getGroupsFromCatalog(config.__categoryCatalog);
    if (existing.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      showToast({ title: "Group name already exists", type: "info" });
      return false;
    }
    setConfig((cur) => {
      const list = getRawCategories(cur).map((row) =>
        row.group === oldName ? { ...row, group: trimmed, network: trimmed === "IT" || row.network } : row
      );
      const nextGroups = getGroupsFromCatalog(cur.__categoryCatalog).map((group) =>
        group === oldName ? trimmed : group
      );
      return { ...cur, __categoryCatalog: { ...(cur.__categoryCatalog || {}), groups: nextGroups, categories: list } };
    });
    return true;
  };

  const deleteGroup = (groupName) => {
    setConfig((cur) => {
      const list = getRawCategories(cur).filter((row) => row.group !== groupName);
      const nextGroups = getGroupsFromCatalog(cur.__categoryCatalog).filter((group) => group !== groupName);
      return {
        ...cur,
        __categoryCatalog: {
          ...(cur.__categoryCatalog || {}),
          groups: nextGroups,
          categories: list,
        },
      };
    });
  };

  // ─── CATEGORY OPERATIONS ─────────────────────────────────────────────────────

  const addCategoryRow = (groupName) => {
    const grp = groupName || "General";
    setConfig((cur) => {
      const list = getRawCategories(cur);
      // Don't allow duplicate empty rows in same group
      if (list.some((r) => r.group === grp && !String(r.name || "").trim())) {
        showToast({ title: "Fill the empty category first", type: "info" });
        return cur;
      }
      return {
        ...cur,
        __categoryCatalog: {
          ...(cur.__categoryCatalog || {}),
          categories: [
            ...list,
            { id: `cat_${Date.now()}`, name: "", subCategories: [], network: grp === "IT", group: grp },
          ],
        },
      };
    });
  };

  const updateCategoryRow = (id, patch) => {
    setConfig((cur) => {
      const list = getRawCategories(cur).map((row) => (row.id === id ? { ...row, ...patch } : row));
      return { ...cur, __categoryCatalog: { ...(cur.__categoryCatalog || {}), categories: list } };
    });
  };

  const removeCategoryRow = (id) => {
    setConfig((cur) => {
      const list = getRawCategories(cur).filter((row) => row.id !== id);
      return {
        ...cur,
        __categoryCatalog: {
          ...(cur.__categoryCatalog || {}),
          categories: list,
        },
      };
    });
  };

  // ─── SUBCATEGORY OPERATIONS ──────────────────────────────────────────────────

  const addSubCategory = (categoryId, subName) => {
    const trimmed = String(subName || "").trim();
    if (!trimmed) return;
    setConfig((cur) => {
      const list = getRawCategories(cur).map((row) => {
        if (row.id !== categoryId) return row;
        const subs = Array.isArray(row.subCategories) ? row.subCategories : [];
        if (subs.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) return row;
        return { ...row, subCategories: [...subs, trimmed] };
      });
      return { ...cur, __categoryCatalog: { ...(cur.__categoryCatalog || {}), categories: list } };
    });
  };

  const renameSubCategory = (categoryId, oldSub, newSub) => {
    const trimmed = String(newSub || "").trim();
    if (!trimmed) return;
    setConfig((cur) => {
      const list = getRawCategories(cur).map((row) => {
        if (row.id !== categoryId) return row;
        const subs = (row.subCategories || []).map((s) => (s === oldSub ? trimmed : s));
        return { ...row, subCategories: subs };
      });
      return { ...cur, __categoryCatalog: { ...(cur.__categoryCatalog || {}), categories: list } };
    });
  };

  const removeSubCategory = (categoryId, subName) => {
    setConfig((cur) => {
      const list = getRawCategories(cur).map((row) => {
        if (row.id !== categoryId) return row;
        return { ...row, subCategories: (row.subCategories || []).filter((s) => s !== subName) };
      });
      return { ...cur, __categoryCatalog: { ...(cur.__categoryCatalog || {}), categories: list } };
    });
  };

  // ─── SAVE / RESET ─────────────────────────────────────────────────────────────

  const saveChanges = () => {
    const rawCategories = getRawCategories(config);
    const categories = rawCategories.map((row) => ({
      ...row,
      name: String(row.name || "").trim(),
      group: String(row.group || "General").trim() || "General",
      subCategories: Array.isArray(row.subCategories)
        ? row.subCategories.map((sub) => String(sub).trim()).filter(Boolean)
        : [],
    }));
    const savedConfig = {
      ...config,
      __categoryCatalog: {
        ...(config.__categoryCatalog || {}),
        groups,
        categories,
      },
    };

    setConfig(savedConfig);
    saveFormConfig(FORM_TYPES.ASSET, savedConfig);
    window.dispatchEvent(new CustomEvent("asset-form-builder-updated"));
    showToast({ title: "Saved", message: "Category catalog saved successfully." });
  };

  const resetDefaults = () => {
    const defaults = getDefaultFormConfig(FORM_TYPES.ASSET);
    setConfig((current) => ({
      ...current,
      __categoryCatalog: defaults.__categoryCatalog,
    }));
    showToast({ title: "Reset", message: "Category catalog reset to defaults." });
  };

  return {
    categoryRows,
    groups,
    addGroup,
    renameGroup,
    deleteGroup,
    addCategoryRow,
    updateCategoryRow,
    removeCategoryRow,
    addSubCategory,
    renameSubCategory,
    removeSubCategory,
    saveChanges,
    resetDefaults,
  };
}
