const DB = require("./db");
const { Application } = require("./Application");
const { FileInProcessing } = require("./FileInProcessing.js");
const DocumentInterface = require("./documentinterface.js");

const db = new DB();

//const uuid = require("uuid");

let tableName = process.env.ELECTIONS_TABLE_NAME;
let documentBucket = process.env.ELECTIONS_DOCUMENT_BUCKET;
let uploadBucket = process.env.UPLOAD_BUCKET;
let documentBase;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
  // Allow local dev override
  //documentBucket = "";
  //uploadBucket = "";
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
  DLNminLength: 6,
  DLNmaxLength: 6,
  DLNalpha: true,
  DLNnumeric: true,
  DLNexample: "C46253",
  linkAbsenteeRequests: "http://absenteerequest.tbd.com",
  linkVoterReg: "http://voterreg.tbd.com",
  linkBallotReturn: "http://ballotreturn.tbd.com",
  linkMoreInfo1: "http://misc1.tbd.com",
  linkMoreInfo2: "http://misc2.tbd.com",
};

const affidavitFile = "blank_affidavit.pdf";
const defaultTestPrintFile = "MarkitTestPrintPage.pdf";

class Election {
  static servingStatus = {
    closed: "closed",
    open: "open",
    lookup: "lookup",
    test: "test",
  };

  static consumerProperties = [
    "electionId",
    "electionJurisdictionName",
    "electionName",
    "electionStatus",
    "electionDate",
    //"electionLink",
    "electionVotingStartDate",
    "electionDefinitionURL",
  ];

  static objectProperties = [
    "electionId",
    "electionJurisdictionName",
    "electionName",
    "electionStatus",
    "electionDate",
    //"electionLink",
    "electionVotingStartDate",

    "voterCount",
    "ballotDefinitionCount",
    "ballotCount",

    "configurations",
    "ballotDefinitions",
    "testPrintPageFilename",
    "testCount",
    "servingStatus",
    "configStatus",
    "latMode",
    "electionDefinitionFile",
    "electionDefinitionURL",
  ];

  static defaultAttributes = {
    voterCount: 0,
    ballotDefinitionCount: 0,
    ballotCount: 0,
    electionStatus: "incomplete",
    configStatus: "incomplete",
    servingStatus: "closed",
  };

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

  /*static filterProperties(attributes, master) {
    return Object.keys(attributes)
      .filter((key) => master.includes(key))
      .reduce((obj, key) => {
        obj[key] = attributes[key];
        return obj;
      }, {});
  }
  */

  static filterProperties(attributes, master) {
    return Object.keys(attributes)
      .filter((key) => master.includes(key))
      .reduce((obj, key) => {
        obj[key] = attributes[key];
        return obj;
      }, {});
  }

  static filterNullExtendProperties(
    attributes,
    master = Election.objectProperties
  ) {
    return master.reduce((obj, key) => {
      obj[key] = attributes[key] != null ? attributes[key] : null;
      return obj;
    }, {});
  }

  static filterConsumerProperties(attributes) {
    return this.filterNullExtendProperties(
      attributes,
      Election.consumerProperties
    );
  }

  static filterObjectProperties(attributes) {
    return this.filterProperties(attributes, Election.objectProperties);
  }

