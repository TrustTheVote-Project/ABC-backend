import type { NextPage } from 'next'
import LoggedInLayout from 'layout/LoggedInLayout'
import { Button, Card, Grid, Paper, TextField, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check';


import Input from 'component/Input';

import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'
import { Election, Maybe } from 'types'
import { getAll as getAllElections, getElection, getFileStatus, setElectionVoters } from 'requests/election'
import Section from 'component/Section'
import ElectionCard from 'component/ElectionCard'
import { Box } from '@mui/system'
import ElectionForm from 'component/ElectionForm';
import FileUpload from 'component/FileUpload';
import GC from 'component/GC';
import GI from 'component/GI';
import CompletedCheckbox from 'component/CompletedCheckbox';
import Loading from 'component/Loading';

const UploadLiveVoterFile: NextPage = () => {
  const [election, setElection] = useState<Maybe<Election>>(null)
  
  const [voterFileUid, setVoterFileUid] = useState<string>(election?.votersFile || "");
  const [voterFileStatus, setVoterFileStatus] = useState<{[x: string]: any}>(election?.votersFile ? {status: "started"}: {});

  const router = useRouter();
  const { query } = router;
  const { id } = query;

  const electionId = Array.isArray(id) ? id[0] : id;
  
  const getVoterFileStatus = async () => {
    if (voterFileUid) {
      const resp = await getFileStatus(voterFileUid);
      if (resp.status === "complete") {
        loadElection();
      }
      setVoterFileStatus(resp)
    }
  }

  useEffect(()=>{
    if (voterFileUid) {
      getVoterFileStatus();
    }
  }, [voterFileUid])

  const loadElection = async () => {
    if (electionId) {
      const resp = await getElection(electionId);
      setElection(resp);
    }
  }

  useEffect(()=> {
    
    if (electionId) {
      loadElection();
    }
  }, [electionId])
  

  return <LoggedInLayout title="Create Election">
    {election && <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h2">Production Voter Data</Typography>
      </Grid>

      <Grid item sm={6}>
        <Typography variant="h3">Production Voter List</Typography>
        <FileUpload onLoadFile={async (file)=>{
          if (electionId) {
            setVoterFileStatus({status: "uploading"})
            const resp = await setElectionVoters(electionId, (file))
            setVoterFileUid(resp.objectKey)
            return;
          }
        }} />
        <Box sx={{backgroundColor: 'background.paper', padding: 2}}>
        {voterFileStatus.status === "error" && <Box sx={{color: 'error.main'}}>
          Error Processing File: {voterFileStatus.message}
        </Box>}
        {voterFileStatus.status === "uploading" && <Box sx={{textAlign: 'center'}}>
          <Loading />
        </Box>}
        {voterFileStatus.status === "started" && <Box>
          Voter File Processing <Loading />
        </Box>}
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
        <Typography variant="h3">Production Voter List Upload Checklist</Typography>
        <Grid container spacing={2}>
          {voterFileStatus.status === "complete" && <Grid item alignItems="center">
            <CheckIcon color="success"/> <span>Voter File Uploaded</span>
          </Grid>} 
        </Grid>
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