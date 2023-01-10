import type { NextPage } from 'next'
import DefaultLayout from 'layout/DefaultLayout'
import { Button, Grid, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import Input from 'component/Input';

import theme from 'theme'
import UserContext from 'context/UserContext'
import { requestLoginCode } from 'requests/auth'
import { useRouter } from 'next/router'

const Home: NextPage = () => {

  const [email, setEmail] = useState<string>("")

  const userContext = useContext(UserContext);
  const { setSessionId, user } = userContext;
  
  const router = useRouter()

  const submitLogin = async () => {
    const resp = await requestLoginCode({email})
    if (resp.success) {
      setSessionId(resp.sessionId)
      //router.push('/dashboard')
    }
  }

  if (user) {
    router.push('/dashboard')
    return null;
  }

  return <DefaultLayout title="Login">
    <Grid container sx={{height: "100%"}} alignItems="stretch">
      <Grid item xs={12} sm={6} md={8} sx={{padding: "20px", background: theme.palette.grey[100]}}>
        <Grid container direction="column" justifyContent="center" sx={{height: "100%"}}>
          <Grid item>
            <Typography variant="h1">Welcome to the ballot accessibility backend!</Typography>
            <Typography variant="h3">Please sign in to get started</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={4} sx={{padding: "20px"}}>
        <Grid container direction="column" justifyContent="center" spacing={2} sx={{height: "100%"}}>
          <Grid item>
            <Typography variant="h3">Sign in</Typography>
            <Typography>Sign in by entering your email address below.</Typography>        
          </Grid>
          <Grid item>
            <Grid container spacing={1} direction="column">
              <Grid item xs={3}>
                <Input name="email" label="Email" onChange={(_name,value)=>{
                  setEmail(value)
                }} />
              </Grid>
              <Grid item xs={3}>
                <Button onClick={submitLogin}>Sign in</Button>
              </Grid>  
            </Grid>
          </Grid>
          
        </Grid>
      </Grid>
    </Grid>
  </DefaultLayout>

}

export default Home
