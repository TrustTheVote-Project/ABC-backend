export enum ElectionStatus {
  pending = "pending",
  test = "test",
  live = "live",
  complete = "complete",
  archived = "archived",
}

export enum ElectionServingStatus {
  closed = "closed",
  open = "open",
  lookup = "lookup",
}

export type ElectionCreate = {
  electionJurisdictionName: string;
  electionName: string;
  electionDate: Date; // YYYY-MM-DD
  electionVotingStartDate: Date; //YYYY-MM-DD
  configurations?: ElectionConfiguration;
};

export type Election = ElectionCreate & {
  electionId: string;
  electionStatus: ElectionStatus;
  servingStatus: ElectionServingStatus;
  electionLink: string;

  configurations: ElectionConfiguration;

  voterCount: number;
  testVoterCount: number;
  ballotDefinitionCount: number;
  ballotCount: number;

  electionDefinitionFile?: string;
  ballotsFile?: string;
  votersFile?: string;
  testCount?: number;
};

export type ElectionConfiguration = {
  id: string;
  electionId: string;
  stateName: string;
  stateCode: string;
  electionDefinitionURL: string;
  absenteeStatusRequired: boolean;
  multipleUsePermitted: boolean;
  multipleUseNotification: string;
  affidavitOfferSignatureViaPhoto: boolean;
  affidavitOfferSignatureViaName: boolean;
  //affidavitRequiresWitnessName: boolean
  //affidavitRequiresWitnessSignature: boolean
  affidavitWitnessRequirement: string;
  affidavitRequiresDLIDcardPhotos: boolean;
  DLNminLength: number;
  DLNmaxLength: number;
  DLNalpha: boolean;
  DLNnumeric: boolean;
  DLNexample: string;
  linkAbsenteeRequests: string;
  linkVoterReg: string;
  linkBallotReturn: string;
  linkMoreInfo1: string;
  linkMoreInfo2: string;
};

export type ElectionDefinition = object & {};

export type BallotFile = {
  ballotID: string;
  file: File;
};
