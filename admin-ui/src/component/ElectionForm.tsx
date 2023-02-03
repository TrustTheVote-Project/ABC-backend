import {
  Button,
  Grid,
  Step,
  StepButton,
  Stepper,
  Typography,
  Switch,
  InputLabel,
  Alert,
} from "@mui/material";
import {
  Election,
  ElectionConfiguration,
  ElectionCreate,
  ElectionStatus,
  Maybe,
} from "types";

import ConstructionIcon from "@mui/icons-material/Construction";

import Input from "component/Input";
import DatePicker from "component/DatePicker";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CheckIcon from "@mui/icons-material/Check";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import {
  setTestVoterFile,
  setElectionAttributes,
  createElection,
  getElection,
  setElectionConfigurations,
  setElectionDefinition,
  setElectionVoters,
  setElectionBallots,
  getFileStatus,
  getCurrentElection,
  setElectionTestComplete,
} from "requests/election";
import { useRouter } from "next/router";
import InputSwitch from "./InputSwitch";
import FileUpload from "./FileUpload";
import CompletedCheckbox from "./CompletedCheckbox";
import ElectionCard from "./ElectionCard";
import GC from "./GC";
import GI from "./GI";
import { Box } from "@mui/system";
import Loading from "./Loading";
import { dateToYMD, formatTimeStamp } from "dsl/date";
import InputEnumSelect from "./InputEnumSelect";

interface ElectionFormProps {
  election: Maybe<Election>;
  onUpdateElection(election: Election): void;
  title: string;
  data: Maybe<Election | ElectionCreate>;
  setData: Dispatch<SetStateAction<Maybe<ElectionCreate | Election>>>;
}

