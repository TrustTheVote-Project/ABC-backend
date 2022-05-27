import { useEffect, useState } from "react";

import { getAll as getAllElections } from 'requests/election'
import { Election } from "types";

export default function useElections(): [
  Array<Election>,
  () => void,
  boolean
] {
  const [loading, setLoading] = useState<boolean>(true);
  const [elections, setElections] = useState<Array<Election>>([])

  const loadElections = async () => {
    const newElections = await getAllElections();
    // Populate elections with their config
    setElections(newElections);
    setLoading(false);
  }

  useEffect(()=>{
    loadElections();
  }, [])

  return [elections, loadElections, loading]
}