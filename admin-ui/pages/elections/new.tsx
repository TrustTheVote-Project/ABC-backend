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

const NewElection: NextPage = () => {
  const [election, setElection] = useState<Maybe<Election>>(null);

  const onUpdateElection = async (election: Election) => {
    setElection(election);
  };
  const [data, setData] = useState<Maybe<Election | ElectionCreate>>(election);

  return (
    <LoggedInLayout title="Create Election">
      <ElectionForm
        election={election}
        title="Create Election"
        onUpdateElection={onUpdateElection}
        data={data}
        setData={setData}
      />
    </LoggedInLayout>
  );
};

export default NewElection;
