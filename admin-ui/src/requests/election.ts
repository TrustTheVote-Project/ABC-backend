import { Election, ElectionConfiguration, ElectionStatus } from 'types';
import { get, post, uploadFile, SuccessResult } from './base';

const defaultElection = {
  id: "default-election",
  electionJurisdictionName: "Gadget County",
  electionName: "Special Election",
  electionStatus: ElectionStatus.pending,
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

export const upsertElection = async(election: Election): Promise<Election> => {
  const defaultElection = {...election}
  defaultElection.electionId = defaultElection.electionId || "default-election"
  return await post('/setElection', election, {defaultReturn: defaultElection })
}

export const getElection = async(electionId: string): Promise<Election> => {
  return await post('/getElection', {
    electionId: electionId
  }, {defaultReturn: defaultElection})
}

export const getConfiguration = async(electionId:  string): Promise<ElectionConfiguration> => {
  return await get(`/getConfiguration?electionId=${electionId}`, {defaultReturn: defaultElection})
}

export const setConfiguration = async(electionId: string, configuration: ElectionConfiguration) => {
  return await post(`/setConfiguration?electionId=${electionId}`, configuration, {defaultReturn: configuration})
}

export const setBallotDefinitionFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/setBallotDefinitionFile?electionId=${electionId}`, fileContents, {
    defaultReturn: {
      ...(await getElection(electionId)),
      ballotDefinitionCount: 123
    }
  })
}

export const addBallotFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/addBallotFile?electionId=${electionId}`, fileContents, {
    defaultReturn: {
      ...(await getElection(electionId)),
      ballotDefinitionCount: 123,
      ballotCount: 123
    }
  })
}

export const setVoterFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/setVoterFile?electionId=${electionId}`, fileContents, {
    defaultReturn: await getElection(electionId)
  })
}

export const setTestVoterFile = async (electionId: string, fileContents: File) => {
  return await uploadFile(`/setTestVoterFile?electionId=${electionId}`, fileContents, {
    defaultReturn: {
      ...(await getElection(electionId)),
      testVoterCount: 17
    }
  })
}
