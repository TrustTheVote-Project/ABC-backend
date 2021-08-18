const DB = require("./db");
const db = new DB();

const DocumentInterface = require("./documentinterface.js");

let tableName = process.env.ELECTIONS_TABLE_NAME;
let documentBucket = process.env.ELECTIONS_DOCUMENT_BUCKET;
let documentBase;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
  documentBucket = ""; //ELECTIONS_DOCUMENT_BUCKET
  documentBase = `https://somewhere.com/docs/`;
}
const dummyConfiguration = {
  stateName: "DemoState",
  stateCode: "DS",
  absenteeStatusRequired: true,
  multipleUsePermitted: true,
  multipleUseNotification: "lorem ipsum",
  affidavitOfferSignatureViaPhoto: true,
  affidavitOfferSignatureViaName: true,
  affidavitRequiresWitnessName: true,
  affidavitRequiresWitnessSignature: true,
  affidavitRequiresDLIDcardPhotos: true,
  DLNminLength: 12,
  DLNmaxLength: 12,
  DLNalpha: true,
  DLNnumeric: true,
  DLNexample: "X01234567890",
  linkAbsenteeRequests: "http://absenteerequest.tbd.com",
  linkVoterReg: "http://voterreg.tbd.com",
  linkBallotReturn: "http://ballotreturn.tbd.com",
  linkMoreInfo1: "http://misc1.tbd.com",
  linkMoreInfo2: "http://misc2.tbd.com",
};

const affidavitFile = "affidavit-tbd.pdf";

class Election {
  static noElectionResponse = {
    statusCode: 400,
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

  static generateURL(filename) {
    if (documentBucket) {
      return DocumentInterface.getSignedUrl(documentBucket, filename);
    } else {
      return Election.docBaseURL + filename;
    }
  }

  affidavitTemplateURL() {
    if (this.attributes) {
      return Election.generateURL(affidavitFile);
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
      return Election.generateURL(ballotFile);
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
