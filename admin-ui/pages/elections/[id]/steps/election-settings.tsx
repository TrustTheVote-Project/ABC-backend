import type { NextPage } from "next";
import LoggedInLayout from "layout/LoggedInLayout";
import {
  Button,
  Card,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

import Input from "component/Input";

import theme from "theme";
import UserContext from "context/UserContext";
import { requestLoginCode } from "requests/auth";
import { useRouter } from "next/router";
import { Election, ElectionCreate, Maybe } from "types";
import { getAll as getAllElections, getElection } from "requests/election";
import Section from "component/Section";
import ElectionCard from "component/ElectionCard";
import { Box } from "@mui/system";
import ElectionForm from "component/ElectionForm";
import ElectionName from "component/election-steps/ElectionName";
import ElectionPageLayout from "layout/ElectionPageLayout";
import ElectionSettings from "component/election-steps/ElectionSettings";
import useElection from "hooks/useElection";

const Settings: NextPage = () => {
  // const [election, setElection] = useState<Maybe<Election>>(null);
  const router = useRouter();
  const { query } = router;
  const { id } = query;
  
  const electionId = Array.isArray(id) ? id[0] : id;
  const [election, loading] = useElection(electionId);

  // useEffect(() => {
  //   const loadElection = async () => {
  //     if (electionId) {
  //       const resp = await getElection(electionId);
  //       // const configuration = await getConfigurations(electionId);
  //       // resp.configuration = configuration;
  //       setElection(resp);
  //     }
  //   };
  //   if (electionId) {
  //     loadElection();
  //   }
  // }, [electionId]);

  return (
    <ElectionPageLayout title="Update Election" showStepper={!!election} step={1} electionId={electionId} >
      {election && (
        <ElectionSettings
          election={election}
          title="Update Election"
          onUpdateElection={(e) => {}}
        />
      )}
    </ElectionPageLayout>
  );
};

export default Settings;
