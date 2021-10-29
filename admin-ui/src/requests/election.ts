import { Election, ElectionConfiguration, ElectionStatus } from 'types';
import { get, post, uploadFile, SuccessResult } from './base';

export const getAll = async (): Promise<Array<Election>> => {
  return await get('/getElection', {defaultReturn: [{
    id: "default-election",
    electionJurisdictionName: "Default Jurisdiction Name",
    electionName: "Default Elect Name",
    electionStatus: ElectionStatus.pending,
    electionDate: "2099-11-01",
    electionLink: "https://www.google.com",

    voterCount: 525,
    ballotDefinitionCount: 200,
    ballotCount: 200
  }]})
}

export const upsertElection = async(election: Election): Promise<Election> => {
  const defaultElection = {...election}
  defaultElection.id = defaultElection.id || "default-election"
  return await post('/upsertElection', election, {defaultReturn: defaultElection })
}

export const getElection = async(electionId: string): Promise<Election> => {
  return await get(`/getElection?electionId=${electionId}`, {defaultReturn: {
    id: "default-election",
    electionJurisdictionName: "Default Jurisdiction Name",
    electionName: "Default Elect Name",
    electionStatus: ElectionStatus.pending,
    electionDate: "2099-11-01",
    electionLink: "https://www.google.com",

    voterCount: 525,
    ballotDefinitionCount: 200,
    ballotCount: 200
  }})
}

export const getConfiguration = async(electionId:  string): Promise<ElectionConfiguration> => {
  return await get(`/getConfiguration?electionId=${electionId}`, {defaultReturn: {
    id: "default-configuration",
    electionId: "default-election",
    electionJurisdictionName: "Default Jurisdiction Name",
    electionName: "Default Elect Name",
    electionStatus: ElectionStatus.pending,
    electionDate: "2099-11-01",
    electionLink: "https://www.google.com"

  }})
}

export const setConfiguration = async(electionId: string, configuration: ElectionConfiguration) => {
  return await post(`/setConfiguration?electionId=${electionId}`, configuration, {defaultReturn: configuration})
}

export const setBallotDefinitionFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/setBallotDefinitionFile?electionId=${electionId}`, fileContents, {
    defaultReturn: await getElection(electionId)
  })
}

export const addBallotFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/addBallotFile?electionId=${electionId}`, fileContents, {
    defaultReturn: await getElection(electionId)
  })
}

export const setVoterFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/setVoterFile?electionId=${electionId}`, fileContents, {
    defaultReturn: await getElection(electionId)
  })
}
