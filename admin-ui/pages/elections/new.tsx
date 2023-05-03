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
import router, { useRouter } from "next/router";
import { Election, ElectionCreate, Maybe } from "types";
import { getAll as getAllElections } from "requests/election";
import Section from "component/Section";
import ElectionCard from "component/ElectionCard";
import { Box } from "@mui/system";
import ElectionForm from "component/ElectionForm";
import ElectionAttributesForm from "component/election-steps/ElectionAttributesForm";
import ElectionPageLayout from "layout/ElectionPageLayout";

const NewElection: NextPage = () => {

  const handleCancel = () => {
    router.push("/dashboard");
  }
  
  return (
    <ElectionPageLayout title="Create Election" hideStepper>
      <ElectionAttributesForm mode="create" onCancel={handleCancel} />
    </ElectionPageLayout>
  );
};

export default NewElection;
