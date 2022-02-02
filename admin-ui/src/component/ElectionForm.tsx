import { Button, Grid, Step, StepButton, Stepper, Typography, Switch, InputLabel } from "@mui/material"
import { Election, ElectionConfiguration, ElectionStatus, Maybe } from "types"

import ConstructionIcon from '@mui/icons-material/Construction';

import Input from 'component/Input';
import DatePicker from 'component/DatePicker';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import { ReactNode, useState } from "react";

import { setBallotDefinitionFile, upsertElection, addBallotFile, setVoterFile, setConfiguration, setTestVoterFile } from 'requests/election';
import { useRouter } from "next/router";
import InputSwitch from "./InputSwitch";
import FileUpload from "./FileUpload";
import CompletedCheckbox from "./CompletedCheckbox";
import ElectionCard from "./ElectionCard";
import GC from "./GC";
import GI from "./GI";

interface ElectionFormProps {
  election: Maybe<Election>
  onUpdateElection(election: Election): void
  title: string
}

export default function ElectionForm({
  election,
  onUpdateElection,
  title
}: ElectionFormProps) {
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<Election>((election || {electionStatus: ElectionStatus.pending}) as Election);
  const router = useRouter();

  const steps = [
    "Election Name",
    "Election Settings",
    "Ballot Data",
    "Test Election",
    "Production Voter Data",
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
    const updatedElection = await upsertElection(data);
    if (data.configuration) {
      const updatedConfiguration = await setConfiguration(
        updatedElection.electionId, 
        data.configuration
      );
      updatedElection.configuration = updatedConfiguration;
    }
    setData(updatedElection);
    onUpdateElection(updatedElection);
  }

  console.log(data);
    
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
      <Input required="You must specify the jurisdiction name." data={data} onChange={handleDataChange} name="electionJurisdictionName" label="Enter Jurisdiction Name." placeholder="Jurisdiction Name Here" />    
    </Grid>
    <Grid item xs={12}>
      <Input required="You must specify the election name." data={data} onChange={handleDataChange} name="electionName" label="Enter Election Name." placeholder="Election Name" />        
    </Grid>
    <Grid item xs={12}>
      <Input data={data.configuration} onChange={handleConfigurationChange} name="stateName" label="Enter State Name." placeholder="State" />        
    </Grid>
    <Grid item xs={12}>
      <Input data={data.configuration} onChange={handleConfigurationChange} name="stateCode" label="Enter State Abbreviation." placeholder="2-Letter State Abbreviation" />        
    </Grid>
    <Grid item xs={12}>
      <DatePicker data={data} onChange={handleDataChange} name="electionDate" label="Enter Election Date" placeholder="E.g. 11/1/2022" />        
    </Grid>
    <Grid item xs={12}>
      <DatePicker data={data} name="digitalAbsenteeVotingOpenDate" label="Digital Absentee Voting Opening Date*" placeholder="E.g. 10/1/2022" />        
    </Grid>
  </Grid>

  const electionSettingsFields = <Grid container spacing={4}>
    <Grid item xs={12}>
      <Typography variant="h3">Required Fields</Typography>
    </Grid>
    <Grid item sm={6}>
      <GC direction="column" spacing={1}>
        <GI>
          <InputSwitch 
          value={data.configuration?.absenteeStatusRequired}
          onChange={(value:  boolean | null)=>{
            handleConfigurationChange('absenteeStatusRequired', value)
          }}
          >
            Require Absentee Status
          </InputSwitch>
        </GI>
        <GI>
          <InputSwitch 
          value={data.configuration?.affidavitRequiresDLIDcardPhotos}
          onChange={(value: boolean | null)=>{
            handleConfigurationChange('affidavitRequiresDLIDcardPhotos', value)
          }}
        >
          Affidavit requires ID Photo
        </InputSwitch>
        </GI>
        <GI>
          <InputSwitch 
            value={data.configuration?.affidavitOfferSignatureViaPhoto}
            onChange={(value:  boolean | null)=>{
              handleConfigurationChange('affidavitOfferSignatureViaPhoto', value)
            }}
          >
            Offer signature via photo
          </InputSwitch>
        </GI>
        <GI>        
          <InputSwitch 
            value={data.configuration?.affidavitOfferSignatureViaName}
            onChange={(value:  boolean | null)=>{
              handleConfigurationChange('affidavitOfferSignatureViaName', value)
            }}
          >
            Offer signature via name
          </InputSwitch>
        </GI>
        <GI>        
          <InputSwitch 
            value={data.configuration?.affidavitRequiresWitnessName}
            onChange={(value:  boolean | null)=>{
              handleConfigurationChange('affidavitRequiresWitnessName', value)
            }}
          >
            Affidavit requires witness name
          </InputSwitch>
        </GI>
        <GI>        
          <InputSwitch 
            value={data.configuration?.affidavitRequiresWitnessSignature}
            onChange={(value:  boolean | null)=>{
              handleConfigurationChange('affidavitRequiresWitnessSignature', value)
            }}
          >
            Afidavit requires witness signature
          </InputSwitch>
        </GI>
        <Grid item>
          <InputSwitch 
            value={data.configuration?.multipleUsePermitted}
            onChange={(value: boolean | null)=>{
              handleConfigurationChange('affidavitRequiresWitnessSignature', value)
            }}
          >
            Multiple Use Permitted
          </InputSwitch>
          <Input multiline minRows={2} data={data.configuration} onChange={handleConfigurationChange} name="multipleUseNotification" label="Multiple use notice text" placeholder="Enter notification text here" />
        </Grid>
        <GI>
          <InputSwitch 
            value={data.configuration?.DLNalpha}
            onChange={(value:  boolean | null)=>{
              handleConfigurationChange('DLNalpha', value)
            }}
          >
            DLN contains alpha characters
          </InputSwitch>
        </GI>
        <GI>        
          <InputSwitch 
            value={data.configuration?.DLNnumeric}
            onChange={(value:  boolean | null)=>{
              handleConfigurationChange('DLNnumeric', value)
            }}
          >
            DLN contains numeral characters
          </InputSwitch>
        </GI>
        <GI>        
          <InputLabel shrink >Drivers License Character Length</InputLabel>    
          <Grid container spacing={2} >
            <Grid item xs>
              <Input data={data.configuration} onChange={handleConfigurationChange} name="DLNminLength" placeholder="Min"  />
            </Grid>
            <Grid item xs>
              <Input data={data.configuration} onChange={handleConfigurationChange} name="DLNmaxLength" placeholder="Max" />
            </Grid>
          </Grid>
        </GI>
      </GC>    
    </Grid>  
    <Grid item sm={6}>
      <Grid container spacing={2} direction="column">
        
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
      <Typography variant="h3">Upload Election Definition File</Typography>
      <FileUpload onLoadFile={async (file)=>{
        if (data?.electionId) {
          const resp = await setBallotDefinitionFile(data.electionId, (file))
          setData(resp);
          return;
        }
      }} />
    </Grid>
    <Grid item sm={6}>
      <Typography variant="h3">Upload Ballot Files</Typography>
      <FileUpload onLoadFile={async (file)=>{
        if (data?.electionId) {
          const resp = await addBallotFile(data.electionId, (file))
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
    <Grid item xs={12}>
      <Typography variant="h2">Production Voter Data</Typography>
    </Grid>

    <Grid item sm={6}>
      <Typography variant="h3">Production Voter List</Typography>
      <FileUpload onLoadFile={async (file)=>{
        if (data?.electionId) {
          const resp = await setVoterFile(data.electionId, (file))
          setData(resp);
          return;
        }
      }} />
    </Grid>
    <Grid item sm={6}>
      <Typography variant="h3">Production Voter List Upload History</Typography>
      <GC justifyContent="space-between">
        <GI><Typography variant="subtitle2">Date</Typography></GI>
        <GI>Action</GI>
      </GC>
    </Grid>
    <Grid item sm={6}>
      <Typography variant="h3">Production Voter List Upload Checklist</Typography>
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

  
  const testElectionFields = <Grid container spacing={4} >
    <GI xs={12}><Typography variant="h2">Test Your Election</Typography></GI>
    <Grid item sm={6}>
      <Typography variant="h3">Upload Test Voter List</Typography>
      <FileUpload onLoadFile={async (file)=>{
        if (data?.electionId) {
          const resp = await setTestVoterFile(data.electionId, (file))
          setData(resp);
          return;
        }
      }} />
    </Grid>
    <Grid item sm={6}>
    </Grid>
    <Grid item sm={6}>
      <Typography variant="h3">Test Data Upload Checklist</Typography>
      <CompletedCheckbox isComplete={data?.testVoterCount > 0}>
        {data?.testVoterCount || 0} voters uploaded
      </CompletedCheckbox>
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
    formContents = testElectionFields
  } else if (step === 4) {
    formContents = voterDataFields
  } else if (step === 5) {
    formContents = reviewFields
  } 

  const actions = <Grid container justifyContent="space-between" spacing={2}>
    <Grid item xs={6} sm={4} md={3}>
      {step > 0 && <Button startIcon={<NavigateBeforeIcon / >}  onClick={saveBack}>Prev</Button>}
    </Grid>
    <Grid item xs={6} sm={4} md={3}>
      { step < steps.length - 1 && step !== 3 && <Button endIcon={<NavigateNextIcon / >} onClick={saveNext}>Next</Button>}
      { step === 3 && <Button endIcon={<ConstructionIcon />} onClick={()=>{
        router.push(`/elections/${data.electionId}/open-test`)
      }}>Begin Testing</Button>}
      { step === steps.length - 1 && <Button endIcon={<CheckIcon / >} onClick={()=>{
        router.push(`/elections/${data.electionId}/open-live`)
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