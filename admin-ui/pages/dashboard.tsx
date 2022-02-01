import type { NextPage } from 'next'
import LoggedInLayout from 'layout/LoggedInLayout'
import { Button, Card, Grid, Paper, TextField, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'

import AddIcon from '@mui/icons-material/Add';
import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'
import { Election, ElectionStatus } from 'types'
import { getAll as getAllElections } from 'requests/election'
import Section from 'component/Section'
import ElectionCard from 'component/ElectionCard'
import useElections from 'hooks/useElections'
import GC from 'component/GC'
import GI from 'component/GI'
import Loading from 'component/Loading';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [elections, reloadElections, loadingElections] = useElections();

  
  const activeElections = elections.filter(e=> e.electionStatus===ElectionStatus.open || e.electionStatus === ElectionStatus.testing)
  const pendingElections = elections.filter(e=>e.electionStatus===ElectionStatus.pending);
  return <LoggedInLayout title="Dashboard">
    <Typography variant="h1">Dashboard</Typography>
    {loadingElections && <Loading />}
    {!loadingElections && <Section>
      <Typography variant="h2">Current Election</Typography>
      {activeElections && activeElections[0] && <ElectionCard election={activeElections[0]} key={activeElections[0].electionId} />}
      {(!activeElections || activeElections.length === 0) && <Typography variant="h3">No election running in live or test mode.</Typography>}
    </Section>}
    {!loadingElections && <Section>
      <Typography variant="h2">Draft Elections</Typography>
      <GC direction="column" spacing={2}>
        {pendingElections.map((election)=>{
          return <GI  key={election.electionId}><ElectionCard election={election} /></GI>
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
  </LoggedInLayout>
}


export default Dashboard;