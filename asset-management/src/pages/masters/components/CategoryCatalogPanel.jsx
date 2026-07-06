import { useEffect, useState } from "react";
import { Save, RotateCcw, Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronRight, Tag, FolderOpen, Layers } from "lucide-react";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import "./CategoryCatalogPanel.css";

// ─── Inline edit input ────────────────────────────────────────────────────────
function InlineInput({ value, onSave, onCancel, placeholder = "" }) {
  const [val, setVal] = useState(value || "");
  const commit = () => { if (val.trim()) onSave(val.trim()); };
  return (
    <div className="cc-inline-edit">
      <input
        autoFocus
        className="cc-inline-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") onCancel(); }}
        placeholder={placeholder}
      />
      <button type="button" className="cc-btn cc-btn-confirm" onClick={commit} title="Save"><Check size={13} /></button>
      <button type="button" className="cc-btn cc-btn-cancel" onClick={onCancel} title="Cancel"><X size={13} /></button>
    </div>
  );
}

// ─── SubCategory Tag ──────────────────────────────────────────────────────────
function SubCategoryTag({ sub, categoryId, onRename, onRemove }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <InlineInput
        value={sub}
        placeholder="Sub-category name"
        onSave={(v) => { onRename(categoryId, sub, v); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }
  return (
    <span className="cc-sub-tag">
      <span className="cc-sub-tag-text">{sub}</span>
      <button type="button" className="cc-sub-tag-edit" onClick={() => setEditing(true)} title="Rename"><Pencil size={10} /></button>
      <button type="button" className="cc-sub-tag-del" onClick={() => onRemove(categoryId, sub)} title="Remove"><X size={10} /></button>
    </span>
  );
}

// ─── Add SubCategory Input ────────────────────────────────────────────────────
function AddSubInput({ categoryId, onAdd, autoOpen = false, onOpened }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(autoOpen);
  useEffect(() => {
    if (autoOpen) {
      setShow(true);
      if (onOpened) onOpened();
    }
  }, [autoOpen, onOpened]);
  const openInput = () => {
    setShow(true);
    if (onOpened) onOpened();
  };
  if (!show) {
    return (
      <button type="button" className="cc-add-sub-btn" onClick={openInput}>
        <Plus size={11} /> Add Sub-category
      </button>
    );
  }
  return (
    <div className="cc-inline-edit">
      <input
        autoFocus
        className="cc-inline-input cc-inline-input-sm"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) { onAdd(categoryId, val.trim()); setVal(""); setShow(false); }
          if (e.key === "Escape") { setVal(""); setShow(false); }
        }}
        placeholder="Type name & press Enter"
      />
      <button type="button" className="cc-btn cc-btn-confirm" onClick={() => { if (val.trim()) { onAdd(categoryId, val.trim()); setVal(""); setShow(false); } }}><Check size={13} /></button>
      <button type="button" className="cc-btn cc-btn-cancel" onClick={() => { setVal(""); setShow(false); }}><X size={13} /></button>
    </div>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ row, onUpdate, onRemove, onAddSubCategory, onRenameSubCategory, onRemoveSubCategory, deleteTarget, setDeleteTarget, autoOpenSubCategory, onAutoOpenSubCategoryHandled }) {
  const [editingName, setEditingName] = useState(!String(row.name || "").trim());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const subs = Array.isArray(row.subCategories) ? row.subCategories : [];

  return (
    <div className="cc-cat-row">
      <div className="cc-cat-row-header">
        <div className="cc-cat-name-wrap">
          <Tag size={14} className="cc-cat-icon" />
          {editingName ? (
            <InlineInput
              value={row.name}
              placeholder="Category name"
              onSave={(v) => { onUpdate(row.id, { name: v }); setEditingName(false); onAutoOpenSubCategoryHandled(row.id); }}
              onCancel={() => setEditingName(false)}
            />
          ) : (
            <span className="cc-cat-name">{row.name || <em className="cc-placeholder">Untitled category</em>}</span>
          )}
        </div>
        <div className="cc-cat-row-actions">
          {!editingName && (
            <button type="button" className="cc-icon-btn cc-icon-btn-edit" onClick={() => setEditingName(true)} title="Rename category">
              <Pencil size={13} />
            </button>
          )}
          <button
            type="button"
            className="cc-icon-btn cc-icon-btn-del"
            onClick={() => setConfirmDelete(true)}
            title="Delete category"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Sub-categories */}
      <div className="cc-sub-area">
        {subs.map((sub) => (
          <SubCategoryTag
            key={sub}
            sub={sub}
            categoryId={row.id}
            onRename={onRenameSubCategory}
            onRemove={onRemoveSubCategory}
          />
        ))}
        <AddSubInput
          categoryId={row.id}
          onAdd={onAddSubCategory}
          autoOpen={autoOpenSubCategory}
          onOpened={() => onAutoOpenSubCategoryHandled(null)}
        />
      </div>

      <ConfirmDeleteModal
        open={confirmDelete}
        title="Delete Category?"
        message={`Delete "${row.name || "this category"}" and all its sub-categories?`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { onRemove(row.id); setConfirmDelete(false); }}
      />
    </div>
  );
}

