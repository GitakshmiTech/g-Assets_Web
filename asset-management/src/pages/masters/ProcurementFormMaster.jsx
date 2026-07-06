import { FORM_TYPES } from "../../utils/assetFormBuilder";
import FormBuilderView from "./components/FormBuilderView";
import { useFormBuilder } from "./useFormBuilder";
import "../MasterEditor.css";

function ProcurementFormMaster() {
  const builder = useFormBuilder(FORM_TYPES.PROCUREMENT);

  return (
    <div className="master-editor-page">
      <FormBuilderView builder={builder} />
    </div>
  );
}

export default ProcurementFormMaster;
