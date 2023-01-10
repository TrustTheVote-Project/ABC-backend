import React from 'react';
import { Maybe, User } from 'types';

const defaultUser: Maybe<User> = null;

export type UserContextType = {
  user: Maybe<User>
  setSessionId(newSessionId: Maybe<string>): void
  logout(): void
}

const UserContext = React.createContext({
  user: defaultUser,
  setSessionId: (newSessionId: Maybe<string>): void => {},
  logout: (): void => {}
} as UserContextType)

export default UserContext;