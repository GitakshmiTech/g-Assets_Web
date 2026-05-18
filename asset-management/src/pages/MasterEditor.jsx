import { useState } from "react";
import {
  getDefaultAssetFormConfig,
  getAssetFormSections,
  loadAssetFormConfig,
  resetAssetFormConfig,
  saveAssetFormConfig,
} from "../utils/assetFormBuilder";
import "./MasterEditor.css";

function MasterEditor() {
  const [config, setConfig] = useState(() => loadAssetFormConfig());
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [selectedSection, setSelectedSection] = useState("Asset Information");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const sections = getAssetFormSections(config);
  const sectionOptions = sections.map((section) => ({ key: section.key, title: section.title }));
  const totalFields = sections.reduce((total, section) => total + section.fields.length, 0);
  const visibleFields = Object.values(config).filter((field) => field.visible).length;

  const updateField = (name, key, value) => {
    setConfig((current) => ({
      ...current,
      [name]: {
        ...current[name],
        [key]: value,
        ...(key === "visible" && !value ? { required: false } : {}),
      },
    }));
  };

  const editFieldName = (field) => {
    setEditingField(field.name);
    setEditingLabel(field.label);
  };

  const saveFieldName = (field) => {
    const nextLabel = editingLabel.trim();
    if (!nextLabel) return;

    setConfig((current) => ({
      ...current,
      __fieldLabels: {
        ...(current.__fieldLabels || {}),
        [field.name]: nextLabel,
      },
    }));
    setEditingField(null);
    setEditingLabel("");
  };

  const startSectionEdit = (section) => {
    setEditingSection(section.key);
    setEditingSectionTitle(section.title);
  };

  const saveSectionName = (section) => {
    const nextTitle = editingSectionTitle.trim();
    if (!nextTitle) return;

    setConfig((current) => ({
      ...current,
      __sectionLabels: {
        ...(current.__sectionLabels || {}),
        [section.key]: nextTitle,
      },
      __customSections: (current.__customSections || []).map((item) =>
        item.key === section.key ? { ...item, title: nextTitle } : item,
      ),
    }));
    setEditingSection(null);
    setEditingSectionTitle("");
  };

  const deleteField = (field) => {
    if (field.locked) return;

    if (field.custom) {
      setConfig((current) => {
        const nextConfig = { ...current };
        delete nextConfig[field.name];
        return {
          ...nextConfig,
          __customFields: (current.__customFields || []).filter((item) => item.name !== field.name),
          __fieldLabels: Object.fromEntries(
            Object.entries(current.__fieldLabels || {}).filter(([name]) => name !== field.name),
          ),
        };
      });
      return;
    }

    updateField(field.name, "visible", false);
  };

  const saveChanges = () => {
    saveAssetFormConfig(config);
  };

  const addCustomField = () => {
    const label = newFieldLabel.trim();
    const sectionTitle =
      selectedSection === "__new__" ? newSectionTitle.trim() : "";
    const sectionKey =
      selectedSection === "__new__"
        ? `section_${sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now()}`
        : selectedSection;

    if (!label) return;
    if (!sectionKey) return;
    if (selectedSection === "__new__" && !sectionTitle) return;

    const baseName = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const name = `custom_${baseName || "field"}_${Date.now()}`;

    if (config[name]) return;

    setConfig((current) => ({
      ...current,
      __customSections:
        selectedSection === "__new__"
          ? [...(current.__customSections || []), { key: sectionKey, title: sectionTitle }]
          : current.__customSections || [],
      __customFields: [
        ...(current.__customFields || []),
        { name, label, custom: true, sectionKey, sectionTitle: selectedSection === "__new__" ? sectionTitle : undefined },
      ],
      [name]: {
        visible: true,
        required: false,
      },
    }));
    setNewFieldLabel("");
    setNewSectionTitle("");
    if (selectedSection === "__new__") {
      setSelectedSection(sectionKey);
    }
  };

  const addFieldToSection = (section) => {
    setSelectedSection(section.key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetDefaults = () => {
    resetAssetFormConfig();
    setConfig(getDefaultAssetFormConfig());
  };

  return (
    <div className="master-editor-page">
      <div className="master-editor-header">
        <div>
          <p>Form Builder</p>
          <h2>Master Editor</h2>
          <span>{visibleFields} of {totalFields} fields visible in Add Asset form</span>
        </div>
        <div className="master-editor-actions">
          <button type="button" className="reset-master-btn" onClick={resetDefaults}>
            Reset Defaults
          </button>
          <button type="button" className="save-master-btn" onClick={saveChanges}>
            Save Builder
          </button>
        </div>
      </div>

      <div className="custom-field-builder">
        <h3>Add Custom Field</h3>
        <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)}>
          {sectionOptions.map((section) => (
            <option value={section.key} key={section.key}>{section.title}</option>
          ))}
          <option value="__new__">Create New Header</option>
        </select>
        {selectedSection === "__new__" && (
          <input
            type="text"
            value={newSectionTitle}
            onChange={(event) => setNewSectionTitle(event.target.value)}
            placeholder="Enter new header name"
          />
        )}
        <input
          type="text"
          value={newFieldLabel}
          onChange={(event) => setNewFieldLabel(event.target.value)}
          placeholder="Enter field label"
        />
        <button type="button" className="save-master-btn" onClick={addCustomField}>
          Add Field
        </button>
      </div>

      <div className="master-section-list">
        {sections.map((section) => (
          <section className="master-section" key={section.key}>
            <div className="master-section-heading">
              {editingSection === section.key ? (
                <input
                  className="section-name-input"
                  type="text"
                  value={editingSectionTitle}
                  onChange={(event) => setEditingSectionTitle(event.target.value)}
                />
              ) : (
                <h3>{section.title}</h3>
              )}
              <div className="section-actions">
                {editingSection === section.key ? (
                  <>
                    <button type="button" className="field-edit-btn" onClick={() => saveSectionName(section)}>
                      Save
                    </button>
                    <button type="button" className="field-cancel-btn" onClick={() => setEditingSection(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className="field-edit-btn" onClick={() => startSectionEdit(section)}>
                    Edit Header
                  </button>
                )}
                <button type="button" className="save-master-btn" onClick={() => addFieldToSection(section)}>
                  Add Field Here
                </button>
              </div>
            </div>
            <div className="master-field-grid">
              {section.fields.map((field) => {
                const fieldConfig = config[field.name] || {};
                return (
                  <div className="master-field-card" key={field.name}>
                    <div>
                      {editingField === field.name ? (
                        <input
                          className="field-name-input"
                          type="text"
                          value={editingLabel}
                          onChange={(event) => setEditingLabel(event.target.value)}
                        />
                      ) : (
                        <strong>{field.label}</strong>
                      )}
                      <span>{field.name}</span>
                    </div>
                    <div className="master-field-controls">
                      <label className="master-toggle">
                        <input
                          type="checkbox"
                          checked={fieldConfig.visible}
                          disabled={fieldConfig.locked}
                          onChange={(event) => updateField(field.name, "visible", event.target.checked)}
                        />
                        Visible
                      </label>
                      <label className="master-toggle">
                        <input
                          type="checkbox"
                          checked={fieldConfig.required}
                          disabled={!fieldConfig.visible || fieldConfig.locked}
                          onChange={(event) => updateField(field.name, "required", event.target.checked)}
                        />
                        Required
                      </label>
                      {editingField === field.name ? (
                        <>
                          <button type="button" className="field-edit-btn" onClick={() => saveFieldName(field)}>
                            Save
                          </button>
                          <button type="button" className="field-cancel-btn" onClick={() => setEditingField(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="button" className="field-edit-btn" onClick={() => editFieldName(field)}>
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        className="field-delete-btn"
                        disabled={fieldConfig.locked}
                        onClick={() => deleteField({ ...field, locked: fieldConfig.locked })}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default MasterEditor;
