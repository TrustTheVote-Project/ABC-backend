import { Election, ElectionConfiguration } from 'types';
import { get, post, SuccessResult } from './base';

export const getAll = async (): Promise<Array<Election>> => {
  return await get('/getElection', {defaultReturn: [{
    id: "default-election",
    electionJurisdictionName: "Default Jurisdiction Name",
    electionName: "Default Elect Name",
    electionStatus: "open",// ElectionStatus.open,
    electionDate: "2099-11-01",
    electionLink: "https://www.google.com",

    voterCount: 525,
    ballotDefinitionCount: 200,
    ballotCount: 200
  }]})
}

export const getConfiguration = async(electionId:  string): Promise<ElectionConfiguration> => {
  return await get(`/getConfiguration?electionId=${electionId}`, {defaultReturn: {
    id: "default-configuration",
    electionId: "default-election",
    electionJurisdictionName: "Default Jurisdiction Name",
    electionName: "Default Elect Name",
    electionStatus: "open",// ElectionStatus.open,
    electionDate: "2099-11-01",
    electionLink: "https://www.google.com"

  }})
}

export const setConfiguration = async(electionId: string, configuration: ElectionConfiguration) => {
  return await post(`/setConfiguration?electionId=${electionId}`, configuration, {defaultReturn: configuration})
}