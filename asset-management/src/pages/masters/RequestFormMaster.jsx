import { FORM_TYPES } from "../../utils/assetFormBuilder";
import FormBuilderView from "./components/FormBuilderView";
import { useFormBuilder } from "./useFormBuilder";
import "../MasterEditor.css";

function RequestFormMaster() {
  const builder = useFormBuilder(FORM_TYPES.REQUEST);

  return (
    <div className="master-editor-page">
      <FormBuilderView builder={builder} />
    </div>
  );
}

export default RequestFormMaster;
