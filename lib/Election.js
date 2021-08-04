const DB = require("./db");
const db = new DB();
const AWS = require("aws-sdk");

let tableName = process.env.ELECTIONS_TABLE_NAME;
let documentBucket = process.env.ELECTIONS_DOCUMENT_BUCKET;
let documentBase;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
  documentBucket = ""; //ELECTIONS_DOCUMENT_BUCKET
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

  static getSignedUrl(bucket, filename) {
    var s3 = new AWS.S3();
    var params = { Bucket: bucket, Key: filename, Expires: 60 };
    var url = s3.getSignedUrl("getObject", params);
    console.log("The URL is", url); // expires in 60 seconds
    return url;
  }

  static generateURL(filename) {
    if (documentBucket) {
      return Election.getSignedUrl(documentBucket, filename);
    } else {
      return Election.docBaseURL + ballotFile;
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
