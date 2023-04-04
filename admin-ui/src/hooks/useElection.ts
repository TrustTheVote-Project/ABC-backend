import { useCallback, useEffect, useState } from "react";

import { createElection, getAll as getAllElections, getElection, setElectionAttributes, setElectionConfigurations } from 'requests/election'
import { Election, ElectionCreate, Maybe } from "types";

type ElectionHookResult = {
  election: Maybe<Election>;
  loading: boolean;
  loadElection: () => Promise<void>;
  saveElection: (data: Election | ElectionCreate) => Promise<void>;
};

export default function useElection(electionId?: string): ElectionHookResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [election, setElection] = useState<Maybe<Election>>(null);
  
  const loadElection = async () => {
    if (electionId) {
      setLoading(true);
      const resp = await getElection(electionId);
      setElection(resp);
      setLoading(false);
    }
  };
  const fetchElection = useCallback(loadElection, [electionId]);

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

  useEffect(() => {
    fetchElection()
  }, [fetchElection]);

  return {election, loading, loadElection , saveElection};
}