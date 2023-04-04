import type { NextPage } from "next";

import { useRouter } from "next/router";
import { StepsRoutes } from "types";
import ElectionName from "component/election-steps/ElectionName";
import ElectionPageLayout from "layout/ElectionPageLayout";
import ElectionSettings from "component/election-steps/ElectionSettings";
import { ElectionProvider } from "context/ElectionContext";

const EditElectionName: NextPage = () => {
  // const [election, setElection] = useState<Maybe<Election>>(null);
  const router = useRouter();
  const { query } = router;
  const { id, step, view } = query;
  
  const electionId = Array.isArray(id) ? id[0] : id;
  const stepName = Array.isArray(step) ? step[0] : step;
  const viewOnly:boolean = !!view;
  const activeStepIndex = stepName ? Object.values(StepsRoutes).indexOf(stepName as StepsRoutes) : 0;
  
  let component = null;
  
  switch (stepName) {
    case StepsRoutes.ElectionName:
      component = <ElectionName  viewOnly={viewOnly} />;
      break;
    case StepsRoutes.ElectionSettings:
      component = <ElectionSettings viewOnly={viewOnly} />;
      break;
  }
  
  if (!component) {
    router.push("/dashboard");
  }
  
  return (
    <ElectionPageLayout title="Update Election"  step={activeStepIndex} electionId={electionId} >
      <ElectionProvider electionId={electionId}>
      {component}
      </ElectionProvider>
    </ElectionPageLayout>
  );
};

export default EditElectionName;
