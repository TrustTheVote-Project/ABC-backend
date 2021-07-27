const DB = require("./db");
const db = new DB();

let tableName = process.env.ELECTIONS_TABLE_NAME;
if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
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

const dummyAffidavitTemplateURL = "https://tbd.com";

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
      return dummyAffidavitTemplateURL;
    }
  }
}

exports.Election = Election;
