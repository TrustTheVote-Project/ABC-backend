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

const NewElection: NextPage = () => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  const router = useRouter();
  const { query } = router;
  const { id } = query;

  const electionId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const loadElection = async () => {
      if (electionId) {
        const resp = await getElection(electionId);
        // const configuration = await getConfigurations(electionId);
        // resp.configuration = configuration;
        setElection(resp);
      }
    };
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  return (
    <LoggedInLayout title="Create Election">
      {election && (
        <ElectionForm
          election={election}
          title="Update Election"
          onUpdateElection={(e) => setElection(e)}
        />
      )}
    </LoggedInLayout>
  );
};

export default NewElection;