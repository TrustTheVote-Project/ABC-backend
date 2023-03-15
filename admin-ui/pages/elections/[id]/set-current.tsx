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
import { Election, Maybe } from "types";
import {
  setCurrentElection,
  getElection
} from "requests/election";
import Loading from "component/Loading";
import useCurrentElection from "hooks/useCurrentElection";

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

const CurrentElection: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const { id } = query;
  const [alertText, setAlertText] = useState<string>("");
  const [currentElection, reloadCurrentElection] = useCurrentElection();
  
  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const electionId = Array.isArray(id) ? id[0] : id;

  const [election, setElection] = useState<Maybe<Election>>(null);

  useEffect(() => {
    const loadElection = async () => {
      if (electionId) {
        const resp = await getElection(electionId);
        setElection(resp);
      }
    };
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  const runSetCurrentElection = async () => {
    if (electionId) {
      try {
        await setCurrentElection(electionId);
        router.push("/dashboard");
      } catch (e: any) {
        console.error(e);
        setAlert(e?.data?.error_description);
      }
    }
  };

  const archiveMessage = currentElection ? `This action will archive the election for ${currentElection?.electionJurisdictionName} ${currentElection.electionName}.` : '';

  return (
    <LoggedInLayout title="Set Current Election">
      {!election && <Loading />}
      {election && (
        <>
          <Typography variant="h2">Please confirm to continue.</Typography>
          <Typography sx={{ fontSize: "3em", margin: "2em 0" }}>
            Please confirm that you want to set the{" "}
            {election?.electionJurisdictionName} {election?.electionName} as the current election. 
            {archiveMessage}
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
                    runSetCurrentElection();
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

export default CurrentElection;
