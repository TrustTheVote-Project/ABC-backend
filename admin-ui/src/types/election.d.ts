export enum ElectionStatus {
  open = "open",
  pending = "pending",
  closed = "closed",
  archived = "archived",
}

export type Election = {
  id: string
  electionJurisdictionName: string
  electionName: string
  electionStatus: ElectionStatus
  electionDate: string // YYYY-MM-DD
  electionLink: string

  configuration?: ElectionConfiguration

  voterCount: number
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