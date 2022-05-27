import '../styles/globals.css'
import type { AppProps } from 'next/app'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';


import UserContext, { UserContextType } from 'context/UserContext';
import { useEffect, useState } from 'react';
import { Maybe, User } from 'types';
import { identify } from 'requests/auth';

import theme from 'theme';

const USER_ID_KEY = "abc_user_id"

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<Maybe<User>>(undefined);

  let storedUserId: Maybe<string> = null;
  if (typeof(window)!=='undefined') {
    const storedUserIdString: Maybe<string> = window.localStorage.getItem(USER_ID_KEY);
    if (storedUserIdString) {
      storedUserId = storedUserIdString;
    }
  }

  const setUserFromId = async (newUserId: Maybe<string>) => {
    if (newUserId) {
      // It's always self?
      const newUser = (await identify()) as User;      
      if (typeof(window)!=='undefined') {
        window.localStorage.setItem(USER_ID_KEY, newUser.id);
      }
      setUser(newUser);
    } else {
      setUser(null);
    }
  }

  useEffect(()=>{
    const loadUserFromSession = async () => {
      const userResp = await identify();
      setUser(userResp);
    }
    // TODO: store a user-updated-at data so even if user is present
    // in the state tree, check they're still logged in if it's been a minute.
    // e.g. if (!user || userNeedsRefresh)
    if (!user) {
      loadUserFromSession();
    }
  }, [])

  const baseUserContext : UserContextType = {
    user: storedUserId ? user as Maybe<User> : null,
    setUserId: setUserFromId,
    logout: () => {
      setUserFromId(null);
    }
  }

  if (typeof(user)==="undefined") {
    return null;
  }

  return <ThemeProvider theme={theme}>    
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>  
            <UserContext.Provider value={baseUserContext}>
              <Component {...pageProps} />
            </UserContext.Provider>
          </LocalizationProvider>
        </ThemeProvider>
}
export default MyApp