// ─── Group Section ────────────────────────────────────────────────────────────
function GroupSection({ groupName, rows, isOpen, onOpenChange, onRenameGroup, onDeleteGroup, onAddCategory, onUpdate, onRemove, onAddSubCategory, onRenameSubCategory, onRemoveSubCategory, onSave }) {
  const collapsed = !isOpen;
  const [editingName, setEditingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeSubCategoryCategoryId, setActiveSubCategoryCategoryId] = useState(null);

  return (
    <div className="cc-group-section">
      {/* Group Header */}
      <div className="cc-group-header">
        <button
          type="button"
          className="cc-group-collapse-btn"
          onClick={() => onOpenChange(groupName, collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
        </button>

        <FolderOpen size={15} className="cc-group-folder-icon" />

        {editingName ? (
          <InlineInput
            value={groupName}
            placeholder="Group name"
            onSave={(v) => {
              onRenameGroup(groupName, v);
              onOpenChange(v, true);
              setEditingName(false);
            }}
            onCancel={() => setEditingName(false)}
          />
        ) : (
          <span className="cc-group-name">{groupName}</span>
        )}

        <span className="cc-group-count">{rows.length} {rows.length === 1 ? "category" : "categories"}</span>

        <div className="cc-group-header-actions">
          <button
            type="button"
            className="cc-icon-btn cc-icon-btn-primary"
            onClick={() => {
              onOpenChange(groupName, true);
              onAddCategory(groupName);
            }}
            title="Add category to this group"
          >
            <Plus size={13} />
            <span>Add Category</span>
          </button>
          <button
            type="button"
            className="cc-icon-btn cc-icon-btn-save"
            onClick={onSave}
            title="Save changes"
          >
            <Save size={13} />
            <span>Save Changes</span>
          </button>
          {!editingName && (
            <button
              type="button"
              className="cc-icon-btn cc-icon-btn-edit"
              onClick={() => {
                onOpenChange(groupName, true);
                setEditingName(true);
              }}
              title="Rename group"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            type="button"
            className="cc-icon-btn cc-icon-btn-del"
            onClick={() => setConfirmDelete(true)}
            title="Delete group and all its categories"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Category Rows */}
      {!collapsed && (
        <div className="cc-group-body">
          <div className="cc-flow-strip">
            <span className="cc-flow-chip cc-flow-chip-group">Group</span>
            <ChevronRight size={13} />
            <span className="cc-flow-chip cc-flow-chip-category">Category</span>
            <ChevronRight size={13} />
            <span className="cc-flow-chip cc-flow-chip-sub">Sub-category</span>
          </div>
          {rows.length === 0 ? (
            <div className="cc-empty-group">
              <Layers size={18} className="cc-empty-icon" />
              <span>No categories in this group yet.</span>
              <button type="button" className="cc-text-btn" onClick={() => onAddCategory(groupName)}>
                <Plus size={12} /> Add one
              </button>
            </div>
          ) : (
            <>
              {rows.map((row) => (
                <CategoryRow
                  key={row.id}
                  row={row}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onAddSubCategory={onAddSubCategory}
                  onRenameSubCategory={onRenameSubCategory}
                  onRemoveSubCategory={onRemoveSubCategory}
                  deleteTarget={deleteTarget}
                  setDeleteTarget={setDeleteTarget}
                  autoOpenSubCategory={activeSubCategoryCategoryId === row.id}
                  onAutoOpenSubCategoryHandled={setActiveSubCategoryCategoryId}
                />
              ))}
              <button type="button" className="cc-add-category-inline" onClick={() => onAddCategory(groupName)}>
                <Plus size={11} /> Add Category
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        open={confirmDelete}
        title="Delete Group?"
        message={`Delete group "${groupName}" and all ${rows.length} ${rows.length === 1 ? "category" : "categories"} inside? This cannot be undone.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { onDeleteGroup(groupName); setConfirmDelete(false); }}
      />
    </div>
  );
}

// ─── Add Group Form ───────────────────────────────────────────────────────────
function AddGroupForm({ onAdd }) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");

  if (!show) {
    return (
      <button type="button" className="cc-btn-outline-primary cc-add-group-btn" onClick={() => setShow(true)}>
        <Plus size={14} /> New Group
      </button>
    );
  }

  return (
    <div className="cc-add-group-form">
      <input
        autoFocus
        className="cc-inline-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); setShow(false); }
          if (e.key === "Escape") { setVal(""); setShow(false); }
        }}
        placeholder="Group name, e.g. Electronics"
      />
      <button
        type="button"
        className="cc-btn cc-btn-confirm"
        onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); setShow(false); } }}
      >
        <Check size={13} /> Add
      </button>
      <button type="button" className="cc-btn cc-btn-cancel" onClick={() => { setVal(""); setShow(false); }}>
        <X size={13} /> Cancel
      </button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
function CategoryCatalogPanel({
  rows,
  groups,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onAdd,
  onUpdate,
  onRemove,
  onAddSubCategory,
  onRenameSubCategory,
  onRemoveSubCategory,
  onSave,
  onReset,
}) {
  // Group rows by their group
  const groupedRows = {};
  rows.forEach((row) => {
    const g = row.group || "General";
    if (!groupedRows[g]) groupedRows[g] = [];
    groupedRows[g].push(row);
  });

  // Unique ordered groups (from prop + any extra in rows)
  const allGroupNames = [...new Set([...groups, ...Object.keys(groupedRows)])];
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const setGroupOpen = (groupName, open) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (open) {
        next.add(groupName);
      } else {
        next.delete(groupName);
      }
      return next;
    });
  };

  const handleAddGroup = (groupName) => {
    const added = onAddGroup(groupName);
    if (added !== false) {
      setGroupOpen(groupName, true);
    }
    return added;
  };

  return (
    <div className="cc-panel">
      {/* Panel Header */}
      <div className="cc-panel-header">
        <div>
          <h2 className="cc-panel-title">
            <Layers size={20} className="cc-panel-title-icon" />
            Category Catalog
          </h2>
          <p className="cc-panel-subtitle">
            Organize assets using <strong>Groups → Categories → Sub-categories</strong>. In the asset form, users select Group first, then Category, then Sub-category.
          </p>
        </div>
        <div className="cc-panel-header-actions">
          <button type="button" className="cc-btn-ghost" onClick={onReset}>
            <RotateCcw size={14} /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Group Sections */}
      <div className="cc-groups-list">
        {allGroupNames.map((grp) => (
          <GroupSection
            key={grp}
            groupName={grp}
            rows={groupedRows[grp] || []}
            isOpen={openGroups.has(grp)}
            onOpenChange={setGroupOpen}
            onRenameGroup={onRenameGroup}
            onDeleteGroup={onDeleteGroup}
            onAddCategory={onAdd}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onAddSubCategory={onAddSubCategory}
            onRenameSubCategory={onRenameSubCategory}
            onRemoveSubCategory={onRemoveSubCategory}
            onSave={onSave}
          />
        ))}

        {/* Add Group */}
        <div className="cc-add-group-wrapper">
          <AddGroupForm onAdd={handleAddGroup} />
        </div>
      </div>

    </div>
  );
}

export default CategoryCatalogPanel;
