import {
  BallotFile,
  Election,
  ElectionConfiguration,
  ElectionCreate,
  ElectionDefinition,
  ElectionServingStatus,
  ElectionStatus,
  Maybe,
} from "types";
import { VoterRecord } from "types/voter";
import { get, post, uploadFile, SuccessResult } from "./base";

const defaultElection = {
  electionId: "default-election",
  electionJurisdictionName: "Gadget County",
  electionName: "Special Election",
  electionStatus: ElectionStatus.pending,
  servingStatus: ElectionServingStatus.closed,
  electionDate: "2202-11-07",
  electionLink: "https://www.google.com",

  voterCount: 525,
  ballotDefinitionCount: 200,
  ballotCount: 200,

  configuration: {
    stateName: "The Future",
    stateCode: "TF",
  },
};

export const getAll = async (): Promise<Array<Election>> => {
  try {
    return await get("/getElection", { defaultReturn: [defaultElection] });
  } catch (err: any) {
    console.log(err?.response?.data);
    return [];
  }
};

export const getCurrentElection = async (): Promise<Maybe<Election>> => {
  try {
    return await get("/getCurrentElection");
  } catch (err: any) {
    console.log(err?.response?.data);
    return null;
  }
};

export const getCurrentTestElection = async (): Promise<Maybe<Election>> => {
  try {
    return await get("/getCurrentElection", {
      headers: {
        "User-Agent": "test",
        "X-User-Agent": "test",
      },
    });
  } catch (err: any) {
    console.log(err?.response?.data);
    return null;
  }
};

const ensureConfigurationsObject = (election: Election): Election => {
  if (election.configurations && typeof election.configurations === "string") {
    election.configurations = JSON.parse(election.configurations as string);
  }
  return election;
};

export const createElection = async (
  election: ElectionCreate
): Promise<Election> => {
  const resp = await post("/createElection", election, {
    defaultReturn: { electionId: defaultElection.electionId },
  });
  return ensureConfigurationsObject(resp);
};

export const setElectionAttributes = async (
  election: Election
): Promise<Election> => {
  const defaultElection = { ...election };
  defaultElection.electionId = defaultElection.electionId || "default-election";
  const resp = await post("/setElectionAttributes", election, {
    defaultReturn: defaultElection,
  });
  return ensureConfigurationsObject(resp);
};

export const getElection = async (electionId: string): Promise<Election> => {
  const resp = await post(
    "/getElection",
    {
      electionId: electionId,
    },
    { defaultReturn: defaultElection }
  );
  return ensureConfigurationsObject(resp);
};

// export const getConfiguration = async(electionId:  string): Promise<ElectionConfiguration> => {
//   return await get(`/getConfiguration?electionId=${electionId}`, {defaultReturn: defaultElection})
// }

export const setElectionConfigurations = async (
  electionId: string,
  configurations: ElectionConfiguration
): Promise<Election> => {
  const defaultElectionData = { ...defaultElection, configurations };
  const resp = await post(
    `/setElectionConfigurations`,
    {
      electionId,
      configurations,
    },
    { defaultReturn: defaultElectionData }
  );
  return ensureConfigurationsObject(resp);
};

//ElectionDefinition
export const setElectionDefinition = async (electionId: string, EDF: File) => {
  const defaultElectionData = { ...defaultElection, electionDefinition: EDF };

  const fileName = await uploadFile(
    `/setElectionDefinition`,
    EDF,
    {
      electionId,
    },
    { defaultReturn: defaultElectionData }
  );

  await sleep(2000);

  const result = await post(
    `/setElectionDefinition`,
    {
      electionId,
      objectId: fileName,
    },
    { defaultReturn: defaultElectionData }
  );

  return {
    objectKey: fileName,
  };
};

export const openElectionTest = async (electionId: string) => {
  return await post("/openElectionTest", { electionId });
};

export const closeElectionTest = async (electionId: string) => {
  return await post("/closeElectionTest", { electionId });
};

export const openElection = async (electionId: string) => {
  return await post("/openElection", { electionId });
};

export const closeElection = async (electionId: string) => {
  return await post("/closeElection", { electionId });
};

export const setCurrentElection = async (electionId: string) => {
  return await post("/setCurrentElection", { electionId });
};

export const getFileStatus = async (objectId: string) => {
  return await post(
    `/getElectionDefinitionStatus`,
    {
      objectId,
    },
    { defaultReturn: { success: true } }
  );
};

export const setElectionBallots = async (electionId: string, EDF: File) => {
  const fileName = await uploadFile(`/setElectionBallots`, EDF, {
    electionId,
  });

  await sleep(2000);

  const result = await post(`/setElectionBallots`, {
    electionId,
    objectId: fileName,
  });

  return {
    objectKey: fileName,
  };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const setElectionVoters = async (electionId: string, EDF: File) => {
  const fileName = await uploadFile(`/setElectionVoters`, EDF, {
    electionId,
  });

  await sleep(2000);

  const result = await post(`/setElectionVoters`, {
    electionId,
    objectId: fileName,
    latMode: false,
  });

  return {
    objectKey: fileName,
  };
};

export const setTestVoterFile = async (
  electionId: string,
  fileContents: File
) => {
  const fileName = await uploadFile(`/setElectionVoters`, fileContents, {
    electionId,
  });

  await sleep(2000);

  const result = await post(`/setElectionVoters`, {
    electionId,
    objectId: fileName,
    latMode: true,
  });

  return {
    objectKey: fileName,
  };
};
