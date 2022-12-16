const DB = require("./db");
const { Application } = require("./Application");
const { FileInProcessing } = require("./FileInProcessing.js");
const DocumentInterface = require("./documentinterface.js");
const s3CsvToJson = require("s3-csv-to-json");
const prepareVoterRecord = require("./prepareVoterRecord.js");
const readline = require("readline");
const AWS = require("aws-sdk");
let s3 = new AWS.S3({ signatureVersion: "v4" });

const db = new DB();

//const uuid = require("uuid");

let tableName = process.env.ELECTIONS_TABLE_NAME;
let voterTableName = process.env.VOTERS_TABLE_NAME;
let documentBucket = process.env.ELECTIONS_DOCUMENT_BUCKET;
let uploadBucket = process.env.UPLOAD_BUCKET;
let documentBase;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
  voterTableName = "abc_voters_local";
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
  };

  static electionStatus = {
    pending: "pending",
    test: "test",
    live: "live",
    complete: "complete",
    archived: "archived",
  };

  static consumerProperties = [
    "electionId",
    "electionJurisdictionName",
    "electionName",
    "electionStatus",
    "servingStatus",
    "electionDate",
    "testCount",
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
    "testVoterCount",
    "ballotDefinitionCount",
    "ballotCount",

    "configurations",
    "ballotDefinitions",
    "testPrintPageFilename",
    "testCount",
    "electionStatus",
    "servingStatus",
    "configStatus",
    "latMode",
    "electionDefinitionFile",
    "electionDefinitionURL",
    "edfSet",
    "ballotsSet",
    "votersSet",
    "testVotersSet",
    "ballotsFile",
    "votersFile",
  ];

  static defaultAttributes = {
    voterCount: 0,
    testVoterCount: 0,
    ballotDefinitionCount: 0,
    ballotCount: 0,
    electionStatus: this.electionStatus.pending,
    configStatus: "incomplete",
    servingStatus: this.servingStatus.closed,
    edfSet: false,
    ballotsSet: false,
    votersSet: false,
    testVotersSet: false,
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

  static insureProperAttributeFormat(attributes) {
    const formattedAttribtues = {};
    for (const key in attributes) {
      switch (key) {
        case "electionDate":
        case "electionVotingStartDate":
          formattedAttribtues[key] = attributes[key].split("T")[0];
          break;

        default:
          formattedAttribtues[key] = attributes[key];
          break;
      }
    }
    return formattedAttribtues;
  }
  static filterConsumerProperties(attributes) {
    const preparedAttributes = Election.insureProperAttributeFormat(attributes);
    return this.filterNullExtendProperties(
      preparedAttributes,
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
    //Temporary set EDF URL
    this.allAttributes["electionDefinitionURL"] = Election.generateURL(
      this.allAttributes["electionId"] + "_edf.json"
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
    attributes = Election.insureProperAttributeFormat(attributes);
    const data = await db.put(attributes, tableName);
    return data ? new Election(attributes, true) : null;
  }

  async update(attributes) {
    attributes = Election.filterObjectProperties(attributes);
    attributes = Election.insureProperAttributeFormat(attributes);
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
    const contentType = filename.endsWith("json")
      ? "application/json"
      : "application/pdf";
    if (documentBucket) {
      return DocumentInterface.getSignedUrl(
        documentBucket,
        filename,
        120,
        "inline;",
        contentType
      );
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
      documentBucket,
      fileKey
    );
    if (success) {
      const [processSuccess, processingMessage] =
        await FileInProcessing.initiate(
          fileKey,
          FileInProcessing.requestType.edfSubmission,
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

  async setElectionDefinition(objectId, documentState) {
    if (documentState["fileCount"] == 1) {
      await FileInProcessing.initiate(
        objectId,
        FileInProcessing.requestType.edfSubmission,
        FileInProcessing.processingStatus.started,
        "EDF initiated for electionId: " + this.attributes.electionId
      );
      await this.update({
        electionDefinitionFile: objectId,
      });

      const s3Config = {
        Bucket: uploadBucket,
        Key: Object.values(documentState["files"])[0],
      };

      const readFile = new Promise((resolve, reject) => {
        s3.getObject(s3Config, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            resolve();
          } else {
            try {
              var txt = data.Body.toString("ascii");
              var json = JSON.parse(txt);
              var ballotStyleCount = json["Election"][0]["BallotStyle"].length;
              this.update({
                ballotDefinitionCount: ballotStyleCount,
              }).then(() => {
                resolve();
              });
            } catch (err) {
              console.log(err.message);
              console.log("error parsing EDF text");
              resolve();
            }
          }
        });
      });
      await readFile;

      const [success, message] = await DocumentInterface.copyFile(
        uploadBucket,
        documentBucket,
        Object.values(documentState["files"])[0],
        this.allAttributes["electionId"] + "_edf.json"
      );
      if (success) {
        await FileInProcessing.incrementProgress(
          objectId,
          FileInProcessing.processingStatus.complete.toString(),
          "EDF loaded to electionId: " + this.attributes.electionId,
          "edfSubmission"
        );
        await this.update({ edfSet: true });

        return [true, ""];
      } else {
        return [false, message];
      }
    } else {
      return [false, "Multiple files uploaded"];
    }
  }

  async insertVoterRecord(record) {
    return await db.put(record, voterTableName);
  }

  async loadVoterRecords(voterRecordsS3, latMode = 0) {
    const s3Config = {
      Bucket: uploadBucket,
      Key: voterRecordsS3,
    };
    await this.loadRecords(s3Config, latMode);
    //const records = await this.loadRecords(s3Config);
    // for (const record of records) {
    //   //await this.insertVoterRecord(record);
    // }
  }

  /*
  async loadRecords(s3Config) {
    return new Promise((resolve, reject) => {
      console.log("File read from S3.");
      //let records = [];
      let recordCount = 0;
      try {
        let readStream = S3.getObject(s3Config).createReadStream();
        let lineReader = readLine.createInterface({ input: readStream });
        lineReader
          .on("line", (line) => {
            console.log(line);
            try {
              if (line && typeof line == "string") {
                records.push(JSON.parse(line));
              }
            } catch (e) {
              console.log("Error parsing line: " + line);
            }
            //await this.insertVoterRecord(JSON.parse(line));
            recordCount += 1;
          })
          .on("close", () => {
            console.log("Finished processing S3 file.");
            //resolve [true, `Imported ${recordCount} records.`];
            resolve(records);
          });
      } catch (err) {
        console.log("Error: ", err);
        reject(err);
        //resolve [false, err];
      }
    });
  }
  */

  prepareVoterRecordForDB = (record, latMode = 0) => {
    record["LAT"] = latMode;
    record["electionId"] = this.allAttributes["electionId"];
    record["completedN"] = "0";
    record["incompletedN"] = "0";
    const dbRecord = prepareVoterRecord(record);

    return dbRecord;
  };

  async loadRecords(s3Config, latMode = 0) {
    const s3ReadStream = s3.getObject(s3Config).createReadStream();

    const rl = readline.createInterface({
      input: s3ReadStream,
      terminal: false,
    });

    let myReadPromise = new Promise((resolve, reject) => {
      let voterCount = 0;
      rl.on("line", async (line) => {
        await this.insertVoterRecord(
          this.prepareVoterRecordForDB(JSON.parse(line), latMode)
        );
        voterCount += 1;
        if (latMode) {
          await this.update({
            testVoterCount: voterCount,
          });
        } else {
          await this.update({
            voterCount,
          });
        }
      });
      rl.on("error", () => {
        console.log("error");
      });
      rl.on("close", () => {
        console.log("closed");
        resolve();
      });
    });
    try {
      await myReadPromise;
    } catch (err) {
      console.log("an error has occurred");
    }

    console.log("done reading!");
  }

  async setElectionVoters(objectId, documentState, latMode = 0) {
    if (documentState["fileCount"] != 1) {
      return [false, "Multiple files uploaded"];
    }
    if (
      !Object.values(documentState["files"])[0].toLowerCase().endsWith(".csv")
    ) {
      return [false, "File is not a CSV"];
    }

    await FileInProcessing.initiate(
      objectId,
      FileInProcessing.requestType.votersFileSubmission.toString(),
      FileInProcessing.processingStatus.started.toString(),
      "Voter File Processing initiated for electionId: " +
        this.attributes.electionId
    );
    await this.update({
      votersFile: objectId,
    });

    const s3Key = Object.values(documentState["files"])[0];
    const s3OutputKey = s3Key + ".json";
    const input = "s3://" + uploadBucket + "/" + s3Key;
    const output = "s3://" + uploadBucket + "/" + s3OutputKey;

    const response = await s3CsvToJson({
      input: input,
      output: output,
    });

    if (response) {
      try {
        console.log("File converted.  Attempting to load JSON records");
        await this.loadVoterRecords(s3OutputKey, latMode);
        await this.update({ votersSet: true });

        // *************************************************************************
        // TODO:  Delete the original file and the converted file from S3
        // Now that voters have been added, all associated files in the upload bucket should be deleted.
        // Original zip  -- objectId
        // Extracted csv -- input
        // Converted json -- output
        //
        // As these contain PII, they should be deleted as soon as they are no longer needed.

        await FileInProcessing.incrementProgress(
          objectId,
          FileInProcessing.processingStatus.complete.toString(),
          "Voters loaded to electionId: " + this.attributes.electionId,
          FileInProcessing.requestType.votersFileSubmission.toString()
        );
        await this.update({
          votersFile: null,
        });

        return [true, JSON.stringify(response)];
      } catch (err) {
        console.log("Caught error: " + err);
        return [false, JSON.stringify(err)];
      }
    } else {
      console.log("No response from JSON coversion");
      return [false, "Error converting file"];
    }
  }

  async setElectionBallots(objectId, documentState) {
    await FileInProcessing.initiate(
      objectId,
      FileInProcessing.requestType.ballotsSubmission.toString(),
      FileInProcessing.processingStatus.started.toString(),
      "Ballot File initiated for electionId: " + this.attributes.electionId
    );

    await this.update({
      ballotsFile: objectId,
    });

    var functionSuccess = true,
      functionMessage = "";
    var ballotsUploaded = 0;
    for (const key in documentState["files"]) {
      const value = documentState["files"][key];
      const [success, message] = await DocumentInterface.copyFile(
        uploadBucket,
        documentBucket,
        value,
        this.allAttributes["electionId"] + "_" + key
      );
      functionSuccess = functionSuccess && success;
      functionMessage = functionMessage + message + " ";
      ballotsUploaded += 1;
    }
    if (functionSuccess) {
      await this.update({
        ballotsSet: true,
        ballotCount: documentState["fileCount"],
      });
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.complete.toString(),
        "Ballots loaded to electionId: " + this.attributes.electionId,
        FileInProcessing.requestType.ballotsSubmission.toString()
      );
      return [true, ""];
    } else {
      return [false, functionMessage];
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
