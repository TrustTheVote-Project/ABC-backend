import { useEffect, useState } from "react";

import { getAll as getAllElections, getCurrentElection, getCurrentTestElection } from 'requests/election'
import { Election, Maybe } from "types";

export default function useCurrentElection(): [
  Maybe<Election>,
  () => void,
  boolean
] {
  const [loading, setLoading] = useState<boolean>(true);
  const [election, setElection] = useState<Maybe<Election>>(null)

  const loadElection = async () => {
    let e = await getCurrentElection();
    if (!e) {
      e = await getCurrentTestElection();
    }
    // Populate elections with their config
    setElection(e);
    setLoading(false);
  }

  useEffect(()=>{
    loadElection();
  }, [])

  return [election, loadElection, loading]
}