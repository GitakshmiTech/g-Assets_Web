import CategoryCatalogPanel from "./components/CategoryCatalogPanel";
import { useCategoryCatalog } from "./useCategoryCatalog";
import "../MasterEditor.css";

function CategoryMaster() {
  const catalog = useCategoryCatalog();

  return (
    <div className="master-editor-page" style={{ margin: "1rem auto" }}>
      <CategoryCatalogPanel
        rows={catalog.categoryRows}
        groups={catalog.groups}
        onAddGroup={catalog.addGroup}
        onRenameGroup={catalog.renameGroup}
        onDeleteGroup={catalog.deleteGroup}
        onAdd={catalog.addCategoryRow}
        onUpdate={catalog.updateCategoryRow}
        onRemove={catalog.removeCategoryRow}
        onAddSubCategory={catalog.addSubCategory}
        onRenameSubCategory={catalog.renameSubCategory}
        onRemoveSubCategory={catalog.removeSubCategory}
        onSave={catalog.saveChanges}
        onReset={catalog.resetDefaults}
      />
    </div>
  );
}

export default CategoryMaster;