export default function ElectionForm({
  election,
  onUpdateElection,
  title,
  data,
  setData,
}: ElectionFormProps) {
  const [step, setStepData] = useState<number>(0);
  //const [data, setData] = useState<Maybe<Election | ElectionCreate>>(election);
  const [alertText, setAlertText] = useState<string>("");

  const setStep = (step: number): void => {
    setStepData(step);
    reloadElection();
  };
  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  //CTW: This returns a promise.  Really need the election to be loaded before
  const currentElection = getCurrentElection();

  const [edfUid, setEDFUid] = useState<string>(
    election?.electionDefinitionFile || ""
  );
  const [edfStatus, setEDFStatus] = useState<{ [x: string]: any }>(
    election?.electionDefinitionFile ? { status: "started" } : {}
  );

  const [ballotsUid, setBallotsUid] = useState<string>(
    election?.ballotsFile || ""
  );
  const [ballotsStatus, setBallotsStatus] = useState<{ [x: string]: any }>(
    election?.ballotsFile ? { status: "started" } : {}
  );

  const [voterFileUid, setVoterFileUid] = useState<string>(
    election?.votersFile || ""
  );
  const [voterFileStatus, setVoterFileStatus] = useState<{ [x: string]: any }>(
    election?.votersFile ? { status: "started" } : {}
  );

  const [testVoterFileStatus, setTestVoterFileStatus] = useState<{
    [x: string]: any;
  }>(election?.testVotersFile ? { status: "started" } : {});

  const router = useRouter();

  const steps = [
    "Election Name",
    "Election Settings",
    "Upload EDF",
    "Upload Ballots",
    "Test Election",
    "Production Voter Data",
    "Review",
  ];

  const getEDFStatus = async () => {
    if (edfUid) {
      const resp = await getFileStatus(edfUid);
      if (resp.status === "complete") {
        reloadElection();
      }
      setEDFStatus(resp);
    }
  };

  const getBallotsStatus = async () => {
    if (ballotsUid) {
      const resp = await getFileStatus(ballotsUid);
      if (resp.status === "complete") {
        reloadElection();
      }
      setBallotsStatus(resp);
    }
  };

  const getVoterFileStatus = async () => {
    if (voterFileUid) {
      const resp = await getFileStatus(voterFileUid);
      if (resp.status === "complete") {
        reloadElection();
      }
      setVoterFileStatus(resp);
    }
  };

  useEffect(() => {
    if (edfUid) {
      getEDFStatus();
    }
  }, [edfUid]);

  useEffect(() => {
    if (ballotsUid) {
      getBallotsStatus();
    }
  }, [ballotsUid]);

  useEffect(() => {
    if (voterFileUid) {
      getVoterFileStatus();
    }
  }, [voterFileUid]);

  const handleConfigurationChange = (name: string, value: any) => {
    const newData = { ...(data || {}) } as { [x: string]: any };
    newData.configurations ||= {} as ElectionConfiguration;
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

  const reloadElection = async () => {
    if (election?.electionId) {
      const updatedElection = await getElection(election?.electionId);
      setData(updatedElection);
    }
  };

  const save = async () => {
    try {
      let updatedElection: Maybe<Election> = null;
      if ((data as Election)?.electionId) {
        updatedElection = await setElectionAttributes(data as Election);
      } else {
        updatedElection = await createElection(data as ElectionCreate);
      }
      if ((data as Election)?.configurations) {
        updatedElection = await setElectionConfigurations(
          updatedElection.electionId,
          (data as Election).configurations
        );
      }
      setData(updatedElection);
      onUpdateElection(updatedElection);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const messageError = (e: any) => {
    setAlert(
      e?.data?.error_description ||
        e?.data?.message ||
        e?.message ||
        JSON.stringify(e)
    );
  };
  const saveExit = async () => {
    try {
      await save();
      router.push("/dashboard");
    } catch (e) {
      messageError(e);
    }
  };

  const saveBack = async () => {
    try {
      await save();
      setStep(step - 1);
    } catch (e) {
      messageError(e);
    }
  };

  const saveNext = async () => {
    try {
      await save();
      setStep(step + 1);
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
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          data={data?.configurations}
          onChange={handleConfigurationChange}
          name="stateName"
          label="Enter State Name."
          placeholder="State"
        />
      </Grid>
      <Grid item xs={12}>
        <Input
          data={data?.configurations}
          onChange={handleConfigurationChange}
          name="stateCode"
          label="Enter State Abbreviation."
          placeholder="2-Letter State Abbreviation"
        />
      </Grid>
      <Grid item xs={12}>
        <DatePicker
          data={data}
          onChange={handleDataChange}
          name="electionDate"
          label="Enter Election Date"
          placeholder="E.g. 11/1/2022"
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

  const electionSettingsFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h3">Required Fields</Typography>
      </Grid>
      <Grid item sm={12}>
        <GC direction="column" spacing={1}>
          <GI>
            <InputSwitch
              value={data?.configurations?.absenteeStatusRequired}
              onChange={(value: boolean | null) => {
                handleConfigurationChange("absenteeStatusRequired", value);
              }}
            >
              Require Absentee Status
            </InputSwitch>
          </GI>
          <GI>
            <InputSwitch
              value={data?.configurations?.affidavitRequiresDLIDcardPhotos}
              onChange={(value: boolean | null) => {
                handleConfigurationChange(
                  "affidavitRequiresDLIDcardPhotos",
                  value
                );
              }}
            >
              Affidavit requires ID Photo
            </InputSwitch>
          </GI>
          <GI>
            <InputSwitch
              value={data?.configurations?.affidavitOfferSignatureViaPhoto}
              onChange={(value: boolean | null) => {
                handleConfigurationChange(
                  "affidavitOfferSignatureViaPhoto",
                  value
                );
              }}
            >
              Offer signature via photo
            </InputSwitch>
          </GI>
          <GI>
            <InputSwitch
              value={data?.configurations?.affidavitOfferSignatureViaName}
              onChange={(value: boolean | null) => {
                handleConfigurationChange(
                  "affidavitOfferSignatureViaName",
                  value
                );
              }}
            >
              Offer signature via name
            </InputSwitch>
          </GI>
          <GI>
            <InputEnumSelect
              value={data?.configurations?.affidavitWitnessRequirement}
              onChange={(value: string) => {
                handleConfigurationChange("affidavitWitnessRequirement", value);
              }}
              options={[
                { value: "none", name: "None" },
                { value: "name", name: "Name" },
                { value: "nameSignature", name: "Name and Signature" },
                { value: "nameAddress", name: "Name and Address" },
                {
                  value: "nameSignatureAddress",
                  name: "Name Signature and Address",
                },
              ]}
            >
              Affidavit witness requirement
            </InputEnumSelect>
          </GI>

          {/*<GI>
            <InputSwitch
              value={data?.configurations?.affidavitRequiresWitnessName}
              onChange={(value: boolean | null) => {
                handleConfigurationChange(
                  "affidavitRequiresWitnessName",
                  value
                );
              }}
            >
              Affidavit requires witness name
            </InputSwitch>
          </GI>
          <GI>
            <InputSwitch
              value={data?.configurations?.affidavitRequiresWitnessSignature}
              onChange={(value: boolean | null) => {
                handleConfigurationChange(
                  "affidavitRequiresWitnessSignature",
                  value
                );
              }}
            >
              Affidavit requires witness signature
            </InputSwitch>
          </GI>
            */}
          <Grid item>
            <InputSwitch
              value={data?.configurations?.multipleUsePermitted}
              onChange={(value: boolean | null) => {
                handleConfigurationChange("multipleUsePermitted", value);
              }}
            >
              Multiple Use Permitted
            </InputSwitch>
            <Input
              multiline
              minRows={2}
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="multipleUseNotification"
              label="Multiple use notice text"
              placeholder="Enter notification text here"
            />
          </Grid>
          <GI>
            <InputSwitch
              value={data?.configurations?.DLNalpha}
              onChange={(value: boolean | null) => {
                handleConfigurationChange("DLNalpha", value);
              }}
            >
              DLN contains alpha characters
            </InputSwitch>
          </GI>
          <GI>
            <InputSwitch
              value={data?.configurations?.DLNnumeric}
              onChange={(value: boolean | null) => {
                handleConfigurationChange("DLNnumeric", value);
              }}
            >
              DLN contains numeral characters
            </InputSwitch>
          </GI>
          <GI>
            <InputLabel shrink>Drivers License Character Length</InputLabel>
            <Grid container spacing={2}>
              <Grid item xs>
                <Input
                  data={data?.configurations}
                  onChange={handleConfigurationChange}
                  name="DLNminLength"
                  placeholder="Min"
                />
              </Grid>
              <Grid item xs>
                <Input
                  data={data?.configurations}
                  onChange={handleConfigurationChange}
                  name="DLNmaxLength"
                  placeholder="Max"
                />
              </Grid>
            </Grid>
          </GI>
        </GC>
      </Grid>
      {/*<Grid item sm={6}>
        <Grid container spacing={2} direction="column">
         
          <Grid item>
            <Input
              data={data}
              onChange={handleDataChange}
              name="electionDefinitionURL"
              label="Election Definitions File Hostname"
            />
          </Grid>
            */}
      {/*
          <Grid item>
            <Input
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="linkAbsenteeRequests"
              label="Absentee Requests URL"
            />
          </Grid>
          <Grid item>
            <Input
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="linkVoterReg"
              label="Voter Registration URL"
            />
          </Grid>
          <Grid item>
            <Input
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="linkBallotReturn"
              label="Ballot Return URL"
            />
          </Grid>
          <Grid item>
            <Input
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="linkMoreInfo1"
              label="More Info Link 1"
            />
          </Grid>
          <Grid item>
            <Input
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="linkMoreInfo2"
              label="More Info Link 2"
            />
          </Grid>
          
        </Grid>
      </Grid>*/}
    </Grid>
  );

  const edfDataFields = (
    <Grid container spacing={4}>
      <Grid item sm={6}>
        <Typography variant="h3">Upload Election Definition File</Typography>
        <FileUpload
          key="edf-upload"
          disabled={!election || election?.edfSet}
          disabledMessage="EDF upload disabled:Election Definition File already set"
          instructions="Upload a new Election Definition File in JSON format."
          onLoadFile={async (file) => {
            if ((data as Election)?.electionId) {
              setEDFStatus({ status: "uploading" });
              const resp = await setElectionDefinition(
                (data as Election).electionId,
                file
              );
              setEDFUid(resp.objectKey);
              reloadElection();
              return;
            }
          }}
        />
        <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
          {edfStatus.status === "error" && (
            <Box sx={{ color: "error.main" }}>
              Error Processing File: {edfStatus.message}
            </Box>
          )}
          {edfStatus.status === "uploading" && (
            <Box sx={{ textAlign: "center" }}>
              <Loading />
            </Box>
          )}
          {edfStatus.status === "started" && (
            <Box>
              EDF File Processing <Loading />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid sm={6}></Grid>

      <Grid item>
        <Typography variant="h3">Ballot checklist</Typography>
        <Grid container spacing={2}>
          {edfStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>EDF File Uploaded</span>
            </Grid>
          )}
        </Grid>

        <CompletedCheckbox
          isComplete={(data as Election)?.ballotDefinitionCount > 0}
        >
          {(data as Election)?.ballotDefinitionCount || 0} ballot definitions
          uploaded
        </CompletedCheckbox>
      </Grid>
    </Grid>
  );

  const ballotDataFields = (
    <Grid container spacing={4}>
      <Grid item sm={6}>
        <Typography variant="h3">Upload Ballot Files</Typography>
        <FileUpload
          key="ballot-upload"
          disabled={!election || !election?.edfSet || election?.ballotsSet}
          disabledMessage={
            !election?.edfSet
              ? "Ballot upload disabled:EDF not yet set"
              : election?.ballotsSet
              ? "Ballot upload disabled:Ballots already set"
              : "No election for upload"
          }
          instructions="Upload a zip file containing ballot PDFs."
          onLoadFile={async (file) => {
            try {
              if ((data as Election)?.electionId) {
                setBallotsStatus({ status: "uploading" });
                const resp = await setElectionBallots(
                  (data as Election).electionId,
                  file
                );
                setBallotsUid(resp.objectKey);
                reloadElection();
              }
              return;
            } catch (e: any) {
              setBallotsStatus({
                status: "error",
                message: e?.data?.error_description,
              });
              onUpdateElection(data as Election);
              console.log(e);
            }
          }}
        />
        <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
          {ballotsStatus.status === "error" && (
            <Box sx={{ color: "error.main" }}>
              Error Processing File: {ballotsStatus.message}
            </Box>
          )}
          {ballotsStatus.status === "uploading" && (
            <Box sx={{ textAlign: "center" }}>
              <Loading />
            </Box>
          )}
          {ballotsStatus.status === "started" && (
            <Box>
              Ballot File Processing <Loading />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid sm={6}></Grid>
      <Grid item>
        <Typography variant="h3">Ballot checklist</Typography>
        <Grid container spacing={2}>
          {ballotsStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>Ballots Uploaded</span>
            </Grid>
          )}
        </Grid>

        <CompletedCheckbox
          isComplete={(data as Election)?.ballotDefinitionCount > 0}
        >
          {(data as Election)?.ballotDefinitionCount || 0} ballot definitions
          uploaded
        </CompletedCheckbox>
        <CompletedCheckbox isComplete={(data as Election)?.ballotCount > 0}>
          {(data as Election)?.ballotCount || 0} ballot files uploaded
        </CompletedCheckbox>
      </Grid>
    </Grid>
  );

  const voterDataFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h2">Production Voter Data</Typography>
      </Grid>

      <Grid item sm={6}>
        <Typography variant="h3">Production Voter List</Typography>
        <FileUpload
          key="prod-voter-upload"
          disabled={!election || !election?.testComplete}
          disabledMessage={
            !election?.testComplete
              ? "Production voter upload disabled:Testing not yet marked as complete"
              : "No election"
          }
          instructions="Upload a CSV file containing production voter data."
          onLoadFile={async (file) => {
            try {
              if ((data as Election)?.electionId) {
                setVoterFileStatus({ status: "uploading" });
                const resp = await setElectionVoters(
                  (data as Election).electionId,
                  file
                );
                setVoterFileUid(resp.objectKey);
                reloadElection();
              }
              return;
            } catch (e: any) {
              setVoterFileStatus({
                status: "error",
                message: e?.data?.error_description,
              });
              onUpdateElection(data as Election);
              console.log(e);
            }
          }}
        />
        <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
          {voterFileStatus.status === "error" && (
            <Box sx={{ color: "error.main" }}>
              Error Processing File: {voterFileStatus.message}
            </Box>
          )}
          {voterFileStatus.status === "uploading" && (
            <Box sx={{ textAlign: "center" }}>
              <Loading />
            </Box>
          )}
          {voterFileStatus.status === "started" && (
            <Box>
              Voter File Processing <Loading />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item sm={6}>
        {/* <Typography variant="h3">Production Voter List Upload History</Typography>
      <GC justifyContent="space-between">
        <GI><Typography variant="subtitle2">Date</Typography></GI>
        <GI>Action</GI>
      </GC> */}
      </Grid>
      <Grid item sm={6}>
        <Typography variant="h3">
          Production Voter List Upload Checklist
        </Typography>
        <Grid container spacing={2}>
          {voterFileStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>Voter File Uploaded</span>
            </Grid>
          )}
        </Grid>
        <CompletedCheckbox isComplete={(data as Election)?.voterCount > 0}>
          {(data as Election)?.voterCount || 0} voters uploaded
        </CompletedCheckbox>
      </Grid>
    </Grid>
  );

  const reviewFields = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h3">Review Your Election.</Typography>
      </Grid>
      <Grid item xs={12}>
        <ElectionCard election={data as Election} />
      </Grid>
    </Grid>
  );

  const testElectionFields = (
    <Grid container spacing={4}>
      <GI xs={12}>
        <Typography variant="h2">Test Your Election</Typography>
      </GI>
      <Grid item sm={6}>
        <Typography variant="h3">Upload Test Voter List</Typography>
        <FileUpload
          key="test-voter-upload"
          disabled={
            !election || !election?.ballotsSet || election?.testComplete
          }
          disabledMessage={
            election?.testComplete
              ? "Test voter upload disabled: Testing for this election has been finalized"
              : "Test voter upload disabled:You must upload a ballot file before uploading a test voter file."
          }
          instructions="Upload a CSV file following the voter file specification."
          onLoadFile={async (file) => {
            try {
              if ((data as Election)?.electionId) {
                setTestVoterFileStatus({ status: "uploading" });
                const resp = await setTestVoterFile(
                  (data as Election).electionId,
                  file
                );
                setTestVoterFileStatus({ status: "done" });
                setTestVoterFileUid(resp.objectKey);
                reloadElection();
              }
              return;
            } catch (e: any) {
              setTestVoterFileStatus({
                status: "error",
                message: JSON.stringify(e?.data?.error_description),
              });
              onUpdateElection(data as Election);
              console.log(e);
            }
          }}
        />
        <Box sx={{ backgroundColor: "background.paper", padding: 2 }}>
          {testVoterFileStatus.status === "error" && (
            <Box sx={{ color: "error.main" }}>
              Error Processing File: {testVoterFileStatus.message}
            </Box>
          )}
          {testVoterFileStatus.status === "uploading" && (
            <Box sx={{ textAlign: "center" }}>
              <Loading />
            </Box>
          )}
          {testVoterFileStatus.status === "started" && (
            <Box>
              Voter File Processing <Loading />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item sm={6}></Grid>
      <Grid item sm={6}>
        <Typography variant="h3">Test Data Upload Checklist</Typography>
        <Grid container spacing={2}>
          {testVoterFileStatus.status === "complete" && (
            <Grid item alignItems="center">
              <CheckIcon color="success" /> <span>Voter File Uploaded</span>
            </Grid>
          )}
        </Grid>
        <CompletedCheckbox isComplete={(data as Election)?.testVoterCount > 0}>
          {(data as Election)?.testVoterCount || 0} test voters uploaded
        </CompletedCheckbox>
      </Grid>
    </Grid>
  );

  let formContents: ReactNode = null;
  if (step === 0) {
    formContents = electionNameFields;
  } else if (step === 1) {
    formContents = electionSettingsFields;
  } else if (step === 2) {
    formContents = edfDataFields;
  } else if (step === 3) {
    formContents = ballotDataFields;
  } else if (step === 4) {
    formContents = testElectionFields;
  } else if (step === 5) {
    formContents = voterDataFields;
  } else if (step === 6) {
    formContents = reviewFields;
  }

  const actions = (
    <Grid container justifyContent="space-between" spacing={2}>
      <Grid item xs={4} sm={4} md={3}>
        {step > 0 && (
          <Button startIcon={<NavigateBeforeIcon />} onClick={saveBack}>
            Prev
          </Button>
        )}
      </Grid>
      <Grid item xs={4} sm={4} md={3}>
        {step < steps.length - 1 && step !== 5 && (
          <Button endIcon={<NavigateNextIcon />} onClick={saveNext}>
            Next
          </Button>
        )}
      </Grid>
      {step === 4 &&
        election &&
        election?.electionStatus == ElectionStatus.inactive &&
        election?.testVotersSet &&
        !election?.testComplete && (
          <Grid>
            <Button
              endIcon={<ConstructionIcon />}
              onClick={() => {
                router.push(
                  `/elections/${(data as Election).electionId}/open-test`
                );
              }}
            >
              {(election?.testCount ?? 0) >= 1 ? "Continue" : "Begin"} Testing
            </Button>
          </Grid>
        )}
      <Grid>
        {step === 4 &&
          election &&
          (election?.testCount ?? 0) >= 1 &&
          !election?.testComplete && (
            <Button
              //endIcon={<ConstructionIcon />}
              onClick={() => {
                setElectionTestComplete((data as Election).electionId);
                router.push("/dashboard");
              }}
            >
              Finalize Testing
            </Button>
          )}
        {step === steps.length - 1 && (
          <Button
            endIcon={<CheckIcon />}
            disabled={!election?.votersSet || !election?.testComplete}
            onClick={() => {
              router.push(
                `/elections/${(data as Election).electionId}/open-live`
              );
            }}
          >
            Open Election
          </Button>
        )}
      </Grid>
    </Grid>
  );

  const stepper = (
    <Stepper nonLinear activeStep={step}>
      {steps.map((label, index) => (
        <Step key={label} completed={step > index}>
          <StepButton color="inherit" onClick={() => setStep(index)}>
            {label}
          </StepButton>
        </Step>
      ))}
    </Stepper>
  );

  return (
    <Grid container direction="column" spacing={4} sx={{ minHeight: "100%" }}>
      <Grid item>
        <Typography variant="h1">{title}</Typography>
      </Grid>
      <Grid item flexGrow={1}>
        {formContents}
      </Grid>
      <Grid item>
        {" "}
        {alertText && <Alert severity="error">{alertText}</Alert>}
      </Grid>
      <Grid item>{actions}</Grid>
      <Grid item>{stepper}</Grid>
    </Grid>
  );
}
