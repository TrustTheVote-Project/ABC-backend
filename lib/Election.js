const DB = require("./db");
const db = new DB();

let tableName = process.env.ELECTIONS_TABLE_NAME;
let documentBase = process.env.ELECTIONS_DOCUMENT_STORE;
if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
  documentBase = `https://somewhere.com/docs/`;
}
const dummyConfiguration = {
  absenteeStatusRequired: true,
  multipleUsePermitted: true,
  multipleUseNotification: "lorem ipsum",
  linkAbsenteeRequests: " http://tbd.com",
  linkVoterReg: "http://tbd.com",
  linkBallotReturn: "http://tbd.com",
  affidavitRequiresWitnessName: true,
  affidavitRequiresWitnessSignature: true,
  affidavitRequiresDLIDcardPhotos: true,
  DLNminLength: 12,
  DLNmaxLength: 12,
  DLNalpha: true,
  DLNnumeric: true,
  DLNexample: "X01234567890",
};

const affidavitFile = "affidavit-tbd.pdf";

class Election {
  static noElectionResponse = {
    statusCode: 404,
    body: JSON.stringify(
      {
        error_type: "no_election",
        error_description: `No current election`,
      },
      null,
      2
    ),
  };

  constructor(attributes) {
    this.attributes = attributes;
  }

  static docBaseURL = documentBase; //"https://somewhere.com/";
  static dummyBallotDefinition = { Lots: "Interesting JSON or XML" };

  static async all() {
    const data = await db.getAll(null, tableName);
    if (data && data.Items) {
      return data.Items.map((dataItem) => new Election(dataItem));
    } else {
      return [];
    }
  }

  static async currentElection() {
    const elections = await Election.all();

    if (elections) {
      switch (elections.length) {
        case 1:
          return elections[0];
          break;
        case 0:
          return false;
        default:
          // Multiple? What to do?
          return false;
      }
    }
  }
  static respondIfNoElection() {
    if (!this.currentElection()) {
      return noElectionResponse;
    }
  }

  static async create(attributes) {
    const data = await db.put(attributes, tableName);
    return data ? new Election(attributes) : null;
  }

  configurations() {
    if (this.attributes) {
      return dummyConfiguration;
    }
  }

  affidavitTemplateURL() {
    if (this.attributes) {
      let affidavitTemplateURL = Election.docBaseURL + affidavitFile;
      return affidavitTemplateURL;
    }
  }

  //Alex:  query best practices on these attribute references
  //  more important in future when not dummy function.

  blankBallotURL(voter) {
    if (this.attributes) {
      let ballotFile = this.attributes["electionName"]
        .toLowerCase()
        .replace(/\s/g, "_");
      ballotFile += "-" + voter.attributes["ballotID"] + ".pdf";
      let ballotUrl = Election.docBaseURL + ballotFile;
      return ballotUrl;
    }
  }

  ballotDefintion(voter) {
    if (this.attributes) {
      //Customize per voter
      return Election.dummyBallotDefinition;
    }
  }
}

exports.Election = Election;
