import { ElectionContext } from "context/ElectionContext";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Election, Maybe, StepsRoutes } from "types";
import ElectionAttributesForm from "./election-steps/ElectionAttributesForm";
import ElectionConfigurationsForm from "./election-steps/ElectionConfigurationsForm";
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

  const StepComponent = () => {
    switch (stepName) {
      case StepsRoutes.ElectionName:
        return <ElectionAttributesForm election={election} onUpdateElection={updateElection} viewOnly={viewOnly} />;
      case StepsRoutes.ElectionSettings:
        return <ElectionConfigurationsForm election={election} onUpdateElection={updateElection} viewOnly={viewOnly} />;
      default:
        return null;
    }
  };

  return (
    <>
    {election && <StepComponent />}
    </>
  );
}