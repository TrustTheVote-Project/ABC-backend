import { useEffect, useRef, useState } from "react";

import {
  getAll as getAllElections,
  adminGetCurrentElection,
  getCurrentTestElection,
} from "requests/election";
import { Election, Maybe } from "types";

export default function useCurrentElection(): [
  Maybe<Election>,
  () => void,
  boolean
] {
  const [loading, setLoading] = useState<boolean>(true);
  const [election, setElection] = useState<Maybe<Election>>(null);
  const isMounted = useRef(true);

  const loadElection = async () => {
    setLoading(true);
    let e = await adminGetCurrentElection();

    //CTW shouldn't be doing it this way now
    if (!e) {
      e = await getCurrentTestElection();
    }
    // Populate elections with their config
    if (isMounted.current) {
      setElection(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current && loadElection();

    return () => {
      isMounted.current = false;
    }
  }, []);

  return [election, loadElection, loading];
}
