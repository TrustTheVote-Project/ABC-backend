import React from 'react';
import { Maybe, User } from 'types';

const defaultUser: Maybe<User> = null;

export type UserContextType = {
  user: Maybe<User>
  setUserId(newUserId: Maybe<string>): void
  logout(): void
}

const UserContext = React.createContext({
  user: defaultUser,
  setUserId: (newUserId: Maybe<string>): void => {},
  logout: (): void => {}
} as UserContextType)

export default UserContext;