import { ElectionContext } from "context/ElectionContext";
import router from "next/router";
import { useContext } from "react";
import { StepsRoutes } from "types";
import ElectionAttributesForm from "./election-steps/ElectionAttributesForm";
import ElectionBallotsFilesForm from "./election-steps/ElectionBallotsFilesForm";
import ElectionConfigurationsForm from "./election-steps/ElectionConfigurationsForm";
import ElectionDefinitionFileForm from "./election-steps/ElectionDefinitionFileForm";
import ElectionProductionVotersForm from "./election-steps/ElectionProductionVotersForm";
import ElectionReview from "./election-steps/ElectionReview";
import ElectionTestForm from "./election-steps/ElectionTestForm";

import Loading from "./Loading";

interface ElectionFormContainerProps {
  stepName: string | undefined;
  viewOnly?: boolean;
}

export default function ElectionFormContainer({
  stepName,
  viewOnly = false
}: ElectionFormContainerProps) {

  const {election, updateElection } = useContext(ElectionContext);
  
  const handleCancel = () => {
    router.push("/dashboard");
  }

  const stepForms = {
    [StepsRoutes.ElectionName]: ElectionAttributesForm,
    [StepsRoutes.ElectionSettings]: ElectionConfigurationsForm,
    [StepsRoutes.UploadEDF]: ElectionDefinitionFileForm,
    [StepsRoutes.UploadBallots]: ElectionBallotsFilesForm,
    [StepsRoutes.ProductionVoterData]: ElectionProductionVotersForm,
    [StepsRoutes.TestElection]: ElectionTestForm,
    [StepsRoutes.Review]: ElectionReview
  };
  
  const CurrentForm = stepName ? stepForms[stepName as StepsRoutes] : null;

  return (
    <>
    {!election && <Loading />}
    {election && CurrentForm && (
      <CurrentForm 
        election={election} 
        onUpdateElection={updateElection} 
        onCancel={handleCancel} 
        viewOnly={viewOnly} 
      />
    )}
    </>
  );
}