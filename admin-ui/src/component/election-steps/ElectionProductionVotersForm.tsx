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
import { setElectionBallots, setElectionDefinition, setElectionVoters } from "requests/election";

interface ElectionProductionVotersFormProps {
  election: Maybe<Election>;
  onUpdateElection(election: Election): void;
  onCancel(): void;
  viewOnly?: boolean;
}

export default function ElectionProductionVotersForm({
  election,
  onUpdateElection,
  onCancel,
  viewOnly = false
}: ElectionProductionVotersFormProps) {

  const { loadElection, voterFileStatus: voterFileStatusInDB, updateVoterFileStatus } = useContext(ElectionContext);

  const [voterFileStatus, setVoterFileStatus] = useState<{ [x: string]: any }>(voterFileStatusInDB);
  
  const router = useRouter();

  useEffect(() => {
    setVoterFileStatus(voterFileStatusInDB)
  }, [voterFileStatusInDB]);

  const saveNext = async () => {
    router.push(
      `/elections/${(election as Election)?.electionId}/${StepsRoutes.Review}`
    );
  };

  const formFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h2">Production Voter Data</Typography>
      </Grid>

      <Grid item sm={6}>
        <Typography variant="h3">Production Voter List</Typography>
        <FileUpload
          key="prod-voter-upload"
          disabled={!(election as Election) || !(election as Election)?.testComplete}
          disabledMessage={
            !(election as Election)?.testComplete
              ? "Production voter upload disabled:Testing not yet marked as complete"
              : "No election"
          }
          instructions="Upload a CSV file containing production voter data."
          onLoadFile={async (file) => {
            try {
              if ((election as Election)?.electionId) {
                setVoterFileStatus({ status: "uploading" });
                const resp = await setElectionVoters(
                  (election as Election)?.electionId,
                  file
                );
                updateVoterFileStatus(resp.objectKey);
                loadElection();
              }
              return;
            } catch (e: any) {
              setVoterFileStatus({
                status: "error",
                message: e?.data?.error_description,
              });
              // onUpdateElection(data as Election);
              console.log(e);
            }
          }}
        />
        <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
          {voterFileStatus.status === "error" && (
            <Box sx={{ color: "error.main" }}>
              Error Processing File: {voterFileStatus.message}
              <p>
                Please see: <Link href="/help">help information</Link>
              </p>
            </Box>
          )}
          {voterFileStatus.status === "uploading" && (
            <Box sx={{ textAlign: "center" }}>
              <Loading />
            </Box>
          )}
          {voterFileStatus.status === "started" && (
            <Box>
              Voter File Processing <Loading />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item sm={6}>
        {/* <Typography variant="h3">Production Voter List Upload History</Typography>
      <GC justifyContent="space-between">
        <GI><Typography variant="subtitle2">Date</Typography></GI>
        <GI>Action</GI>
      </GC> */}
      </Grid>
      <Grid item sm={6}>
        <Typography variant="h3">
          Production Voter List Upload Checklist
        </Typography>
        <Grid container spacing={2}>
          {voterFileStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>Voter File Uploaded</span>
            </Grid>
          )}
        </Grid>
        <CompletedCheckbox isComplete={(election as Election)?.voterCount > 0}>
          {(election as Election)?.voterCount || 0} voters uploaded
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
          Review
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
