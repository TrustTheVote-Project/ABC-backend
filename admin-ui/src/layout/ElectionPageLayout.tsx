import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { ElectionProvider } from "context/ElectionContext";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import LoggedInLayout from "./LoggedInLayout";

interface ElectionPageLayoutProps {
  showStepper?: boolean;
  step: number;
  title: string;
  electionId?: string;
  children: ReactNode;
}

export default  function ElectionPageLayout({ 
  showStepper = false,
  step, 
  electionId = "", 
  title, 
  children 
}: ElectionPageLayoutProps) {
  const router = useRouter();
  const stepRouteBaseURL = `/elections/${electionId}`;

  const steps = [
    {label: "Election Name", route: `election-name`},
    {label: "Election Settings", route: `election-settings`},
    {label: "Upload EDF", route: `edf`},
    {label: "Upload Ballots", route: `ballots`},
    {label: "Test Election", route: `test`},
    {label: "Production Voter Data", route: `production-voter`},
    {label: "Review", route: `review`}
  ];

  return (
    <LoggedInLayout title={title}>
      <Grid container direction="column" style={{display: 'flex', minHeight: "100%" }}>
        <Grid item>
          <Typography variant="h1">{title}</Typography>
        </Grid>
        <Grid item flexGrow={1}>{children}</Grid>
        <Grid item pt={4} >
          <Stepper nonLinear activeStep={step}>
          {steps.map((electionStep, index) => (
            <Step key={electionStep.label} completed={step > index}>
              <StepButton color="inherit" onClick={() => router.push(`${stepRouteBaseURL}/${electionStep.route}`)}>
                {electionStep.label}
              </StepButton>
            </Step>
          ))}
          </Stepper>
        </Grid>
      </Grid>
    </LoggedInLayout>
  );
}
