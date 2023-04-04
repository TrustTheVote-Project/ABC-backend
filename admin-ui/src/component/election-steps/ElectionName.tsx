import {
  Button,
  Grid,
  Alert,
} from "@mui/material";
import {
  Election,
  ElectionConfiguration,
  ElectionCreate,
  Maybe,
} from "types";

import Input from "component/Input";
import DatePicker from "component/DatePicker";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import {
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/router";

import { dateToYMD, formatTimeStamp } from "dsl/date";
import LoadingButton from "component/LoadingButton";
import Loading from "component/Loading";
import { ElectionContext } from "context/ElectionContext";
import useSaveElection from "hooks/useSaveElection";

interface ElectionFormProps {
  // electionId: string;
  // title: string;
  viewOnly?: boolean;
  mode?: string;
}

export default function ElectionName({
  // electionId,
  // title,
  viewOnly = false,
  mode = ''
}: ElectionFormProps) {

  const { election, updateElection: updateElectionInCtx} = useContext(ElectionContext);
  const {election: updatedElection, saveElection} = useSaveElection();

  const [data, setData] = useState<Maybe<Election | ElectionCreate>>(election);
  
  const [alertText, setAlertText] = useState<string>("");
  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const router = useRouter();
  
  useEffect(() => {
    setData(election);
  }, [election]);

  useEffect(() => {
    if (updatedElection) {
      updateElectionInCtx(updatedElection);
      router.push(
        `/elections/${(updatedElection as Election)?.electionId}/election-settings`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedElection]);

  const handleConfigurationChange = (name: string, value: any) => {
    const newData = { ...(data || {}) } as { [x: string]: any };
    newData.configurations = {...(data?.configurations || {})} as ElectionConfiguration;
    newData.configurations[name] = value;
    setData(newData as Election);
  };

  const handleDataChange = (name: string, value: any) => {
    const newData = { ...data } as { [x: string]: any };
    newData[name] = value;
    setData(newData as Election);
  };

  const handleDateDataChange = (name: string, value: any) => {
    const formattedDate = dateToYMD(value);
    handleDataChange(name, formattedDate);
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

  const save = async () => {
    try {
      if (data) {
        await saveElection(data);
      }
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
        <LoadingButton endIcon={<NavigateNextIcon />} onClick={save}>
          Save
        </LoadingButton>
      </Grid>
    </Grid>
  );

  
  return (
  <>
    {!!!election && mode != 'create' ? (
      <Loading />
    ) : (
      <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
        <Grid item flexGrow={1}>{electionNameFields}</Grid>
        <Grid item>
          {alertText && <Alert severity="error">{alertText}</Alert>}
        </Grid>
        {!viewOnly && <Grid item>{actions}</Grid>}
      </Grid>
    )}
  </>
  );
}
