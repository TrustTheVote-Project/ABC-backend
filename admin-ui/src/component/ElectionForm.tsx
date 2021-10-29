import { Button, Grid, Step, StepButton, Stepper, Typography, Switch } from "@mui/material"
import { Election, ElectionConfiguration, Maybe } from "types"

import Input from 'component/Input';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import { ReactNode, useState } from "react";

import { setBallotDefinitionFile, upsertElection, addBallotFile, setVoterFile } from 'requests/election';
import { useRouter } from "next/router";
import InputSwitch from "./InputSwitch";
import FileUpload from "./FileUpload";
import CompletedCheckbox from "./CompletedCheckbox";
import ElectionCard from "./ElectionCard";

interface ElectionFormProps {
  election: Maybe<Election>
  title: string
}

export default function ElectionForm({
  election,
  title
}: ElectionFormProps) {
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<Election>((election || {}) as Election);
  const router = useRouter();

  const steps = [
    "Election Name",
    "Election Settings",
    "Ballot Data",
    "Voter Data",
    "Review"
  ]

  const handleConfigurationChange = (name: string, value: any) => {
    const newData = { ...data } as {[x: string]: any};
    newData.configuration ||= {} as ElectionConfiguration;
    newData.configuration[name] = value;
    setData(newData as Election);
  }

  const handleDataChange = (name: string, value: any) => {
    const newData = { ...data } as {[x: string]: any};
    newData[name] = value;
    setData(newData as Election);
  }

  const save = async () => {
    const updatedElection = await upsertElection(data)
    setData(updatedElection);
    
  }

  const saveExit = async () => {
    await save();
    router.push('/dashboard')
  }

  const saveBack = async () => {
    await save();
    setStep(step - 1)
  }

  const saveNext = async () => {
    await save();
    setStep(step + 1)
  }

  const electionNameFields = <Grid container spacing={4}>
    <Grid item xs={12}>
      <Input data={data} onChange={handleDataChange} name="electionJurisdictionName" label="Enter the Election Jurisdiction Name." placeholder="Enter Jurisdiction Name Here" />    
    </Grid>
    <Grid item xs={12}>
      <Input data={data} onChange={handleDataChange} name="electionName" label="Enter the Election Name." placeholder="Enter Name Here" />        
    </Grid>
    <Grid item xs={12}>
      <Input data={data.configuration} onChange={handleConfigurationChange} name="stateName" label="Enter the State Name." placeholder="Enter Name Here" />        
    </Grid>
    <Grid item xs={12}>
      <Input data={data.configuration} onChange={handleConfigurationChange} name="stateCode" label="Enter the State Abbreviation." placeholder="Enter 2-Letter Abbreviation Here" />        
    </Grid>
  </Grid>

  const electionSettingsFields = <Grid container spacing={4}>
    <Grid item xs={12}>
      <Typography variant="h3">Required Fields</Typography>
    </Grid>
    <Grid item sm={6}>
      <InputSwitch 
        value={!!data.configuration?.absenteeStatusRequired}
        onChange={(value: boolean)=>{
          handleConfigurationChange('absenteeStatusRequired', value)
        }}
      >
        Require Absentee Status
      </InputSwitch>
      <InputSwitch 
        value={!!data.configuration?.affidavitRequiresDLIDcardPhotos}
        onChange={(value: boolean)=>{
          handleConfigurationChange('affidavitRequiresDLIDcardPhotos', value)
        }}
      >
        Affidavit requires ID Photo
      </InputSwitch>
      <InputSwitch 
        value={!!data.configuration?.affidavitOfferSignatureViaPhoto}
        onChange={(value: boolean)=>{
          handleConfigurationChange('affidavitOfferSignatureViaPhoto', value)
        }}
      >
        Offer signature via photo
      </InputSwitch>
      <InputSwitch 
        value={!!data.configuration?.affidavitOfferSignatureViaName}
        onChange={(value: boolean)=>{
          handleConfigurationChange('affidavitOfferSignatureViaName', value)
        }}
      >
        Offer signature via name
      </InputSwitch>
      <InputSwitch 
        value={!!data.configuration?.affidavitRequiresWitnessName}
        onChange={(value: boolean)=>{
          handleConfigurationChange('affidavitRequiresWitnessName', value)
        }}
      >
        Affidavit requires witness name
      </InputSwitch>
      <InputSwitch 
        value={!!data.configuration?.affidavitRequiresWitnessSignature}
        onChange={(value: boolean)=>{
          handleConfigurationChange('affidavitRequiresWitnessSignature', value)
        }}
      >
        Afidavit requires witness signature
      </InputSwitch>

      <InputSwitch 
        value={!!data.configuration?.DLNalpha}
        onChange={(value: boolean)=>{
          handleConfigurationChange('DLNalpha', value)
        }}
      >
        DLN contains alpha characters
      </InputSwitch>
      <InputSwitch 
        value={!!data.configuration?.DLNnumeric}
        onChange={(value: boolean)=>{
          handleConfigurationChange('DLNnumeric', value)
        }}
      >
        DLN contains numeral characters
      </InputSwitch>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="DLNminLength" label="DLN Min Length" />
        </Grid>
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="DLNmaxLength" label="DLN Max Length" />
        </Grid>
      </Grid>
    </Grid>  
    <Grid item sm={6}>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <InputSwitch 
            value={!!data.configuration?.multipleUsePermitted}
            onChange={(value: boolean)=>{
              handleConfigurationChange('affidavitRequiresWitnessSignature', value)
            }}
          >
            Multiple Use Permitted
          </InputSwitch>
          <Input multiline minRows={2} data={data.configuration} onChange={handleConfigurationChange} name="multipleUseNotification" label="Multiple use notice text" placeholder="Enter notification text here" />
        </Grid>
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="linkAbsenteeRequests" label="Absentee Requests URL" />
        </Grid>
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="linkVoterReg" label="Voter Registration URL" />
        </Grid>
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="linkBallotReturn" label="Ballot Return URL" />
        </Grid>
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="linkMoreInfo1" label="More Info Link 1" />
        </Grid>
        <Grid item>
          <Input data={data.configuration} onChange={handleConfigurationChange} name="linkMoreInfo2" label="More Info Link 2" />
        </Grid>
      </Grid>
      
    </Grid>
  </Grid>

  const ballotDataFields = <Grid container spacing={4}>
    <Grid item sm={6}>
      <Typography variant="h3">Upload Ballot Definitions File</Typography>
      <FileUpload onLoadFile={async (file)=>{
        if (data?.id) {
          const resp = await setBallotDefinitionFile(data.id, (file as string))
          setData(resp);
          return;
        }
      }} />
    </Grid>
    <Grid item sm={6}>
      <Typography variant="h3">Upload Ballot Files</Typography>
      <FileUpload multiple onLoadFile={async (file)=>{
        if (data?.id) {
          const resp = await addBallotFile(data.id, (file as string))
          setData(resp);
          return;
        }
      }} />
    </Grid>
    <Grid item>
      <Typography variant="h3">Ballot checklist</Typography>
      <CompletedCheckbox isComplete={data?.ballotDefinitionCount > 0}>
        {data?.ballotDefinitionCount || 0} ballot definitions uploaded
      </CompletedCheckbox>
      <CompletedCheckbox isComplete={data?.ballotCount > 0}>
        {data?.ballotCount || 0} ballot files uploaded
      </CompletedCheckbox>
    </Grid>
  </Grid>

  const voterDataFields = <Grid container spacing={4}>
    <Grid item sm={6}>
      <Typography variant="h3">Upload Voter File</Typography>
      <FileUpload onLoadFile={async (file)=>{
        if (data?.id) {
          const resp = await setVoterFile(data.id, (file as string))
          setData(resp);
          return;
        }
      }} />
    </Grid>
    <Grid item sm={6}>
      <Typography variant="h3">Voter upload checklist</Typography>
      <CompletedCheckbox isComplete={data?.voterCount > 0}>
        {data?.voterCount || 0} voters uploaded
      </CompletedCheckbox>
    </Grid>
  </Grid>

  const reviewFields = <Grid container spacing={4}>
    <Grid item xs={12}>
      <Typography variant="h3">Review Your Election.</Typography>
    </Grid>
    <Grid item xs={12}>
      <ElectionCard election={data} />
    </Grid>
  </Grid>

  let formContents: ReactNode = null;
  if (step === 0) {
    formContents = electionNameFields
  } else if (step === 1) {
    formContents = electionSettingsFields
  } else if (step === 2) {
    formContents = ballotDataFields
  } else if (step === 3) {
    formContents = voterDataFields
  } else if (step === 4) {
    formContents = reviewFields
  } 

  const actions = <Grid container justifyContent="space-between" spacing={2}>
    <Grid item xs={6} sm={4} md={3}>
      {step > 0 && <Button startIcon={<NavigateBeforeIcon / >}  onClick={saveBack}>Prev</Button>}
    </Grid>
    <Grid item xs={6} sm={4} md={3}>
      { step < steps.length - 1 && <Button endIcon={<NavigateNextIcon / >} onClick={saveNext}>Next</Button>}
      { step === steps.length - 1 && <Button endIcon={<CheckIcon / >} onClick={()=>{
        router.push(`/elections/${data.id}/open`)
      }}>Open Election</Button>}
    </Grid>
  </Grid>


  const stepper= <Stepper nonLinear activeStep={step}>
    {steps.map((label, index) => (
      <Step key={label} completed={step > index}>
        <StepButton color="inherit" onClick={()=>setStep(index)}>
          {label}
        </StepButton>
      </Step>
    ))}
  </Stepper>

  return <Grid container direction="column" spacing={4} sx={{minHeight: "100%"}}>
    <Grid item><Typography variant="h1">{title}</Typography></Grid>
    <Grid item flexGrow={1}>{formContents}</Grid>
    <Grid item>{actions}</Grid>
    <Grid item>{stepper}</Grid>
  </Grid>
}