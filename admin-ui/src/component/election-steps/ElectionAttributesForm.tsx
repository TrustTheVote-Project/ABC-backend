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
  StepsRoutes,
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
import useWarningIfUnsavedData from "hooks/useWarningIfUnsavedData";

interface ElectionAttributesFormProps {
  // electionId: string;
  // title: string;
  election?: Maybe<Election>;
  onUpdateElection?: (election: Election) => void;
  onCancel(): void;
  viewOnly?: boolean;
  mode?: string;
}

export default function ElectionAttributesForm({
  // electionId,
  // title,
  election,
  onUpdateElection,
  onCancel,
  viewOnly = false,
  mode = ''
}: ElectionAttributesFormProps) {

  // const { election, updateElection: updateElectionInCtx} = useContext(ElectionContext);
  const {election: updatedElection, saveElection} = useSaveElection();
  const [data, setData] = useState<Maybe<Election | ElectionCreate>>(election);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  
  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const router = useRouter();
  
  useEffect(() => {
    if (updatedElection) {
      
      onUpdateElection && onUpdateElection(updatedElection);
      
      router.push(
        `/elections/${(updatedElection as Election)?.electionId}/${StepsRoutes.ElectionSettings}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedElection]);

  useWarningIfUnsavedData(hasUnsavedChanges);

  const checkForChanges = (newData: Election) => {
    const initialFormData = JSON.stringify(election);
    const initialFormConfigurations = JSON.stringify(election?.configurations || {});
    
    const currentFormData = JSON.stringify(newData);
    const currentFormConfigurations = JSON.stringify(newData?.configurations || {});
    
    const hasFormChanges = initialFormData != currentFormData || initialFormConfigurations != currentFormConfigurations;
    console.log ('hasFormChanges ',   hasFormChanges);
    console.log ('Old data ', election);
    console.log ('new data ',newData);
    setHasUnsavedChanges(hasFormChanges);
  }

  const handleConfigurationChange = (name: string, value: any) => {
    const newData = { ...(data || {}) } as { [x: string]: any };
    newData.configurations = {...(data?.configurations || {})} as ElectionConfiguration;
    newData.configurations[name] = value;
    setData(newData as Election);
    checkForChanges(newData as Election);
  };

  const handleDataChange = (name: string, value: any) => {
    const newData = { ...data } as { [x: string]: any };
    newData[name] = value;
    console.log('Value ', value)
    setData(newData as Election);
    checkForChanges(newData as Election);
  };

  const handleDateDataChange = (name: string, value: any) => {
    const formattedDate = dateToYMD(value);
    console.log('formattedDate ', formattedDate)
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

  const validateData = ():boolean => {
    const newData = { ...(data || {}) } as { [x: string]: any };
    const requiredArgs = [
      "electionName",
      "electionJurisdictionName",
      "electionDate",
      "electionVotingStartDate",
      "electionVotingEndDate",
    ];
    let error = false;

    if ( newData ) {
      const hasAllRequiredValues = requiredArgs.every((key) => newData?.hasOwnProperty(key) && newData[key] && /\s/.test(newData[key]));
      error = !hasAllRequiredValues;
    } else {
      error = true;
    }

    error && messageError({message: 'Missing required arguments'})
    return error;
  }

  const saveNext = async () => {
    try {
      if (data) {
        const invalidData = validateData();
        if (!invalidData) {
          setHasUnsavedChanges(false);
          await saveElection(data);
        }
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

  const formFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Input
          required="You must specify the jurisdiction name."
          data={data}
          onChange={handleDataChange}
          name="electionJurisdictionName"
          label="Enter Jurisdiction Name.*"
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
          label="Enter Election Name.*"
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
          readOnly={viewOnly}
        />
      </Grid>
    </Grid>
  );


  const actions = (
    <Grid container justifyContent="center" spacing={2} alignItems="flex-end">
      <Grid item xs={4} sm={4} md={3}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Grid>
      <Grid item xs={4} sm={4} md={3}>
        <LoadingButton endIcon={<NavigateNextIcon />} onClick={saveNext}>
          {mode == 'create' ? 'Create Election' : 'Save & Continue'}
        </LoadingButton>
      </Grid>
    </Grid>
  );

  
  return (
  <>
    {election && (
        <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
          <Grid item flexGrow={1}>{formFields}</Grid>
          <Grid item>
            {alertText && <Alert severity="error">{alertText}</Alert>}
          </Grid>
          {!viewOnly && <Grid item>{actions}</Grid>}
        </Grid>
      )
    }
  </>
  );
}
