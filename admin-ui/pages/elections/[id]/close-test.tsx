import { Button, Grid, Slider, SliderThumb, Typography } from '@mui/material';
import LoggedInLayout from 'layout/LoggedInLayout';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Election, ElectionServingStatus, ElectionStatus, Maybe } from 'types';
import { closeElectionTest, getElection, setElectionAttributes } from 'requests/election';
import GC from 'component/GC';
import GI from 'component/GI';
import Loading from 'component/Loading';
import ElectionCard from 'component/ElectionCard';

interface ThumbProps {
  children: ReactNode,
  [x: string]: any
}

function ThumbComponent(props: ThumbProps) {
  const { children, ...other } = props;

  return (
    <SliderThumb {...other}>
      {children}
      <Button endIcon={<NavigateNextIcon />}>Slide to Confirm</Button>
    </SliderThumb>
  );
}


const TestElection: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const { id } = query;

  const electionId = Array.isArray(id) ? id[0] : id;

  const [election, setElection] = useState<Maybe<Election>>(null)

  const loadElection = async () => {
    if (electionId) {
      const resp = await getElection(electionId)
      setElection(resp);
    }
  }

  useEffect(()=> {    
    if (electionId) {
      loadElection();
    }
  }, [electionId])

  const closeTestElection = async () => {
    if (electionId) {
      await closeElectionTest(electionId)
      router.push('/dashboard')
    }
  }

  return <LoggedInLayout title="Test Election">
    {!election && <Loading />}
    {election && election?.electionStatus !== ElectionStatus.test  && <GC direction="column" spacing={2}>
        <GI>
          <Typography variant="h2">You are not in Testing Mode</Typography>
        </GI>
        <GI>
          <GC justifyContent="space-between">
            <GI>
            <Button onClick={()=>router.push('/dashboard')}>Go to Dashboard</Button>
            </GI>
          </GC>
          
        </GI>
      </GC>}
    {election && election?.electionStatus === ElectionStatus.test  && <>
      <Typography variant="h2">Please confirm to continue.</Typography>
      <Typography sx={{fontSize: "3em", margin: "2em 0"}}>
        Would you like to end testing mode for {election?.electionJurisdictionName} {election?.electionName}?
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={3}>
          <Button>Back</Button>
        </Grid>
        <Grid item xs={2}>&nbsp;</Grid>
        <Grid item xs={6}>
          <Slider 
            onChangeCommitted={(_event, newValue)=>{
              if (newValue === 100) {
                closeTestElection();
              }
            }}
            components={{
              Thumb: ThumbComponent
            }}
            step={null}

            marks={[{
              value: 0,
              label: ''
            }, {
              value: 100,
              label: ''
            }]}
            defaultValue={0} 
          />
        </Grid>
      </Grid>
    </>}
  </LoggedInLayout>
}

export default TestElection;