  constructor(attributes, admin = false) {
    this.allAttributes = attributes;
    if (admin) {
      this.attributes = attributes;
    } else {
      this.attributes = Election.filterConsumerProperties(attributes);
    }
    //Temporary set EDF
    this.allAttributes["electionDefinitionFile"] =
      this.allAttributes["electionId"] + "_edf.json";
    this.allAttributes["electionDefinitionURL"] = Election.generateURL(
      this.allAttributes["electionDefinitionFile"]
    );
    this.attributes["electionDefinitionURL"] =
      this.allAttributes["electionDefinitionURL"];
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

  static async findByElectionId(electionId) {
    const data = await db.get(
      {
        electionId: electionId,
      },
      tableName
    );

    return data ? new Election(data, true) : null;
  }

  static async currentElection(latMode) {
    const electionId = await Application.get("currentElectionId");

    if (electionId) {
      const election = await Election.findByElectionId(electionId);
      if (election && election.attributes.latMode == latMode) {
        return election;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static respondIfNoElection() {
    if (!this.currentElection()) {
      return noElectionResponse;
    }
  }

  static initDefaults(attributes, id) {
    return Object.assign(
      {},
      { electionId: id },
      this.defaultAttributes,
      attributes
    );
  }

  static async create(attributes, id) {
    attributes = Election.filterObjectProperties(attributes);
    attributes = this.initDefaults(attributes, id);
    const data = await db.put(attributes, tableName);
    return data ? new Election(attributes, true) : null;
  }

  async update(attributes) {
    attributes = Election.filterObjectProperties(attributes);
    delete attributes.electionId;
    const newAttributes = await db.update(
      attributes,
      { electionId: this.attributes.electionId },
      tableName
    );
    this.attributes = newAttributes;
    return this;
  }

  configurations() {
    if (this.allAttributes) {
      return JSON.parse(this.allAttributes.configurations);
    }
  }

  /* async electionDefinition() {
    if (this.allAttributes && this.allAttributes.electionDefinitionFile) {
      console.log("Retrieving file");
      const [success, response] = await DocumentInterface.getFile(
        uploadBucket,
        this.allAttributes.electionDefinitionFile
      );

      if (success) {
        //To do check the status of this EDF first?
        //Currently not...
        return JSON.parse(response.Body.toString("ascii"));
      } else {
        console.log("Failed");
        return {};
      }
    } else {
      return {};
    }
  }
  */

  static generateURL(filename) {
    if (documentBucket) {
      return DocumentInterface.getSignedUrl(documentBucket, filename);
    } else {
      return Election.docBaseURL + filename;
    }
  }

  async startEDFSubmission(
    fileKey,
    data,
    status = "started",
    errorMessage = ""
  ) {
    const [success, message] = await DocumentInterface.createFile(
      uploadBucket,
      fileKey,
      data
    );
    if (success) {
      const [processSuccess, processingMessage] =
        await FileInProcessing.initiate(
          fileKey,
          "edfSubmission",
          status,
          errorMessage
        );
      if (processSuccess) {
        return [true, ""];
      } else {
        return [false, processingMessage];
      }
    } else {
      return [false, message];
    }
  }

  async initiateEDFSubmission(fileKey, status = "started", errorMessage = "") {
    const [success, message] = await DocumentInterface.getFile(
      uploadBucket,
      fileKey
    );
    if (success) {
      const [processSuccess, processingMessage] =
        await FileInProcessing.initiate(
          fileKey,
          "edfSubmission",
          status,
          errorMessage
        );
      if (processSuccess) {
        return [true, ""];
      } else {
        return [false, processingMessage];
      }
    } else {
      return [false, message];
    }
  }

  affidavitTemplateURL() {
    if (this.attributes) {
      return Election.generateURL(affidavitFile);
    }
  }

  electionDefinitionURL() {
    if (this.attributes) {
      return this.allAttributes["electionDefinitionURL"];
      //return Election.generateURL(this.allAttributes.electionDefinitionFile);
    }
  }

  testPrintPageURL() {
    if (this.attributes) {
      return Election.generateURL(
        this.attributes["testPrintPageFilename"]
          ? this.attributes["testPrintPageFilename"]
          : defaultTestPrintFile
      );
    }
  }

  //Alex:  query best practices on these attribute references
  //  more important in future when not dummy function.

  blankBallotURL(voter) {
    if (this.attributes) {
      let ballotFile = this.attributes["electionId"]
        .toLowerCase()
        .replace(/\s/g, "_");
      ballotFile += "_" + voter.attributes["ballotID"] + ".pdf";
      return Election.generateURL(ballotFile);
    }
  }

  //Deprecated
  ballotDefintion(voter) {
    if (this.attributes) {
      //Customize per voter
      return Election.dummyBallotDefinition;
    }
  }
}

exports.Election = Election;
