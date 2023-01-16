import '../styles/globals.css'
import type { AppProps } from 'next/app'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';


import UserContext, { UserContextType } from 'context/UserContext';
import { useEffect, useState } from 'react';
import { Maybe, User } from 'types';
import { identify, logout as serverLogout } from 'requests/auth';

import theme from 'theme';
import { useRouter } from 'next/router';
import { SESSION_ID_KEY } from 'requests/base';


function MyApp({ Component, pageProps }: AppProps) {
  const isHome = Component.displayName === "Home";
  const router = useRouter();

  const [user, setUser] = useState<Maybe<User>>(undefined);

  let storedSessionId: Maybe<string> = null;
  if (typeof(window)!=='undefined') {
    const storedSessionIdString: Maybe<string> = window.localStorage.getItem(SESSION_ID_KEY);
    if (storedSessionIdString) {
      storedSessionId = storedSessionIdString;
    }
  }

  const setNewSessionId = async (newSessionId: Maybe<string>) => {
    if (newSessionId) {
      // const newUser = (await identify()) as User;      
      // if (typeof(window)!=='undefined') {
        window.localStorage.setItem(SESSION_ID_KEY, newSessionId);
      // }
      setUser({ id: newSessionId });
    } else {
      window.localStorage.removeItem(SESSION_ID_KEY);
      setUser(null);
    }
  }

  useEffect(()=>{
    const loadUserFromSession = async () => {
      try {
        if (storedSessionId) {
          const userResp = await identify(storedSessionId);
          if (userResp.success) {
            setUser({id: userResp.sessionId});
          } else {
            setNewSessionId(null);
            setUser(null)
          }
             
        } else {
          if (isHome) {
            setUser(null)
          } else {
            router.push("/")
          }  
        }
      } catch (err) {
        if (isHome) {
          setUser(null)
        } else {
          router.push("/")
        }
      }
    }
    // TODO: store a user-updated-at data so even if user is present
    // in the state tree, check they're still logged in if it's been a minute.
    // e.g. if (!user || userNeedsRefresh)
    if (!user) {
      loadUserFromSession();
    }
  }, [])

  const baseUserContext : UserContextType = {
    user: storedSessionId ? user as Maybe<User> : null,
    setSessionId: setNewSessionId,
    logout: () => {
      setNewSessionId(null);
      serverLogout();
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
