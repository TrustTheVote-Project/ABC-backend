import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { ElectionProvider } from "context/ElectionContext";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { ElectionSteps, ElectionViewQueryParam } from "types/election";
import LoggedInLayout from "./LoggedInLayout";

interface ElectionPageLayoutProps {
  hideStepper?: boolean;
  step?: number;
  title: string;
  electionId?: string;
  children: ReactNode;
}

export default  function ElectionPageLayout({ 
  hideStepper = false,
  step = 0, 
  electionId = "", 
  title, 
  children 
}: ElectionPageLayoutProps) {
  const router = useRouter();
  const stepRouteBaseURL = `/elections/${electionId}`;
  const { query } = router;
  const isViewMode = query.hasOwnProperty(ElectionViewQueryParam);

  return (
    <LoggedInLayout title={title}>
      <Grid container direction="column" spacing={4} style={{display: 'flex', minHeight: "100%" }}>
        <Grid item>
          <Typography variant="h1">{title}</Typography>
        </Grid>
        <Grid item flexGrow={1} style={{display: 'flex'}}>{children}</Grid>
        {!hideStepper && 
          <Grid item pt={4} >
            <Stepper nonLinear activeStep={step}>
            {ElectionSteps.map((electionStep, index) => (
              <Step key={electionStep.label} completed={step > index}>
                <StepButton 
                  color="inherit" 
                  onClick={() => {
                    router.push({
                      pathname: `${stepRouteBaseURL}/${electionStep.route}`,
                      query: isViewMode ?  ElectionViewQueryParam  : undefined
                    })
                  }}
                >
                  {electionStep.label}
                </StepButton>
              </Step>
            ))}
            </Stepper>
          </Grid>
        }
      </Grid>
    </LoggedInLayout>
  );
}
