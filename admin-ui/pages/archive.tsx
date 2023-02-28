import type { NextPage } from "next";
import LoggedInLayout from "layout/LoggedInLayout";
import { Typography } from "@mui/material";

import { Election, ElectionStatus } from "types";

import Section from "component/Section";
import ElectionCard from "component/ElectionCard";
import useElections from "hooks/useElections";
import GC from "component/GC";
import GI from "component/GI";
import Loading from "component/Loading";
import useCurrentElection from "hooks/useCurrentElection";

const Archive: NextPage = () => {
  const [elections, reloadElections, loadingElections] = useElections();
  const [currentElection, reloadCurrentElection] = useCurrentElection();

  const onUpdateElection = () => {
    reloadCurrentElection();
    reloadElections();
  };

  let archivedElections: Array<Election> = [];

  elections.forEach((e) => {
    if (e.electionStatus === ElectionStatus.archived) {
      archivedElections.push(e);
    }
  });

  return (
    <LoggedInLayout title="Archive">
      <Typography variant="h1">Archive</Typography>
      {loadingElections && <Loading />}
      {!loadingElections && (
        <Section>
          <Typography variant="h2">Archived Elections</Typography>
          <GC direction="column" spacing={2}>
            {archivedElections.map((election) => {
              return (
                <GI key={election.electionId}>
                  <ElectionCard
                    onUpdateElection={onUpdateElection}
                    currentElection={currentElection}
                    election={election}
                  />
                </GI>
              );
            })}
            {archivedElections.length === 0 && (
              <GI>
                <Typography variant="h3">No Archived Elections</Typography>
              </GI>
            )}
          </GC>
        </Section>
      )}
    </LoggedInLayout>
  );
};

export default Archive;
