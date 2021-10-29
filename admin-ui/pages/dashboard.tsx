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
import ElectionCard from 'component/ElectionCard'

const Dashboard: NextPage = () => {

  const [elections, setElections] = useState<Array<Election>>([])

  useEffect(()=>{
    const loadElections = async () => {
      const newElections = await getAllElections();
      // Populate elections with their config
      setElections(newElections);
    }
    loadElections();
  }, [])

  return <LoggedInLayout title="Dashboard">
    <Typography variant="h1">Dashboard</Typography>
    <Section>
      <Typography variant="h2">Elections</Typography>
      {elections.map((election)=>{
        return <ElectionCard election={election} key={election.id} />
      })}
    </Section>
  </LoggedInLayout>
}


export default Dashboard;