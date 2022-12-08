import CheckIcon from '@mui/icons-material/Check';
import { Button, Grid, Slider, SliderThumb, Typography } from '@mui/material';
import LoggedInLayout from 'layout/LoggedInLayout';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Election, ElectionServingStatus, ElectionStatus, Maybe } from 'types';
import { getElection, setElectionAttributes } from 'requests/election';
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

  return <LoggedInLayout title="Test Election">
    {!election && <Loading />}
    {election && election?.electionStatus === ElectionStatus.test && <GC direction="column" spacing={2}>
        <GI>
          <Typography variant="h2">You are now in Testing Mode!</Typography>
        </GI>
        <GI>
          <ElectionCard election={election} />
        </GI>
        <GI>
          <GC justifyContent="space-between">
            <GI>
            <Button endIcon={<CheckIcon/>} onClick={()=>router.push(`/elections/${election.electionId}/close-test`)}>I&apos;m Done Testing</Button>
            </GI>
            <GI>
            <Button onClick={()=>router.push('/dashboard')}>Go to Dashboard</Button>
            </GI>
          </GC>
          
        </GI>
      </GC>}
    {election && election?.electionStatus !== ElectionStatus.test && <>
      <Typography variant="h2">You are not in testing mode.</Typography>      
    </>}
  </LoggedInLayout>
}

export default TestElection;