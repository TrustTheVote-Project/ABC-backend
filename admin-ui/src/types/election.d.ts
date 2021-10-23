export type Election = {
  electionJurisdictionName: string
  electionName: string
  electionStatus: string
  electionDate: string // YYYY-MM-DD
  electionLink: string

  configuration?: ElectionConfiguration
}

export type ElectionConfiguration = {
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