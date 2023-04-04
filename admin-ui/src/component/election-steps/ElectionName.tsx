import {
  Button,
  Grid,
  Typography,
  Alert,
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import {
  Election,
  ElectionConfiguration,
  ElectionCreate,
  ElectionStatus,
  Maybe,
} from "types";

import Input from "component/Input";
import DatePicker from "component/DatePicker";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import {
  setElectionAttributes,
  createElection,
  getElection,
  setElectionConfigurations,
} from "requests/election";
import { useRouter } from "next/router";

import { dateToYMD, formatTimeStamp } from "dsl/date";
import { eachHourOfInterval } from "date-fns";
import useCurrentElection from "hooks/useCurrentElection";
import LoadingButton from "component/LoadingButton";
import useElection from "hooks/useElection";
import Loading from "component/Loading";
import { Form } from "react-router-dom";

interface ElectionFormProps {
  electionId: string;
  title: string;
  viewOnly?: boolean;
}

export default function ElectionName({
  electionId,
  title,
  viewOnly = false
}: ElectionFormProps) {

  const {election, loading, saveElection} = useElection(electionId);
  const [data, setData] = useState<Maybe<Election | ElectionCreate>>(null);
  
  const [alertText, setAlertText] = useState<string>("");
  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const router = useRouter();
  
  useEffect(() => {
    setData(election);
  }, [election]);

  const handleConfigurationChange = (name: string, value: any) => {
    const newData = { ...(data || {}) } as { [x: string]: any };
    newData.configurations = {...(data?.configurations || {})} as ElectionConfiguration;
    newData.configurations[name] = value;
    console.log('Election', JSON.stringify(election) === JSON.stringify(newData));
    console.log('NewData', newData);
    setData(newData as Election);
  };

  const handleDataChange = (name: string, value: any) => {
    const newData = { ...data } as { [x: string]: any };
    newData[name] = value;
    console.log('Election', election);
    console.log('NewData', newData);
    console.log(typeof setData);
    setData(newData as Election);
  };

  const handleDateDataChange = (name: string, value: any) => {
    const formattedDate = dateToYMD(value);
    handleDataChange(name, formattedDate);
  };

  const save = async () => {
    console.log('Election', JSON.stringify(election) === JSON.stringify(data));
    data && saveElection(data);
  };

  const messageError = (e: any) => {
    setAlert(
      e?.data?.error_description ||
        e?.data?.message ||
        e?.message ||
        JSON.stringify(e)
    );
  };

  const handleCancel = () => {
    setData(election);
  };

  const saveNext = async () => {
    try {
      await save();
      router.push(
        `/elections/${(data as Election)?.electionId}/steps/election-settings`
      );
    } catch (e) {
      messageError(e);
    }
  };

  const startDateError = data?.electionVotingStartDate === undefined;
  const startDateErrorProps = startDateError
    ? {
        helperText: "Input is required",
        error: true,
      }
    : {};

  const endDateError = data?.electionVotingEndDate === undefined;
  const endDateErrorProps = endDateError
    ? {
        helperText: "Input is required",
        error: true,
      }
    : {};

  const electionNameFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Input
          required="You must specify the jurisdiction name."
          data={data}
          onChange={handleDataChange}
          name="electionJurisdictionName"
          label="Enter Jurisdiction Name."
          placeholder="Jurisdiction Name Here"
          readOnly={viewOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          required="You must specify the election name."
          data={data}
          onChange={handleDataChange}
          name="electionName"
          label="Enter Election Name."
          placeholder="Election Name"
          readOnly={viewOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          data={data?.configurations}
          onChange={handleConfigurationChange}
          name="stateName"
          label="Enter State Name."
          placeholder="State"
          readOnly={viewOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          data={data?.configurations}
          onChange={handleConfigurationChange}
          name="stateCode"
          label="Enter State Abbreviation."
          placeholder="2-Letter State Abbreviation"
          readOnly={viewOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <DatePicker
          data={data}
          onChange={handleDataChange}
          name="electionDate"
          label="Enter Election Date"
          placeholder="E.g. 11/1/2022"
          readOnly={viewOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <DatePicker
          data={data}
          onChange={handleDateDataChange}
          name="electionVotingStartDate"
          label="Digital Absentee Voting Opening Date*"
          placeholder="E.g. 10/1/2022"
          {...startDateErrorProps}
          readOnly={viewOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <DatePicker
          data={data}
          onChange={handleDateDataChange}
          name="electionVotingEndDate"
          label="Digital Absentee Voting End Date*"
          placeholder="E.g. 10/1/2022"
          {...endDateErrorProps}
        />
      </Grid>
    </Grid>
  );


  const actions = (
    <Grid container justifyContent="center" spacing={2} alignItems="flex-end">
      <Grid item xs={4} sm={4} md={3}>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
      </Grid>
      <Grid item xs={4} sm={4} md={3}>
        <LoadingButton endIcon={<NavigateNextIcon />} onClick={saveNext}>
          Save
        </LoadingButton>
      </Grid>
    </Grid>
  );

  
  return (
  <>
    {loading ? (
      <Loading />
    ) : (
      election && (
        <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
          <Grid item flexGrow={1}>{electionNameFields}</Grid>
          <Grid item>
            {alertText && <Alert severity="error">{alertText}</Alert>}
          </Grid>
          {!viewOnly && <Grid item>{actions}</Grid>}
        </Grid>
      )
    )}
  </>
  );
}
