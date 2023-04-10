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
import { setElectionDefinition } from "requests/election";

interface ElectionDefinitionFileFormProps {
  election: Maybe<Election>;
  onUpdateElection(election: Election): void;
  onCancel(): void;
  viewOnly?: boolean;
}

export default function ElectionDefinitionFileForm({
  election,
  onUpdateElection,
  onCancel,
  viewOnly = false
}: ElectionDefinitionFileFormProps) {

  const { loadElection, edfStatus: edfStatusInDB, updateEDFStatus } = useContext(ElectionContext);

  const [edfStatus, setEDFStatus] = useState<{ [x: string]: any }>(edfStatusInDB);
  
  const router = useRouter();

  useEffect(() => {
    setEDFStatus(edfStatusInDB)
  }, [edfStatusInDB]);

  const saveNext = async () => {
    router.push(
      `/elections/${(election as Election)?.electionId}/${StepsRoutes.UploadBallots}`
    );
  };
  
  const formFields = (
    <Grid container spacing={4}>
      <Grid item sm={6}>
        <Typography variant="h3">Upload Election Definition File</Typography>
        {edfStatus.status === "complete" ? (
          <>
            <p>Success! EDF uploaded</p>
          </>
        ) : (
          <>
            <FileUpload
              key="edf-upload"
              disabled={!election || election?.edfSet}
              disabledMessage="EDF upload disabled:Election Definition File already set"
              instructions="Upload a new Election Definition File in JSON format."
              onLoadFile={async (file) => {
                try {
                  if ((election as Election)?.electionId) {
                    setEDFStatus({ status: "uploading" });
                    console.log('ELection ID', (election as Election)?.electionId);
                    const resp = await setElectionDefinition(
                      (election as Election)?.electionId,
                      file
                    );
                    updateEDFStatus(resp.objectKey);
                    loadElection();
                    return;
                  }
                } catch (e: any) {
                  setEDFStatus({
                    status: "error",
                    message: e?.data?.error_description,
                  });
                  console.log(e);
                }
              }}
            />
            <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
              {edfStatus.status === "error" && (
                <Box sx={{ color: "error.main" }}>
                  Error Processing File: {edfStatus.message}
                  <p>
                    Please see: <Link href="/help">help information</Link>
                  </p>
                </Box>
              )}
              {edfStatus.status === "uploading" && (
                <Box sx={{ textAlign: "center" }}>
                  <Loading />
                </Box>
              )}
              {edfStatus.status === "started" && (
                <Box>
                  EDF File Processing <Loading />
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
          {edfStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>EDF File Uploaded</span>
            </Grid>
          )}
        </Grid>

        <CompletedCheckbox
          isComplete={(election as Election)?.ballotDefinitionCount > 0}
        >
          {(election as Election)?.ballotDefinitionCount || 0} ballot definitions
          uploaded
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
      <Grid container direction="column" spacing={4}>
        <Grid item flexGrow={1}>{formFields}</Grid>
        {!viewOnly && <Grid item>{actions}</Grid>}
      </Grid>
    )}
  </>
  );
}
