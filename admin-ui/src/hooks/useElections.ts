import { useEffect, useRef, useState } from "react";

import { getAll as getAllElections } from 'requests/election'
import { Election } from "types";

export default function useElections(): [
  Array<Election>,
  () => void,
  boolean
] {
  const [loading, setLoading] = useState<boolean>(true);
  const [elections, setElections] = useState<Array<Election>>([])
  const isMounted = useRef(true);
  
  const loadElections = async () => {
    const newElections = await getAllElections();
    // Populate elections with their config
    if (isMounted.current) {
      setElections(newElections);
      setLoading(false);
    }
  }

  useEffect(()=>{
    isMounted.current && loadElections();

    return () => {
      isMounted.current = false;
    }
  }, [])

  return [elections, loadElections, loading]
}