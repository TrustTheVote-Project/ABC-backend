import CheckIcon from "@mui/icons-material/Check";
import { Button, Card, Grid, Typography, Link } from "@mui/material";
import { formatLongDate } from "dsl/date";
import router from "next/router";
import { useEffect, useState } from "react";
import {
  getElection,
  setCurrentElection,
  openElectionLookup,
  setElectionTestComplete,
} from "requests/election";
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

  // AM:
  // configurations is stored as a string in the database
  // but assumed to be the parsed object here
  // Need to sync this up

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
            {election.electionStatus}
            {` (${election.testCount || "0"} ${
              election.testCount === 1 ? "test" : "tests"
            })`}
          </Typography>
          {election?.latMode == 1 && (
            <Typography variant="h4">Testing active</Typography>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1">Settings</Typography>
          <CompletedCheckbox isComplete={!!configurations?.DLNexample}>
            All configurations complete
          </CompletedCheckbox>

          {/*
        <CompletedCheckbox isComplete={!!configurations?.affidavitRequiresWitnessName }>Witness Name</CompletedCheckbox>
        <CompletedCheckbox isComplete={!!configurations?.affidavitRequiresWitnessSignature }>Witness Signature</CompletedCheckbox>
*/}
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1">Election Data</Typography>
          <CompletedCheckbox isComplete={election.ballotDefinitionCount > 0}>
            Election Definition Uploaded
          </CompletedCheckbox>
          <CompletedCheckbox isComplete={election.ballotCount > 0}>
            Ballots Uploaded
          </CompletedCheckbox>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="subtitle1">Voter Data</Typography>
          <CompletedCheckbox isComplete={election.testVotersSet}>
            Test Voter File Uploaded
          </CompletedCheckbox>
          <CompletedCheckbox isComplete={election.votersSet}>
            Production Voter File Uploaded
          </CompletedCheckbox>
        </Grid>
        {/* Top row test complete elections: inactive, lookup,open, closed */}
        {election?.testComplete && (
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="space-between">
              {election?.electionStatus !== ElectionStatus.closed && (
                <Grid item xs={2} sm={2} md={2}>
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
              )}
              {election?.votersSet &&
                election?.electionStatus === ElectionStatus.inactive && (
                  <Grid xs={2} sm={2} md={2}>
                    <Button
                      onClick={async () => {
                        await openElectionLookup(election.electionId);
                        if (onUpdateElection) {
                          onUpdateElection();
                        }
                      }}
                    >
                      Open for Lookup
                    </Button>
                  </Grid>
                )}
              {election?.votersSet &&
                (election?.electionStatus === ElectionStatus.inactive ||
                  election?.electionStatus === ElectionStatus.lookup) && (
                  <Grid xs={2} sm={2} md={2}>
                    <Button
                      onClick={() => {
                        router.push(
                          `/elections/${election.electionId}/open-live`
                        );
                      }}
                    >
                      Open Election
                    </Button>
                  </Grid>
                )}
              {election?.electionStatus == ElectionStatus.open && (
                <Grid item xs={2} sm={2} md={2}>
                  <Button
                    onClick={() => {
                      router.push(`/elections/${election.electionId}/close`);
                    }}
                  >
                    Close Election
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
        {!election?.testComplete && (
          <Grid item xs={12}>
            <Grid spacing={1} container justifyContent="space-between">
              {(!election.electionStatus ||
                (election.electionStatus != ElectionStatus.lookup &&
                  election.electionStatus != ElectionStatus.open)) && (
                <Grid item xs={2} sm={2} md={2}>
                  <Button
                    disabled={election.latMode === 1}
                    onClick={() => {
                      router.push(`/elections/${election.electionId}/edit`);
                    }}
                  >
                    Continue Editing
                  </Button>
                </Grid>
              )}
              {(!election.electionStatus ||
                election.electionStatus === ElectionStatus.draft) &&
                (!currentElection ||
                  (currentElection &&
                    currentElection?.electionId !== election.electionId)) && (
                  <Grid item xs={2} sm={2} md={2}>
                    <Button
                      disabled={
                        currentElection?.latMode == 1 ||
                        currentElection?.electionStatus == ElectionStatus.open
                      }
                      onClick={async () => {
                        await setCurrentElection(election.electionId);
                        if (onUpdateElection) {
                          onUpdateElection();
                        }
                      }}
                    >
                      Set Current{" "}
                      {currentElection?.latMode == 1 ||
                      currentElection?.electionStatus == ElectionStatus.open
                        ? " (Not Available)"
                        : ""}
                    </Button>
                  </Grid>
                )}

              {election?.electionStatus === ElectionStatus.inactive && // Current Election
                election?.testVotersSet && //Test voters are set
                election?.latMode !== 1 && ( // Not in LAT mode
                  <Grid xs={2} sm={2} md={2}>
                    <Button
                      onClick={() => {
                        router.push(
                          `/elections/${election.electionId}/open-test`
                        );
                      }}
                    >
                      Open Election for Testing
                    </Button>
                  </Grid>
                )}
              <Grid item xs={2} sm={2} md={2}>
                <Button
                  disabled={
                    election.electionStatus == ElectionStatus.draft ||
                    election.electionStatus == ElectionStatus.lookup ||
                    election.electionStatus == ElectionStatus.open
                  }
                  onClick={async () => {
                    router.push(`/elections/${election.electionId}/test`);
                  }}
                >
                  View Testing Status
                </Button>
              </Grid>
              {(election?.testCount ?? 0) >= 1 && election.latMode == 0 && (
                <Grid item xs={2} sm={2} md={2}>
                  <Button
                    //endIcon={<ConstructionIcon />}
                    onClick={async () => {
                      await setElectionTestComplete(election?.electionId);
                      onUpdateElection && (await onUpdateElection());
                      router.push(`/elections/${election.electionId}/test`);
                    }}
                  >
                    Finalize Testing
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
