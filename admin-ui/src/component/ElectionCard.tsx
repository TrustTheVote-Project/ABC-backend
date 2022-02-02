import CheckIcon from '@mui/icons-material/Check';
import { Button, Card, Grid, Typography } from "@mui/material";
import { formatLongDate } from "dsl/date";
import router from "next/router";
import { Election, ElectionStatus } from "types";
import CompletedCheckbox from "./CompletedCheckbox";

interface ElectionCardProps {
  election: Election,
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
        <Typography variant="h3" sx={{textTransform: 'capitalize'}}>{election.electionStatus}</Typography>
      </Grid>
    </Grid>
    <Grid container spacing={6}>
      <Grid item xs={6} sm={4}>
        <Typography variant="subtitle1">Configuration</Typography>
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
      {(election.electionStatus === ElectionStatus.open) && <Grid item xs={12}>
        <Grid container justifyContent="space-between">
          <Grid item xs={6} >
            <Button onClick={()=>{
              router.push(`/elections/${election.electionId}/upload-production-voter-file`)
            }}>Upload Production Voter File</Button>
          </Grid>
        </Grid>
      </Grid>}
      {(election.electionStatus === ElectionStatus.pending || election.electionStatus === ElectionStatus.testing) && <Grid item xs={12}>
        <Grid container justifyContent="space-between">
          <Grid item xs={6} sm={6} md={4}>
            <Button disabled={election.electionStatus === ElectionStatus.testing} onClick={()=>{
              router.push(`/elections/${election.electionId}/edit`)
            }}>Continue Editing</Button>
          </Grid>
          {election.electionStatus === ElectionStatus.testing && <Grid item xs={6} sm={6} md={4}>
            <Button onClick={async ()=>{
              router.push(`/elections/${election.electionId}/test`)
            }}>View Testing Status</Button>
          </Grid>}
        </Grid>        
      </Grid>}
    </Grid>
  </Card>
}