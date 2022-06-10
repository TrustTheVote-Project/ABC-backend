import type { NextPage } from 'next'
import LoggedInLayout from 'layout/LoggedInLayout'
import { Button, Card, Grid, Paper, TextField, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'


import Input from 'component/Input';

import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'
import { Election, Maybe } from 'types'
import { getAll as getAllElections, getElection, setElectionVoters } from 'requests/election'
import Section from 'component/Section'
import ElectionCard from 'component/ElectionCard'
import { Box } from '@mui/system'
import ElectionForm from 'component/ElectionForm';
import FileUpload from 'component/FileUpload';
import GC from 'component/GC';
import GI from 'component/GI';
import CompletedCheckbox from 'component/CompletedCheckbox';

const UploadLiveVoterFile: NextPage = () => {
  const [election, setElection] = useState<Maybe<Election>>(null)
  
  const router = useRouter();
  const { query } = router;
  const { id } = query;

  const electionId = Array.isArray(id) ? id[0] : id;
  

  useEffect(()=> {
    const loadElection = async () => {
      if (electionId) {
        const resp = await getElection(electionId);
        setElection(resp);
      }
    }
    if (electionId) {
      loadElection();
    }
  }, [electionId])
  

  console.log(election)

  return <LoggedInLayout title="Create Election">
    {election && <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h2">Production Voter Data</Typography>
      </Grid>

      <Grid item sm={6}>
        <Typography variant="h3">Production Voter List</Typography>
        <FileUpload onLoadFile={async (file)=>{
          if (election?.electionId) {
            const resp = await setElectionVoters(election.electionId, [])
            setElection(resp);
            return;
          }
        }} />
      </Grid>
      <Grid item sm={6}>
        <Typography variant="h3">Production Voter List Upload History</Typography>
        <GC justifyContent="space-between">
          <GI><Typography variant="subtitle2">Date</Typography></GI>
          <GI>Action</GI>
        </GC>
      </Grid>
      <Grid item sm={6}>
        <Typography variant="h3">Production Voter List Upload Checklist</Typography>
        <CompletedCheckbox isComplete={election?.voterCount > 0}>
          {election?.voterCount || 0} voters uploaded
        </CompletedCheckbox>
      </Grid>
      <Grid item xs={12}></Grid>
      <Grid item xs={4}>
        <Button onClick={()=>router.push('/dashboard')}>Cancel</Button>
      </Grid>
    </Grid>}
  </LoggedInLayout>
}

export default UploadLiveVoterFile;