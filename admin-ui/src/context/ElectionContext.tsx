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

type ElectionProviderProps = {
  electionId: string;
  children: ReactNode;
};

export const ElectionProvider = ({electionId,  children }: ElectionProviderProps) => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  useEffect(() => {
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  const loadElection = async () => {
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
