import type { NextPage } from 'next'
import LoggedInLayout from 'layout/LoggedInLayout'
import { Button, Card, Grid, Paper, TextField, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'

import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import Input from 'component/Input';

import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'
import { Election, Maybe } from 'types'
import { getAll as getAllElections } from 'requests/election'
import Section from 'component/Section'
import ElectionCard from 'component/ElectionCard'
import { Box } from '@mui/system'

const NewElection: NextPage = () => {
  const [election, setElection] = useState<Maybe<Election>>(null)

  // useEffect(()=>{
  //   const loadElections = async () => {
  //     const newElections = await getAllElections();
  //     // Populate elections with their config
  //     setElections(newElections);
  //   }
  //   loadElections();
  // }, [])

  const formContents = <Box>
    <Input name="electionName" label="Enter the Election Name." placeholder="Enter Name Here" />
  </Box>

  const actions = <Grid container justifyContent="space-between">
    <Grid item>Prev?</Grid>
    <Grid item>
      <Button endIcon={<NavigateNextIcon / >}>Next</Button>
    </Grid>
  </Grid>
  const stepper= "stepper"

  return <LoggedInLayout title="Create Election">
    <Grid container direction="column" spacing={1}>
      <Grid item><Typography variant="h1">Create New Election</Typography></Grid>
      <Grid item>{formContents}</Grid>
      <Grid item>{actions}</Grid>
      <Grid item>{stepper}</Grid>
    </Grid>


  </LoggedInLayout>
}

export default NewElection;