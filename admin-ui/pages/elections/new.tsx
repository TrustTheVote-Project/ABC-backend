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
import { getAll as getAllElections } from "requests/election";
import Section from "component/Section";
import ElectionCard from "component/ElectionCard";
import { Box } from "@mui/system";
import ElectionForm from "component/ElectionForm";
import ElectionName from "component/election-steps/ElectionName";

const NewElection: NextPage = () => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  const onUpdateElection = async (election: Election) => {
    setElection(election);
  };

  return (
    <LoggedInLayout title="Create Election">
      <ElectionName mode="create" />
    </LoggedInLayout>
  );
};

export default NewElection;
