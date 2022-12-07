import { BallotFile, Election, ElectionConfiguration, ElectionCreate, ElectionDefinition, ElectionStatus } from 'types';
import { VoterRecord } from 'types/voter';
import { get, post, uploadFile, SuccessResult } from './base';

const defaultElection = {
  electionId: "default-election",
  electionJurisdictionName: "Gadget County",
  electionName: "Special Election",
  electionStatus: ElectionStatus.incomplete,
  electionDate: "2202-11-07",
  electionLink: "https://www.google.com",

  voterCount: 525,
  ballotDefinitionCount: 200,
  ballotCount: 200,

  configuration: {
    stateName: "The Future",
    stateCode: "TF"
  }
}

export const getAll = async (): Promise<Array<Election>> => {
  return await get('/getElection', {defaultReturn: [
    defaultElection,
  ]})
}


const ensureConfigurationsObject = (election: Election): Election => {
  if (election.configurations && typeof(election.configurations)==="string") {
    election.configurations = JSON.parse(election.configurations as string);
  }
  return election
}

export const createElection = async(election: ElectionCreate): Promise<Election> => {
  const resp = await post('/createElection', election, {defaultReturn: {electionId: defaultElection.electionId} })
  return ensureConfigurationsObject(resp);
}


export const setElectionAttributes = async(election: Election): Promise<Election> => {
  const defaultElection = {...election}
  defaultElection.electionId = defaultElection.electionId || "default-election"
  const resp = await post('/setElectionAttributes', election, {defaultReturn: defaultElection })
  return ensureConfigurationsObject(resp);
}

export const getElection = async(electionId: string): Promise<Election> => {
  const resp = await post('/getElection', {
    electionId: electionId
  }, {defaultReturn: defaultElection})
  return ensureConfigurationsObject(resp);
}

// export const getConfiguration = async(electionId:  string): Promise<ElectionConfiguration> => {
//   return await get(`/getConfiguration?electionId=${electionId}`, {defaultReturn: defaultElection})
// }

export const setElectionConfigurations = async(electionId: string, configurations: ElectionConfiguration): Promise<Election> => {
  const defaultElectionData = {...defaultElection, configurations}
  const resp = await post(`/setElectionConfigurations`, {
    electionId,
    configurations
  }, {defaultReturn: defaultElectionData})
  return ensureConfigurationsObject(resp);
}

//ElectionDefinition
export const setElectionDefinition = async(electionId: string, EDF: File) => {
  const defaultElectionData = {...defaultElection, electionDefinition: EDF}
  
  const fileName = await uploadFile(`/setElectionDefinition`, EDF, {
    electionId,
  }, {defaultReturn: defaultElectionData})

  const result = await post(`/setElectionDefinition`, {
    electionId,
    objectId: fileName
  }, {defaultReturn: defaultElectionData})

  return {
    objectKey: fileName
  }

}


export const getFileStatus = async(objectId: string) => {
  return await post(`/getElectionDefinitionStatus`, {
    objectId,
  }, {defaultReturn: {success: true}})
}

export const setElectionBallots = async(electionId: string, EDF: File) => {
  const fileName = await uploadFile(`/setElectionBallots`, EDF, {
    electionId,
  })

  const result = await post(`/setElectionBallots`, {
    electionId,
    objectId: fileName
  })

  return {
    objectKey: fileName
  }

}

export const setElectionVoters = async (electionId: string, EDF: File) => {
  const fileName = await uploadFile(`/setElectionVoters`, EDF, {
    electionId,
  })

  const result = await post(`/setElectionVoters`, {
    electionId,
    objectId: fileName,
    latMode: true
  })

  return {
    objectKey: fileName
  }
}


export const setTestVoterFile = async (electionId: string, fileContents: File) => {

  const fileName = await uploadFile(`/setElectionVoters`, fileContents, {
    electionId,
  })

  const result = await post(`/setElectionVoters`, {
    electionId,
    objectId: fileName,
    latMode: true
  })

  return {
    objectKey: fileName
  }

}
