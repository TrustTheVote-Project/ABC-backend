import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { createElection, getElection, setElectionAttributes, setElectionConfigurations } from 'requests/election';
import { Election, ElectionCreate, Maybe } from 'types';

interface ElectionContextType {
  election: Maybe<Election>;
  loadElection: (electionId: string) => void;
  updateElection: (data: Election) => void;
}

export const ElectionContext = createContext<ElectionContextType>({
  election: null,
  loadElection: (electionId: string):void => {},
  updateElection: (data: Election): void => {}
});

export const ElectionProvider = ({electionId,  children }) => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  useEffect(() => {
    console.log('In Context', electionId);
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  const loadElection = async () => {
    console.log('ELECTIONCONTEXT - ' + electionId)
    if (electionId) {
      const resp = await getElection(electionId);
      setElection(resp);
    }
  };

  const updateElection = async (data: Election ) => {
    data && setElection(data);
  }

  return (
    <ElectionContext.Provider value={{ election, loadElection, updateElection }}>
      {children}
    </ElectionContext.Provider>
  );
};
