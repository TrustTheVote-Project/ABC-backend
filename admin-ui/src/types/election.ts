export enum ElectionStatus {
  open = "open",
  testing = "testing",
  pending = "pending",
  closed = "closed",
  archived = "archived",
}

export type Election = {
  electionId: string
  electionJurisdictionName: string
  electionName: string
  electionStatus: ElectionStatus
  electionDate: Date // YYYY-MM-DD
  electionLink: string

  configuration?: ElectionConfiguration

  voterCount: number
  testVoterCount: number
  ballotDefinitionCount: number
  ballotCount: number
}

export type ElectionConfiguration = {
  id: string
  electionId: string
  stateName: string
  stateCode: string
  absenteeStatusRequired: boolean
  multipleUsePermitted: boolean
  multipleUseNotification: string
  affidavitOfferSignatureViaPhoto: boolean
  affidavitOfferSignatureViaName: boolean
  affidavitRequiresWitnessName: boolean
  affidavitRequiresWitnessSignature: boolean
  affidavitRequiresDLIDcardPhotos: boolean
  DLNminLength: number
  DLNmaxLength: number
  DLNalpha: boolean,
  DLNnumeric: boolean
  DLNexample: string
  linkAbsenteeRequests: string
  linkVoterReg: string
  linkBallotReturn: string
  linkMoreInfo1: string
  linkMoreInfo2: string
}