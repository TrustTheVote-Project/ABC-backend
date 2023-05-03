import type { NextPage } from "next";

import { useRouter } from "next/router";
import { ElectionViewQueryParam, StepsRoutes } from "types";
import ElectionPageLayout from "layout/ElectionPageLayout";
import { ElectionProvider } from "context/ElectionContext";
import ElectionFormContainer from "component/ElectionFormContainer";
import { useEffect } from "react";

const EditElectionName: NextPage = () => {
  // const [election, setElection] = useState<Maybe<Election>>(null);
  const router = useRouter();
  const { query } = router;
  const { id, step } = query;

  const electionId = Array.isArray(id) ? id[0] : id || '';
  const stepName = Array.isArray(step) ? step[0] : step || '';
  const viewOnly:boolean = query.hasOwnProperty(ElectionViewQueryParam);
  const activeStepIndex = stepName ? Object.values(StepsRoutes).indexOf(stepName as StepsRoutes) : 0;
  const pageTitle = viewOnly ? 'View Election' : 'Update ELection';
  
  return (
    <ElectionPageLayout title={pageTitle}  step={activeStepIndex} electionId={electionId} >
      <ElectionProvider electionId={electionId}>
        <ElectionFormContainer stepName={stepName} viewOnly={viewOnly} />
      </ElectionProvider>
    </ElectionPageLayout>
  );
};

export default EditElectionName;
