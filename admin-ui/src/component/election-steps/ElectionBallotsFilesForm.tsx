import {
  Button,
  Grid,
  Alert,
  Typography,
  Box,
  Link,
} from "@mui/material";
import {
  Election,
  ElectionCreate,
  Maybe,
  StepsRoutes,
} from "types";


import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CheckIcon from "@mui/icons-material/Check";
import {
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/router";

import LoadingButton from "component/LoadingButton";
import Loading from "component/Loading";
import CompletedCheckbox from "component/CompletedCheckbox";
import FileUpload from "component/FileUpload";
import { ElectionContext } from "context/ElectionContext";
import { setElectionBallots, setElectionDefinition } from "requests/election";

interface ElectionBallotsFilesFormProps {
  election: Maybe<Election>;
  onUpdateElection(election: Election): void;
  onCancel(): void;
  viewOnly?: boolean;
}

export default function ElectionBallotsFilesForm({
  election,
  onUpdateElection,
  onCancel,
  viewOnly = false
}: ElectionBallotsFilesFormProps) {

  const { loadElection, ballotsStatus: ballotStatusInDB, updateBallotsStatus } = useContext(ElectionContext);

  const [ballotsStatus, setBallotsStatus] = useState<{ [x: string]: any }>(ballotStatusInDB);
  
  const router = useRouter();

  useEffect(() => {
    setBallotsStatus(ballotStatusInDB)
  }, [ballotStatusInDB]);

  const saveNext = async () => {
    router.push(
      `/elections/${(election as Election)?.electionId}/${StepsRoutes.TestElection}`
    );
  };

  const formFields = (
    <Grid container spacing={4}>
      <Grid item sm={6}>
        <Typography variant="h3">Upload Ballot Files</Typography>
        {ballotsStatus.status === "complete" ? (
          <p>Success! Ballots uploaded</p>
        ) : (
          <>
            <FileUpload
              key="ballot-upload"
              disabled={
                !(election as Election) ||
                !(election as Election)?.edfSet ||
                (election as Election)?.ballotsSet
              }
              disabledMessage={
                !(election as Election)?.edfSet
                  ? "Ballot upload disabled:EDF not yet set"
                  : (election as Election)?.ballotsSet
                  ? "Ballot upload disabled:Ballots already set"
                  : "No election for upload"
              }
              instructions="Upload a zip file containing ballot PDFs."
              onLoadFile={async (file) => {
                try {
                  if ((election as Election)?.electionId) {
                    setBallotsStatus({ status: "uploading" });
                    const resp = await setElectionBallots(
                      (election as Election)?.electionId,
                      file
                    );
                    updateBallotsStatus(resp.objectKey);
                    loadElection();
                  }
                  return;
                } catch (e: any) {
                  setBallotsStatus({
                    status: "error",
                    message: e?.data?.error_description,
                  });
                  // onUpdateElection(data as Election);
                  console.log(e);
                }
              }}
            />

            <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
              {ballotsStatus.status === "error" && (
                <Box sx={{ color: "error.main" }}>
                  Error Processing File: {ballotsStatus.message}
                  <p>
                    Please see: <Link href="/help">help information</Link>
                  </p>
                </Box>
              )}
              {ballotsStatus.status === "uploading" && (
                <Box sx={{ textAlign: "center" }}>
                  <Loading />
                </Box>
              )}
              {ballotsStatus.status === "started" && (
                <Box>
                  Ballot File Processing <Loading />
                </Box>
              )}
            </Box>
          </>
        )}
      </Grid>
      <Grid item sm={6}></Grid>
      <Grid item>
        <Typography variant="h3">Ballot checklist</Typography>
        <Grid container spacing={2}>
          {ballotsStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>Ballots Uploaded</span>
            </Grid>
          )}
        </Grid>

        <CompletedCheckbox
          isComplete={(election as Election)?.ballotDefinitionCount > 0}
        >
          {(election as Election)?.ballotDefinitionCount || 0} ballot definitions
          uploaded
        </CompletedCheckbox>
        <CompletedCheckbox isComplete={(election as Election)?.ballotCount > 0}>
          {(election as Election)?.ballotCount || 0} ballot files uploaded
        </CompletedCheckbox>
      </Grid>
    </Grid>
  );


  const actions = (
    <Grid container justifyContent="center" spacing={2} alignItems="flex-end">
      <Grid item xs={4} sm={4} md={3}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Grid>
      <Grid item xs={4} sm={4} md={3}>
        <LoadingButton endIcon={<NavigateNextIcon />} onClick={saveNext}>
          Continue
        </LoadingButton>
      </Grid>
    </Grid>
  );

  
  return (
  <>
    {election && (
      <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
        <Grid item flexGrow={1}>{formFields}</Grid>
        {!viewOnly && <Grid item>{actions}</Grid>}
      </Grid>
    )}
  </>
  );
}
