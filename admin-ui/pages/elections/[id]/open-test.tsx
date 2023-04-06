import { Alert, Button, Grid, Slider, SliderThumb, Typography } from "@mui/material";
import LoggedInLayout from "layout/LoggedInLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Election, ElectionServingStatus, ElectionStatus, Maybe } from "types";
import {
  getElection,
  openElectionTest,
  setCurrentElection,
  setElectionAttributes,
} from "requests/election";
import GC from "component/GC";
import GI from "component/GI";
import Loading from "component/Loading";
import { useNavigate } from "react-router-dom";
import useCurrentElection from "hooks/useCurrentElection";
import LoadingButton from "component/LoadingButton";

interface ThumbProps {
  children: ReactNode;
  [x: string]: any;
}

function ThumbComponent(props: ThumbProps) {
  const { children, ...other } = props;

  return (
    <SliderThumb {...other}>
      {children}
      <Button endIcon={<NavigateNextIcon />}>Slide to Confirm</Button>
    </SliderThumb>
  );
}

const TestElection: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const { id } = query;

  const electionId = Array.isArray(id) ? id[0] : id;
  const [currentElection, reloadCurrentElection, loadingCurrentElection] = useCurrentElection();
  const [election, setElection] = useState<Maybe<Election>>(null);
  
  const shouldShowSetCurrentBtn = !loadingCurrentElection && currentElection && currentElection?.electionId != electionId;
  const [alertText, setAlertText] = useState<string>("");
  const [maliciousRequest, setMaliciousRequest] = useState<boolean>(false);

  const loadElection = async () => {
    if (electionId) {
      const resp = await getElection(electionId);
      setElection(resp);
      
    }
  };

  useEffect(() => {
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  useEffect(() => {
    const modesNotAllowedForTest = [ElectionStatus.archived, ElectionStatus.closed, ElectionStatus.open];
    if (election && modesNotAllowedForTest.includes(election.electionStatus)) {
      // setAlertText(`${resp?.electionName} is ${resp.electionStatus} and so cannot be set to test mode.`)
      setMaliciousRequest(true);
    }
  }, [election]);

  const testElection = async () => {
    if (electionId) {
      try {
        await openElectionTest(electionId);
        router.push("/dashboard");
      } catch (e: any) {
        console.error(e);
        setAlertText(e?.data?.error_description);
      }
      // await setCurrentElection(electionId);
    }
    // loadElection();
  };

  const runSetCurrentElection = async () => {
    if (electionId) {
      try {
        await setCurrentElection(electionId);
        reloadCurrentElection();
      } catch (e: any) {
        console.error(e);
        setAlertText(`${currentElection?.electionJurisdictionName} ${currentElection?.electionName} ${e?.data?.error_description}`);
      }
    }
  };

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const InTestMode = () => {
    return (
      <GC direction="column" spacing={2}>
        <GI>
          <Typography variant="h2">You are now in Testing Mode!</Typography>
        </GI>
        <Typography sx={{ fontSize: "3em", margin: "2em 0" }}>
          You are now in testing mode! Please test your election with your
          team, then come back to finish editing and launch your election!
        </Typography>
        <GI>
          <GC justifyContent="space-between">
            <GI>
              <Button
                onClick={() =>
                  router.push(`/elections/${election.electionId}/test`)
                }
              >
                View Test Status
              </Button>
            </GI>
            <GI>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </GI>
          </GC>
        </GI>
      </GC>
    )
  }

  const NeedCurrentMode = () => {
    return (
      <GC direction="column" spacing={2}>
        <GI>
          <Typography variant="h2">Prerequisites not met for test mode!</Typography>
        </GI>
        <Typography sx={{ fontSize: "3em", margin: "2em 0" }}>
          Election for {election?.electionJurisdictionName} {election?.electionName} is not the current election and so cannot be set to test mode.
        </Typography>
        <GI>
          <GC justifyContent="space-between">
            <GI item xs={3}>
              <Button onClick={goBack}>Back</Button>
            </GI>
            {!alertText ?
            <GI item xs={3}>
              <LoadingButton onClick={runSetCurrentElection}>
                Set Current
              </LoadingButton>
            </GI>
            : false
            }
          </GC>
        </GI>
      </GC>
    )
  }

  const SetTestMode = () => {
    return (
      <>
        <Typography variant="h2">Please confirm to continue.</Typography>
        <Typography sx={{ fontSize: "3em", margin: "2em 0" }}>
          Please confirm that you would like to enter testing mode for{" "}
          {election?.electionName}.
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Button onClick={goBack}>Back</Button>
          </Grid>
          <Grid item xs={2}>
            &nbsp;
          </Grid>
          <Grid item xs={6}>
            <Slider
              onChangeCommitted={(_event, newValue) => {
                if (newValue === 100) {
                  testElection();
                }
              }}
              components={{
                Thumb: ThumbComponent,
              }}
              step={null}
              marks={[
                {
                  value: 0,
                  label: "",
                },
                {
                  value: 100,
                  label: "",
                },
              ]}
              defaultValue={0}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  return (
    <LoggedInLayout title="Test Election">
      {(!election || loadingCurrentElection) && <Loading />}
      {maliciousRequest ? 
        <Alert severity="error">{election?.electionName} is {election?.electionStatus} and so cannot be set to test mode.</Alert>
      : 
        <>
        {!loadingCurrentElection && election &&
          election.latMode == 1 /*election?.electionStatus === ElectionStatus.test */ && 
          <InTestMode />
        }
        {!loadingCurrentElection && election && !election?.latMode && (
          // This should be latMode 0; but some elections don't have that?
          //==   0 /*election?.electionStatus !== ElectionStatus.test */ && (
          shouldShowSetCurrentBtn ? <NeedCurrentMode /> : <SetTestMode />
        )}
        <Grid xs={12}>
          {alertText && <Alert severity="error">{alertText}</Alert>}
        </Grid>
        </>
      }
    </LoggedInLayout>
  );
};

export default TestElection;
