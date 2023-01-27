import {
  Alert,
  Button,
  Grid,
  Slider,
  SliderThumb,
  Typography,
} from "@mui/material";
import LoggedInLayout from "layout/LoggedInLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Election, ElectionServingStatus, ElectionStatus, Maybe } from "types";
import {
  closeElection,
  closeElectionTest,
  getElection,
  setElectionAttributes,
} from "requests/election";
import GC from "component/GC";
import GI from "component/GI";
import Loading from "component/Loading";
import ElectionCard from "component/ElectionCard";

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

const CloseElection: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const { id } = query;
  const [alertText, setAlertText] = useState<string>("");

  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const electionId = Array.isArray(id) ? id[0] : id;

  const [election, setElection] = useState<Maybe<Election>>(null);

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

  const runCloseElection = async () => {
    if (electionId) {
      try {
        await closeElection(electionId);
        router.push("/dashboard");
      } catch (e: any) {
        console.error(e);
        setAlert(e?.data?.error_description);
      }
    }
  };

  return (
    <LoggedInLayout title="Close Election">
      {!election && <Loading />}
      {election && election?.electionStatus !== ElectionStatus.open && (
        <GC direction="column" spacing={2}>
          <GI>
            <Typography variant="h2">You are not in Open Mode</Typography>
          </GI>
          <GI>
            <GC justifyContent="space-between">
              <GI>
                <Button onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </GI>
            </GC>
          </GI>
        </GC>
      )}
      {election && election?.electionStatus === ElectionStatus.open && (
        <>
          <Typography variant="h2">Please confirm to continue.</Typography>
          <Typography sx={{ fontSize: "3em", margin: "2em 0" }}>
            Would you like to close election for{" "}
            {election?.electionJurisdictionName} {election?.electionName}?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <Button onClick={() => router.push("/dashboard")}>Back</Button>
            </Grid>
            <Grid item xs={2}>
              &nbsp;
            </Grid>
            <Grid item xs={6}>
              <Slider
                onChangeCommitted={(_event, newValue) => {
                  if (newValue === 100) {
                    runCloseElection();
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
          <Grid xs={12}>
            {alertText && <Alert severity="error">{alertText}</Alert>}
          </Grid>
        </>
      )}
    </LoggedInLayout>
  );
};

export default CloseElection;
