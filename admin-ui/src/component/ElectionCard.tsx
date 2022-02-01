import { Button, Card, Grid, Typography } from "@mui/material";
import { formatLongDate } from "dsl/date";
import router from "next/router";
import { Election, ElectionStatus } from "types";
import CompletedCheckbox from "./CompletedCheckbox";

interface ElectionCardProps {
  election: Election
}

export default function ElectionCard({
  election
}: ElectionCardProps) {
  const {configuration} = election;
  return <Card>
    <Grid container justifyContent="space-between">
      <Grid item>
        <Typography variant="h3">{election.electionJurisdictionName} - {election.electionName}, {formatLongDate(election.electionDate)}</Typography>
      </Grid>
      <Grid item>
        <Typography variant="h3">{election.electionStatus}</Typography>
      </Grid>
    </Grid>
    <Grid container spacing={6}>
      <Grid item xs={6} sm={4}>
        <Typography variant="subtitle1">Precinct Settings</Typography>
        <CompletedCheckbox isComplete={!!configuration?.absenteeStatusRequired }>Absentee Status</CompletedCheckbox>
        <CompletedCheckbox isComplete={!!configuration?.affidavitRequiresDLIDcardPhotos }>Photo of Identification</CompletedCheckbox>
        <CompletedCheckbox isComplete={!!configuration?.affidavitRequiresWitnessName }>Witness Name</CompletedCheckbox>
        <CompletedCheckbox isComplete={!!configuration?.affidavitRequiresWitnessSignature }>Witness Signature</CompletedCheckbox>
      </Grid>
      <Grid item xs={6} sm={4}>
        <Typography variant="subtitle1">Election Data</Typography>        
        <CompletedCheckbox isComplete={election.ballotDefinitionCount > 0}>Ballot Definitions Uploaded</CompletedCheckbox>
        <CompletedCheckbox isComplete={election.ballotCount > 0}>Ballots Uploaded</CompletedCheckbox>
        <CompletedCheckbox isComplete={election.ballotDefinitionCount > 0 && election.ballotDefinitionCount === election.ballotCount }>Ballot Count Matches Definitions Count</CompletedCheckbox>
      </Grid>
      <Grid item xs={6} sm={4}>
        <Typography variant="subtitle1">Voter Data</Typography>  
        <CompletedCheckbox isComplete={election.voterCount > 0}>Voter CSV Uploaded</CompletedCheckbox>              
      </Grid>
      {election.electionStatus === ElectionStatus.pending && <Grid item xs={12}>
        <Grid container>
          <Grid item xs={6} sm={6} md={4}>
            <Button onClick={()=>{
              router.push(`/elections/${election.electionId}/edit`)
            }}>Continue Editing</Button>
          </Grid>
        </Grid>        
      </Grid>}
    </Grid>
  </Card>
}