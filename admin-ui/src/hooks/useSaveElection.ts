import { useCallback, useEffect, useState } from "react";

import { createElection, getAll as getAllElections, getElection, setElectionAttributes, setElectionConfigurations } from 'requests/election'
import { Election, ElectionCreate, Maybe } from "types";

type ElectionHookResult = {
  election: Maybe<Election>;
  saveElection: (data: Election | ElectionCreate) => Promise<void>;
};

export default function useSaveElection(): ElectionHookResult {
  const [election, setElection] = useState<Maybe<Election>>(null);

  const saveElection = async (data: Election | ElectionCreate) => {
    try {
      setElection(null);
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

  return {election, saveElection};
}