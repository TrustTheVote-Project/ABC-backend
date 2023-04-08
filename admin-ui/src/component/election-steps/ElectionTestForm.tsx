import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ConstructionIcon from "@mui/icons-material/Construction";
import ElectionCard from "component/ElectionCard";
import LoadingButton from "component/LoadingButton";
import {
  Election,
  ElectionCreate,
  ElectionStatus,
  Maybe,
  StepsRoutes,
} from "types";
import router, { useRouter } from "next/router";
import Loading from "component/Loading";
import { useContext, useEffect, useState } from "react";
import ConfirmationDialog from "component/ConfirmationDialog";
import { setCurrentElection, setElectionTestComplete, setTestVoterFile } from "requests/election";
import GI from "component/GI";
import FileUpload from "component/FileUpload";
import Box from "@mui/material/Box";
import { Alert, Link } from "@mui/material";
import CompletedCheckbox from "component/CompletedCheckbox";
import useCurrentElection from "hooks/useCurrentElection";
import { ElectionContext } from "context/ElectionContext";

interface ElectionTestFormProps {
  election: Maybe<Election>;
  onCancel(): void;
  viewOnly?: boolean;
}

export default function ElectionTestForm({
  election,
  onCancel,
  viewOnly = false
}: ElectionTestFormProps) {
  
  // const [data, setData] = useState<Maybe<Election | ElectionCreate>>(election);
  const [currentElection, reloadCurrentElection, loadingCurrentElection] = useCurrentElection();
  const { loadElection } = useContext(ElectionContext);

  const [testVoterFileStatus, setTestVoterFileStatus] = useState<{
    [x: string]: any;
  }>(
    //election?.testVotersFile ? { status: "started" } : {}
    election?.testVotersFile ? { status: "started" } : {}
  );
  const [currentElectionDialogOpen, setCurrentElectionDialogOpen] = useState(false);

  const [alertText, setAlertText] = useState<string>("");

  console.log('Election', election)

  const router = useRouter();
  
  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const messageError = (e: any) => {
    setAlert(
      e?.data?.error_description ||
        e?.data?.message ||
        e?.message ||
        JSON.stringify(e)
    );
  };

  const handleSetCurrentElection = async () => {
    if (currentElection) {
      setCurrentElectionDialogOpen(true);
    } else {
      await saveAsCurrentElection();
    }
  };

  const handleCurrentElectionDialogClose = async (confirmed: boolean) => {

    if (confirmed) {
      await saveAsCurrentElection();
    } else {
      setCurrentElectionDialogOpen(false);
    }

  };

  const saveAsCurrentElection = async () => {
    if (election) {
      try {
        await setCurrentElection(election.electionId);
      } catch (e) {
        console.log("setCurrentElection error");
        console.log(e);
        messageError(e);
      } finally {
        await loadElection();
        reloadCurrentElection();
        setCurrentElectionDialogOpen(false);
      }
    }
  }

  const saveNext = () => {
    router.push(
      `/elections/${(election as Election)?.electionId}/${StepsRoutes.ProductionVoterData}`
    );
  }

  const formFields = (
    <Grid container spacing={4}>
      <GI xs={12}>
        <Typography variant="h2">Test Your Election</Typography>
      </GI>
      <Grid item sm={6}>
        <Typography variant="h3">Upload Test Voter List</Typography>
        <FileUpload
          key="test-voter-upload"
          disabled={
            !(election as Election) ||
            !(election as Election)?.ballotsSet ||
            (election as Election)?.testComplete
          }
          disabledMessage={
            (election as Election)?.testComplete
              ? "Test voter upload disabled: Testing for this election has been finalized"
              : "Test voter upload disabled:You must upload a ballot file before uploading a test voter file."
          }
          instructions="Upload a CSV file following the voter file specification."
          onLoadFile={async (file) => {
            try {
              if ((election as Election)?.electionId) {
                setTestVoterFileStatus({ status: "uploading" });
                const resp = await setTestVoterFile(
                  (election as Election)?.electionId,
                  file
                );
                // updateTestVoterFileStatus(resp.objectKey);
                setTestVoterFileStatus({ status: "done" });
                loadElection();
                //setTestVoterFileUid(resp.objectKey);
              }
              return;
            } catch (e: any) {
              setTestVoterFileStatus({
                status: "error",
                message: JSON.stringify(e?.data?.error_description),
              });
              // onUpdateElection(data as Election);
              console.log(e);
            }
          }}
        />
        <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
          {testVoterFileStatus.status === "error" && (
            <Box sx={{ color: "error.main" }}>
              Error Processing File: {testVoterFileStatus.message}
              <p>
                Please see: <Link href="/help">help information</Link>
              </p>
            </Box>
          )}
          {testVoterFileStatus.status === "uploading" && (
            <Box sx={{ textAlign: "center" }}>
              <Loading />
            </Box>
          )}
          {testVoterFileStatus.status === "started" && (
            <Box>
              Voter File Processing <Loading />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item sm={6}></Grid>
      <Grid item sm={6}>
        <Typography variant="h3">Test Data Upload Checklist</Typography>
        <Grid container spacing={2}>
          {testVoterFileStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>Voter File Uploaded</span>
            </Grid>
          )}
        </Grid>
        <CompletedCheckbox isComplete={(election as Election)?.testVoterCount > 0}>
          {(election as Election)?.testVoterCount || 0} test voters uploaded
        </CompletedCheckbox>
      </Grid>
    </Grid>
  );

  const actions = (
    <Grid container justifyContent="space-between" spacing={2} alignItems="flex-end">
       <Grid item xs={4} sm={4} md={3}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Grid>
      <Grid item xs={4} sm={4} md={3}>
        <Button endIcon={<NavigateNextIcon />} onClick={saveNext}>
          Continue
        </Button>
      </Grid>
      {
      election &&
      currentElection &&
      currentElection?.electionId === election.electionId &&
      election?.electionStatus == ElectionStatus.inactive &&
      election?.testVotersSet &&
      !election?.testComplete ? (
        <Grid>
          <Button
            endIcon={<ConstructionIcon />}
            onClick={() => {
              router.push(
                `/elections/${(election as Election)?.electionId}/open-test`
              );
            }}
          >
            {(election?.testCount ?? 0) >= 1 ? "Continue" : "Begin"} Testing
            
          </Button>
          
        </Grid>
      ) : (
          <Grid item xs={4} sm={4} md={3}>
            {
              election &&
              !loadingCurrentElection && currentElection &&
              currentElection?.electionId !== election.electionId && (
                <p>
                  This election is not the current election and so cannot be set
                  to test mode.
                </p>
              )}

            {
              election &&
              (!election.electionStatus ||
                election.electionStatus === ElectionStatus.draft) &&
              (!currentElection ||
                (!loadingCurrentElection && currentElection &&
                  currentElection?.electionId !== election?.electionId &&
                  currentElection?.latMode !== 1 &&
                  currentElection?.electionStatus !== ElectionStatus.open)) && (
                <>
                <LoadingButton
                  disabled={
                    election?.electionId === currentElection?.electionId
                  }
                  onClick={handleSetCurrentElection}
                >
                  Set Current
                </LoadingButton>
                <ConfirmationDialog
                  open={currentElectionDialogOpen}
                  title="Set as Current Election?"
                  onClose={handleCurrentElectionDialogClose}
                  btnConfirmText="Yes, set current"
                >
                  <Typography sx={{ fontSize: "1.1em"}}>
                    It will archive the election for <em>{currentElection?.electionJurisdictionName} {currentElection?.electionName}.</em>
                  </Typography>
                </ConfirmationDialog>
                </>
              )}
          </Grid>
      )}
      <Grid>
        {
          election &&
          currentElection &&
          currentElection?.electionId === election.electionId &&
          (election?.testCount ?? 0) >= 1 &&
          !election?.testComplete && (
            <LoadingButton
              //endIcon={<ConstructionIcon />}
              onClick={async () => {
                await setElectionTestComplete((election as Election)?.electionId);
                router.push("/dashboard");
              }}
            >
              Finalize Testing
            </LoadingButton>
          )}
      </Grid>
    </Grid>
  );

  
  
  return (
    <>
      {election && (
        <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
          <Grid item flexGrow={1}>{formFields}</Grid>
          <Grid item>
            {alertText && <Alert severity="error">{alertText}</Alert>}
          </Grid>
          {!viewOnly && <Grid item>{actions}</Grid>}
        </Grid>
      )}
    </>
  );
}