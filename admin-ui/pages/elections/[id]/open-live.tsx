import { Button, Grid, Slider, SliderThumb, Typography } from '@mui/material';
import LoggedInLayout from 'layout/LoggedInLayout';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Election, ElectionStatus, Maybe } from 'types';
import { getElection, setCurrentElection, openElection, setElectionAttributes } from 'requests/election';

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


const OpenElection: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const { id } = query;

  const electionId = Array.isArray(id) ? id[0] : id;

  const [election, setElection] = useState<Maybe<Election>>(null)

  useEffect(()=> {
    const loadElection = async () => {
      if (electionId) {
        const resp = await getElection(electionId)
        setElection(resp);
      }
    }
    if (electionId) {
      loadElection();
    }
  }, [electionId])

  const runOpenElection = async () => {
    if (electionId) {
      await setCurrentElection(electionId)
      await openElection(electionId)
      router.push("/dashboard")  
    }
  }

  return <LoggedInLayout title="Open Election">
    <Typography variant="h2">Please confirm to continue.</Typography>
    <Typography sx={{fontSize: "3em", margin: "2em 0"}}>
      Once you open an election you cannot go back and edit it. If you understand,
      please proceed to Open Your Election.
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
              runOpenElection();
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
  </LoggedInLayout>
}

export default OpenElection;