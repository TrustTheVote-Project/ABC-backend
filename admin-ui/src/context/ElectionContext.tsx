import React, { createContext, ReactNode, useState } from 'react';
import { createElection, getElection, setElectionAttributes, setElectionConfigurations } from 'requests/election';
import { Election, ElectionCreate, Maybe } from 'types';

interface ElectionContextType {
  election: Maybe<Election>;
  loadElection: (electionId: string) => void;
  saveElection: (data: Election | ElectionCreate) => void;
}

export const ElectionContext = createContext<ElectionContextType>({
  election: null,
  loadElection: (electionId: string):void => {},
  saveElection: (data: Election | ElectionCreate): void => {}
});

export const ElectionProvider: React.FC = ({ children }) => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  const loadElection = async (electionId: string) => {
    console.log('ELECTIONCONTEXT - ' + electionId)
    if (electionId) {
      const resp = await getElection(electionId);
      setElection(resp);
    }
  };

  const saveElection = async (data: Election | ElectionCreate) => {
    try {
      let updatedElection: Maybe<Election> = null;
      if ((data as Election)?.electionId) {
        updatedElection = await setElectionAttributes(data as Election);
      } else {
        updatedElection = await createElection(data as ElectionCreate);
      }
      if ((data as Election)?.configurations) {
        updatedElection = await setElectionConfigurations(
          updatedElection.electionId,
          (data as Election)?.configurations
        );
      }
      setElection(updatedElection);
      // onUpdateElection(updatedElection); TODO-R
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  return (
    <ElectionContext.Provider value={{ election, loadElection, saveElection }}>
      {children}
    </ElectionContext.Provider>
  );
};
