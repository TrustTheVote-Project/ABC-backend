import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { createElection, getElection, getFileStatus, setElectionAttributes, setElectionConfigurations } from 'requests/election';
import { Election, ElectionCreate, Maybe } from 'types';

interface ElectionContextType {
  election: Maybe<Election>;
  loadElection: () => void;
  updateElection: (data: Election) => void;
  edfStatus: { [x: string]: any },
  updateEDFStatus: (edfUid: string) => void
  ballotsStatus: { [x: string]: any },
  updateBallotsStatus: (ballotsUid: string) => void
  voterFileStatus: { [x: string]: any },
  updateVoterFileStatus: (voterFileUid: string) => void,
  testVoterFileStatus: { [x: string]: any },
  updateTestVoterFileStatus: (testVoterFileUid: string) => void

}

export const ElectionContext = createContext<ElectionContextType>({
  election: null,
  loadElection: ():void => {},
  updateElection: (data: Election): void => {},
  edfStatus: {},
  updateEDFStatus: (edfUid: string): void => {},
  ballotsStatus: {},
  updateBallotsStatus: (ballotsUid: string): void => {},
  voterFileStatus: {},
  updateVoterFileStatus: (voterFileUid: string): void => {},
  testVoterFileStatus: {},
  updateTestVoterFileStatus: (voterFileUid: string): void => {},
});

type ElectionProviderProps = {
  electionId: string;
  children: ReactNode;
};

export const ElectionProvider = ({electionId,  children }: ElectionProviderProps) => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  const [edfStatus, setEDFStatus] = useState<{ [x: string]: any }>(
    election?.electionDefinitionFile ? { status: "started" } : {}
  );
  const [ballotsStatus, setBallotsStatus] = useState<{ [x: string]: any }>(
    election?.ballotsFile ? { status: "started" } : {}
  );
  const [voterFileStatus, setVoterFileStatus] = useState<{ [x: string]: any }>(
    election?.votersFile ? { status: "started" } : {}
  );
  const [testVoterFileStatus, setTestVoterFileStatus] = useState<{ [x: string]: any }>(
    election?.testVotersFile ? { status: "started" } : {}
  );

  useEffect(() => {
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  const loadElection = async () => {
    if (electionId) {
      const resp = await getElection(electionId);
      setElection(resp);

      resp?.electionDefinitionFile && setEDFStatus({ status: "started" });
      resp?.ballotsFile && setBallotsStatus({ status: "started" });
      resp?.votersFile && setVoterFileStatus({ status: "started" });
      resp?.testVotersFile && setTestVoterFileStatus({ status: "started" });

      updateEDFStatus(resp.electionDefinitionFile || '');
      updateBallotsStatus(resp.ballotsFile || '');
      updateVoterFileStatus(resp.votersFile || '');
      updateVoterFileStatus(resp.testVotersFile || '');
    }
  };

  const updateElection = (data: Election ) => {
    data && setElection(data);
  }

  const updateFileStatus = async (uid: string, type: string) => {
    if (uid) {
      const resp = await getFileStatus(uid);
      switch (type) {
        case 'edf': 
          setEDFStatus(resp);
          break;
        case 'ballot': 
          setBallotsStatus(resp);
          break;
        case 'voterFile': 
          setVoterFileStatus(resp);
          break;
        case 'testVoterFile': 
          setTestVoterFileStatus(resp);
          break;
        default:
          break;
      }
    }
  }

  const updateEDFStatus = async (edfUid: string) => {
    if (edfUid) {
      const resp = await updateFileStatus(edfUid, 'edf');
    }
  };

  const updateBallotsStatus = async (ballotsUid: string) => {
    if (ballotsUid) {
      const resp = await updateFileStatus(ballotsUid, 'ballot');
    }
  };

  const updateVoterFileStatus = async (voterFileUid: string) => {
    if (voterFileUid) {
      const resp = await updateFileStatus(voterFileUid, 'voterFile');
    }
  };

  const updateTestVoterFileStatus = async (voterFileUid: string) => {
    if (voterFileUid) {
      const resp = await updateFileStatus(voterFileUid, 'testVoterFile');
    }
  };

  const electionContextValue = {
    election,
    edfStatus,
    ballotsStatus,
    voterFileStatus,
    testVoterFileStatus,
    loadElection,
    updateElection,
    updateEDFStatus,
    updateBallotsStatus,
    updateVoterFileStatus,
    updateTestVoterFileStatus
  };

  return (
    <ElectionContext.Provider value={electionContextValue}>
      {children}
    </ElectionContext.Provider>
  );
};
