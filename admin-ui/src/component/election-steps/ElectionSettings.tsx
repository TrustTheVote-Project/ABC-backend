import {
  Grid,
  Typography,
  InputLabel,
  Alert,
  Button,
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import {
  Election,
  ElectionConfiguration,
  ElectionCreate,
  Maybe,
} from "types";


import Input from "component/Input";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CheckIcon from "@mui/icons-material/Check";
import {
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

import GC from "component/GC";
import GI from "component/GI";
import InputEnumSelect from "component/InputEnumSelect";
import InputSwitch from "component/InputSwitch";
import LoadingButton from "component/LoadingButton";
import Loading from "component/Loading";
import useElection from "hooks/useElection";

interface ElectionSettingsProps {
  electionId: string;
  title: string;
  viewOnly?: boolean;
}

export default function ElectionSettings({
  electionId,
  title,
  viewOnly = false
}: ElectionSettingsProps) {
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
  

  const save = async () => {
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

  const saveBack = async () => {
    try {
      // await save();
      router.push(
        `/elections/${(data as Election)?.electionId}/edit`
      );
    } catch (e) {
      messageError(e);
    }
  };

  const saveNext = async () => {
    try {
      await save();
    } catch (e) {
      messageError(e);
    }
  };

  const handleCancel = () => {
    setData(election);
  };

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
          <GI>
            <Input
              multiline
              minRows={1}
              data={data?.configurations}
              onChange={handleConfigurationChange}
              name="DLNexample"
              label="DLN Example"
              placeholder="Enter example DLN here"
            />
          </GI>
        </GC>
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
          <Grid item flexGrow={1}>{electionSettingsFields}</Grid>
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
