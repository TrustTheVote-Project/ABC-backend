import type { NextPage } from 'next'
import LoggedInLayout from 'layout/LoggedInLayout'
import { Button, Card, Grid, Paper, TextField, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'

import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'
import { Election } from 'types'
import { getAll as getAllElections } from 'requests/election'
import Section from 'component/Section'

const Dashboard: NextPage = () => {

  const [elections, setElections] = useState<Array<Election>>([])

  useEffect(()=>{
    const loadElections = async () => {
      const newElections = await getAllElections();
      setElections(newElections);
    }
    loadElections();
  }, [])

  return <LoggedInLayout title="Dashboard">
    <Typography variant="h1">Dashboard</Typography>
    <Section>
      <Typography variant="h2">Elections</Typography>
      {elections.map((election)=>{
        return <Card key={`${election.electionJurisdictionName}-${election.electionDate}`}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="h3">{election.electionJurisdictionName} - {election.electionName}, {election.electionDate}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h3">{election.electionStatus}</Typography>
            </Grid>
          </Grid>
          
        </Card>
      })}
    </Section>
  </LoggedInLayout>
}


export default Dashboard;