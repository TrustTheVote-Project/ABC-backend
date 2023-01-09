import type { NextPage } from 'next'
import LoggedInLayout from 'layout/LoggedInLayout'
import { Button, Card, Grid, Paper, TextField, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'

import AddIcon from '@mui/icons-material/Add';
import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'
import { Election, ElectionServingStatus, ElectionStatus } from 'types'
import { getAll as getAllElections, getCurrentElection } from 'requests/election'
import Section from 'component/Section'
import ElectionCard from 'component/ElectionCard'
import useElections from 'hooks/useElections'
import GC from 'component/GC'
import GI from 'component/GI'
import Loading from 'component/Loading';
import useCurrentElection from 'hooks/useCurrentElection';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [elections, reloadElections, loadingElections] = useElections();
  const [currentElection, reloadCurrentElection] = useCurrentElection();
  
  const onUpdateElection = () => { 
    reloadCurrentElection();
    reloadElections();
  }

  let openElections: Array<Election> = [];
  let testElections: Array<Election> = [];
  let pendingElections: Array<Election> = [];
  let closedElections: Array<Election> = [];
  elections.forEach((e) => {
    if (e.electionStatus === ElectionStatus.live) {
      openElections.push(e)
    } else if (e.electionStatus === ElectionStatus.test) {
      testElections.push(e);
    } else if (e.electionStatus === ElectionStatus.pending) {
      pendingElections.push(e);
    } else if (e.electionStatus === ElectionStatus.complete) {
      closedElections.push(e);
    }
  })

  return <LoggedInLayout title="Dashboard">
    <Typography variant="h1">Dashboard</Typography>
    {loadingElections && <Loading />}
    {!loadingElections && <Section>
      <Typography variant="h2">Current Election</Typography>
      {currentElection && <ElectionCard onUpdateElection={onUpdateElection} election={currentElection} currentElection={currentElection} key={currentElection.electionId} />}
      {(!currentElection) && <Typography variant="h3">No current election.</Typography>}
    </Section>}
    {!loadingElections && <Section>
      <Typography variant="h2">Open Elections</Typography>
      {openElections.length === 0 && <Typography variant='h3'>No Open Election</Typography>}
      <GC direction="column" spacing={2}>
        {openElections.map((election) => {
          return <GI  key={election.electionId}><ElectionCard onUpdateElection={onUpdateElection} currentElection={currentElection} election={election} /></GI>
        })}
      </GC>
    </Section>}
    {!loadingElections && <Section>
      <Typography variant="h2">Test Elections</Typography>
      {testElections.length === 0 && <Typography variant='h3'>No Test Election</Typography>}
      <GC direction="column" spacing={2}>
        {testElections.map((election) => {
          return <GI  key={election.electionId}><ElectionCard onUpdateElection={onUpdateElection} currentElection={currentElection} election={election} /></GI>
        })}
      </GC>
    </Section>}
    {!loadingElections && <Section>
      <Typography variant="h2">Draft Elections</Typography>
      <GC direction="column" spacing={2}>
        {pendingElections.map((election)=>{
          return <GI  key={election.electionId}><ElectionCard onUpdateElection={onUpdateElection} currentElection={currentElection} election={election} /></GI>
        })}
        {pendingElections.length === 0 && <GI><Typography variant="h3">No Draft Elections</Typography></GI>}
        <GI>
          <GC>
            <GI>
              <Button endIcon={<AddIcon />} onClick={()=>{
                router.push('/elections/new')
              }}>Create New Election</Button>
            </GI>
          </GC>
        </GI>
      </GC>
    </Section>}
    {!loadingElections && <Section>
      <Typography variant="h2">Completed Elections</Typography>
      <GC direction="column" spacing={2}>
        {closedElections.map((election)=>{
          return <GI  key={election.electionId}><ElectionCard onUpdateElection={onUpdateElection} currentElection={currentElection} election={election} /></GI>
        })}
        {closedElections.length === 0 && <GI><Typography variant="h3">No Closed Elections</Typography></GI>}
        
      </GC>
    </Section>}
  </LoggedInLayout>
}


export default Dashboard;