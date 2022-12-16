import CheckIcon from "@mui/icons-material/Check";
import { Button, Card, Grid, Typography } from "@mui/material";
import { formatLongDate } from "dsl/date";
import router from "next/router";
import { useEffect, useState } from "react";
import { getElection, setCurrentElection } from "requests/election";
import { Election, ElectionServingStatus, ElectionStatus, Maybe } from "types";
import CompletedCheckbox from "./CompletedCheckbox";

interface ElectionCardProps {
  election: Election;
  currentElection?: Maybe<Election>;
  onUpdateElection?(): void;
}

export default function ElectionCard({
  election: e,
  currentElection,
  onUpdateElection,
}: ElectionCardProps) {
  // TODO load election data
  const [election, setElection] = useState<Election>(e);

  useEffect(() => {
    if (!election.configurations) {
      const resp = getElection(election.electionId).then((resp) => {
        setElection(resp);
      });
    }
  }, []);

  const { configurations } = election;
  return (
    <Card>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography variant="h3">
            {election.electionJurisdictionName} - {election.electionName},{" "}
            {formatLongDate(election.electionDate)}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h3" sx={{ textTransform: "capitalize" }}>
            {election.servingStatus}
            {` (${election.testCount || "0"} ${
              election.testCount === 1 ? "test" : "tests"
            })`}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1">Configuration</Typography>
          <CompletedCheckbox
            isComplete={!!configurations?.absenteeStatusRequired}
          >
            Absentee Status
          </CompletedCheckbox>
          <CompletedCheckbox
            isComplete={!!configurations?.affidavitRequiresDLIDcardPhotos}
          >
            Photo of Identification
          </CompletedCheckbox>
          <CompletedCheckbox
            isComplete={!!configurations?.affidavitWitnessRequirement}
          >
            Witness Requirement
          </CompletedCheckbox>
          {/*
        <CompletedCheckbox isComplete={!!configurations?.affidavitRequiresWitnessName }>Witness Name</CompletedCheckbox>
        <CompletedCheckbox isComplete={!!configurations?.affidavitRequiresWitnessSignature }>Witness Signature</CompletedCheckbox>
*/}
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1">Election Data</Typography>
          <CompletedCheckbox isComplete={election.ballotDefinitionCount > 0}>
            Ballot Definitions Uploaded
          </CompletedCheckbox>
          <CompletedCheckbox isComplete={election.ballotCount > 0}>
            Ballots Uploaded
          </CompletedCheckbox>
          <CompletedCheckbox
            isComplete={
              election.ballotDefinitionCount > 0 &&
              election.ballotDefinitionCount === election.ballotCount
            }
          >
            Ballot Count Matches Definitions Count
          </CompletedCheckbox>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1">Voter Data</Typography>
          <CompletedCheckbox isComplete={election.voterCount > 0}>
            Voter CSV Uploaded
          </CompletedCheckbox>
        </Grid>
        {election.electionStatus === ElectionStatus.live && (
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="space-between">
              <Grid item xs={6} sm={6} md={4}>
                <Button
                  onClick={() => {
                    router.push(
                      `/elections/${election.electionId}/upload-production-voter-file`
                    );
                  }}
                >
                  Upload Production Voter File
                </Button>
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Button
                  onClick={() => {
                    router.push(`/elections/${election.electionId}/close`);
                  }}
                >
                  Close Election
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
        {(!election.electionStatus ||
          election.electionStatus === ElectionStatus.test ||
          election.electionStatus === ElectionStatus.pending) && (
          <Grid item xs={12}>
            <Grid spacing={1} container justifyContent="space-between">
              <Grid item xs={6} sm={6} md={4}>
                <Button
                  disabled={
                    election.servingStatus === ElectionServingStatus.open
                  }
                  onClick={() => {
                    router.push(`/elections/${election.electionId}/edit`);
                  }}
                >
                  Continue Editing
                </Button>
              </Grid>

              <Grid item xs={6} sm={6} md={4}>
                <Button
                  disabled={election.electionId === currentElection?.electionId}
                  onClick={async () => {
                    await setCurrentElection(election.electionId);
                    if (onUpdateElection) {
                      onUpdateElection();
                    }
                  }}
                >
                  Set Current
                </Button>
              </Grid>

              <Grid item xs={6} sm={6} md={4}>
                <Button
                  disabled={election.electionStatus !== ElectionStatus.test}
                  onClick={async () => {
                    router.push(`/elections/${election.electionId}/test`);
                  }}
                >
                  View Testing Status
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
